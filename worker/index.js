/**
 * m2w-leads — Cloudflare Worker
 * Por lead recebido:
 *   1. Cria/atualiza contato no Brevo (lista 2)
 *   2. Cria deal no CRM (Pipeline de oportunidades, stage "Novo")
 *   3. Vincula contato ao deal
 *   4. Cria funil de follow-up: Call D+1 · WhatsApp D+3 · Proposta D+7 · LinkedIn D+14
 */

const BREVO_API     = 'https://api.brevo.com/v3';
const LIST_ID       = 2;
const PIPELINE_ID   = '6a0d0fb86662659f87dbfd17';
const STAGE_NOVO    = 'd700c0e7-c2f4-4ba8-9c87-8d859c013029';
const OWNER_ID      = '6a0d0fb0b7e32cbb90056c9d'; // Silvio — CRM user ID
const EMAIL_TPL     = { welcome: 3, d3: 4, d7: 5, d14: 6 };

// Task type IDs
const TASK = {
  call:     '6a0d0fb86662659f87dbfd10',
  email:    '6a0d0fb86662659f87dbfd0f',
  todo:     '6a0d0fb86662659f87dbfd11',
  linkedin: '6a0d118ad42845438fc5ee8d',
};

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Returns an ISO date string N days from now at 09:00 Brasília (UTC-3)
function daysFromNow(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  d.setUTCHours(12, 0, 0, 0); // 09:00 BRT = 12:00 UTC
  return d.toISOString();
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: CORS });
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ ok: false, error: 'invalid_json' }, 400); }

    const {
      nome = '', email = '', empresa = '',
      whatsapp = '', servico = '', mensagem = ''
    } = body;

    if (!email || !nome) {
      return json({ ok: false, error: 'missing_fields' }, 400);
    }

    const key    = env.BREVO_API_KEY;
    const parts  = nome.trim().split(' ');
    const first  = parts[0] || '';
    const last   = parts.slice(1).join(' ') || '';

    let contactId = null;
    let dealId    = null;

    /* ── 1. Criar / atualizar contato ── */
    try {
      const res = await brevoPost(key, '/contacts', {
        email,
        attributes: {
          NOME: first, SOBRENOME: last,
          SMS: whatsapp, EMPRESA: empresa,
          SERVICO: servico, ORIGEM: 'm2w-ai.com',
        },
        listIds: [LIST_ID],
        updateEnabled: true,
      });

      if (res.status === 201) {
        contactId = (await res.json()).id ?? null;
      } else if (res.status === 204) {
        // já existia — busca pelo email
        const r = await brevoGet(key, `/contacts/${encodeURIComponent(email)}`);
        if (r.ok) contactId = (await r.json()).id ?? null;
      } else {
        console.error('contact error', res.status, await res.text());
      }
    } catch (e) { console.error('contact ex', e.message); }

    /* ── 2. Criar deal ── */
    try {
      const dealName = `Lead M2W — ${nome}${servico ? ' — ' + servico : ''}`;
      const desc     = [empresa && `Empresa: ${empresa}`, mensagem && `Mensagem: ${mensagem}`]
                         .filter(Boolean).join(' | ');

      const res = await brevoPost(key, '/crm/deals', {
        name:       dealName,
        stageId:    STAGE_NOVO,
        pipelineId: PIPELINE_ID,
        attributes: desc ? { deal_description: desc } : {},
      });

      if (res.ok) {
        dealId = (await res.json()).id ?? null;
      } else {
        console.error('deal error', res.status, await res.text());
      }
    } catch (e) { console.error('deal ex', e.message); }

    /* ── 3. Vincular contato ao deal ── */
    if (dealId && contactId) {
      try {
        await brevoPatch(key, `/crm/deals/${dealId}/link-unlink-contacts`,
          { linkContactIds: [contactId] });
      } catch (e) { console.error('link ex', e.message); }
    }

    /* ── 4. Funil de follow-up ── */
    if (dealId) {
      const followups = [
        {
          name:       `📞 Ligar para ${nome} — novo lead M2W`,
          taskTypeId: TASK.call,
          date:       daysFromNow(1),
          notes:      `Serviço: ${servico || 'não informado'} | WhatsApp: ${whatsapp || '—'} | Empresa: ${empresa || '—'}`,
          duration:   20,
        },
        {
          name:       `💬 WhatsApp follow-up — ${nome}`,
          taskTypeId: TASK.todo,
          date:       daysFromNow(3),
          notes:      `Lead sem resposta após call D+1. Enviar mensagem de follow-up no WhatsApp: ${whatsapp || email}`,
          duration:   10,
        },
        {
          name:       `📧 Enviar proposta por e-mail — ${nome}`,
          taskTypeId: TASK.email,
          date:       daysFromNow(7),
          notes:      `Proposta de ${servico || 'serviço M2W'}. Empresa: ${empresa || '—'}`,
          duration:   15,
        },
        {
          name:       `🔗 Conectar no LinkedIn — ${nome}`,
          taskTypeId: TASK.linkedin,
          date:       daysFromNow(14),
          notes:      `Follow-up final. Lead ${email} — ${empresa || ''}`,
          duration:   10,
        },
      ];

      await Promise.allSettled(
        followups.map(task =>
          brevoPost(key, '/crm/tasks', {
            ...task,
            done:       false,
            assignToId: OWNER_ID,
            dealsIds:   [dealId],
            ...(contactId ? { contactsIds: [contactId] } : {}),
          }).catch(e => console.error('task ex', task.name, e.message))
        )
      );
    }

    /* ── 5. Sequência de e-mails ── */
    const emailParams = { NOME_PRIMEIRO: first, SERVICO: servico || 'M2W' };
    const emailTo     = [{ email, name: nome }];

    const sequence = [
      { templateId: EMAIL_TPL.welcome, scheduledAt: null,            cc: [{ email: 'comercial@m2w-ai.com', name: 'Silvio Correia Filho' }] },
      { templateId: EMAIL_TPL.d3,  scheduledAt: daysFromNow(3) },    // D+3 09h BRT
      { templateId: EMAIL_TPL.d7,  scheduledAt: daysFromNow(7) },    // D+7 09h BRT
      { templateId: EMAIL_TPL.d14, scheduledAt: daysFromNow(14) },   // D+14 09h BRT
    ];

    await Promise.allSettled(
      sequence.map(({ templateId, scheduledAt, cc }) => {
        const payload = { templateId, to: emailTo, params: emailParams };
        if (scheduledAt) payload.scheduledAt = scheduledAt;
        if (cc) payload.cc = cc;
        return brevoPost(key, '/smtp/email', payload)
          .catch(e => console.error('email ex', templateId, e.message));
      })
    );

    return json({ ok: true, contactId, dealId });
  },
};

/* ── helpers ── */
function brevoPost(key, path, body) {
  return fetch(`${BREVO_API}${path}`, {
    method:  'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
}
function brevoPatch(key, path, body) {
  return fetch(`${BREVO_API}${path}`, {
    method:  'PATCH',
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
}
function brevoGet(key, path) {
  return fetch(`${BREVO_API}${path}`, { headers: { 'api-key': key } });
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
