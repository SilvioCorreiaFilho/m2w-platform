/**
 * m2w-leads — Cloudflare Worker v2.0
 * Por lead recebido:
 *   1. Cria/atualiza contato no Brevo (lista 2)
 *   2. Cria deal no CRM (Pipeline de oportunidades, stage "Novo")
 *   3. Vincula contato ao deal
 *   4. Funil de follow-up: Call D+1 · WhatsApp D+3 · Proposta D+7 · LinkedIn D+14
 *   5. Sequência de e-mails HTML direto (sem template IDs)
 */

const BREVO_API   = 'https://api.brevo.com/v3';
const LIST_ID     = 2;
const PIPELINE_ID = '6a0d0fb86662659f87dbfd17';
const STAGE_NOVO  = 'd700c0e7-c2f4-4ba8-9c87-8d859c013029';
const OWNER_ID    = '6a0d0fb0b7e32cbb90056c9d';

// Custom attributes to auto-create on cold start (Brevo ignores 400 if already exists)
const CUSTOM_ATTRS = ['PLATAFORMA', 'BUDGET', 'SETOR', 'VOLUME_ATUAL'];
let attrsReady = false;
async function ensureAttributes(key) {
  if (attrsReady) return;
  attrsReady = true;
  await Promise.allSettled(
    CUSTOM_ATTRS.map(name =>
      fetch(`${BREVO_API}/contacts/attributes/contact/${name}`, {
        method: 'POST',
        headers: { 'api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text' }),
      })
    )
  );
}

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

function daysFromNow(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  d.setUTCHours(12, 0, 0, 0);
  return d.toISOString();
}

// ── Email HTML builders ──────────────────────────────────────────────────────

function emailBase(content) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#060608;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#060608;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
  <tr><td style="padding-bottom:28px;text-align:center;">
    <img src="https://m2w-ai.com/logo-white.png" alt="M2W AI Solutions" height="28" style="display:block;margin:0 auto;">
  </td></tr>
  <tr><td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:36px 32px;">
    ${content}
  </td></tr>
  <tr><td style="padding-top:28px;text-align:center;">
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="padding-right:10px;vertical-align:middle;">
          <img src="https://m2w-ai.com/logo-white.png" alt="M2W" height="16" style="display:block;opacity:0.55;">
        </td>
        <td style="border-left:1px solid rgba(255,255,255,0.1);padding-left:10px;vertical-align:middle;">
          <p style="font-size:12px;color:rgba(255,255,255,0.45);margin:0;font-weight:500;">Silvio Correia Filho</p>
        </td>
      </tr>
    </table>
    <p style="font-size:11px;color:rgba(255,255,255,0.2);margin:10px 0 0;">
      Bras&iacute;lia, DF &nbsp;&middot;&nbsp;
      <a href="https://m2w-ai.com" style="color:rgba(200,169,126,0.55);text-decoration:none;">m2w-ai.com</a>
      &nbsp;&middot;&nbsp;
      <a href="https://wa.me/5561991533243" style="color:rgba(200,169,126,0.55);text-decoration:none;">WhatsApp +55 61 99153-3243</a>
    </p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

function statsRow() {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="width:32%;padding:14px 8px;background:rgba(200,169,126,0.08);border:1px solid rgba(200,169,126,0.2);border-radius:10px;text-align:center;">
      <p style="font-size:24px;font-weight:700;color:#C8A97E;margin:0 0 4px;">450%</p>
      <p style="font-size:9px;color:rgba(255,255,255,0.38);letter-spacing:1.5px;text-transform:uppercase;margin:0;">crescimento TikTok</p>
    </td>
    <td width="8"></td>
    <td style="width:32%;padding:14px 8px;background:rgba(200,169,126,0.08);border:1px solid rgba(200,169,126,0.2);border-radius:10px;text-align:center;">
      <p style="font-size:24px;font-weight:700;color:#C8A97E;margin:0 0 4px;">90%</p>
      <p style="font-size:9px;color:rgba(255,255,255,0.38);letter-spacing:1.5px;text-transform:uppercase;margin:0;">economia vs humano</p>
    </td>
    <td width="8"></td>
    <td style="width:32%;padding:14px 8px;background:rgba(200,169,126,0.08);border:1px solid rgba(200,169,126,0.2);border-radius:10px;text-align:center;">
      <p style="font-size:24px;font-weight:700;color:#C8A97E;margin:0 0 4px;">48h</p>
      <p style="font-size:9px;color:rgba(255,255,255,0.38);letter-spacing:1.5px;text-transform:uppercase;margin:0;">setup garantido</p>
    </td>
  </tr>
</table>`;
}

function ctaButton(text, url) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
  <tr><td align="center">
    <a href="${url}" style="display:inline-block;background:#C8A97E;color:#060608;font-weight:700;font-size:13px;letter-spacing:0.5px;padding:14px 32px;border-radius:8px;text-decoration:none;">${text}</a>
  </td></tr>
</table>`;
}

function buildWelcomeHtml(first, servico, perfil) {
  const servicoStr = servico && servico !== 'Chat M2W' ? servico : '';
  const perfilStr  = perfil
    ? `<p style="font-size:13px;color:rgba(255,255,255,0.4);line-height:1.7;margin:0 0 20px;border-left:2px solid rgba(200,169,126,0.35);padding-left:12px;">${perfil}</p>`
    : '';
  return emailBase(`
    <p style="font-size:22px;font-weight:600;color:#C8A97E;margin:0 0 6px;letter-spacing:-0.3px;">Ol&aacute;, ${first}! &#128075;</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:2.5px;text-transform:uppercase;margin:0 0 24px;font-family:'Courier New',monospace;">Recebemos seu contato</p>
    <p style="font-size:15px;color:rgba(255,255,255,0.72);line-height:1.85;margin:0 0 16px;">
      O <strong style="color:#f0f0f0;">Silvio Correia Filho</strong>, nosso fundador, foi acionado e vai entrar em contato em menos de <strong style="color:#C8A97E;">24 horas</strong> com uma an&aacute;lise personalizada para o seu neg&oacute;cio.
    </p>
    ${perfilStr}
    ${servicoStr ? `<p style="font-size:13px;color:rgba(255,255,255,0.45);margin:0 0 8px;">Interesse registrado: <strong style="color:#C8A97E;">${servicoStr}</strong></p>` : ''}
    ${statsRow()}
    ${ctaButton('Agendar conversa com Silvio &#8594;', 'https://calendly.com/silviofilhosf/nova-reuniao')}
  `);
}

function buildFollowHtml3(first, servico) {
  return emailBase(`
    <p style="font-size:18px;font-weight:600;color:#f0f0f0;margin:0 0 20px;">${first}, uma pergunta r&aacute;pida &#128172;</p>
    <p style="font-size:15px;color:rgba(255,255,255,0.72);line-height:1.85;margin:0 0 16px;">
      Voc&ecirc; teve chance de pensar sobre como um influencer digital de IA poderia impactar seu neg&oacute;cio${servico && servico !== 'Chat M2W' ? ' (' + servico + ')' : ''}?
    </p>
    <p style="font-size:15px;color:rgba(255,255,255,0.72);line-height:1.85;margin:0 0 20px;">
      Nossos clientes costumam se surpreender com a velocidade: <strong style="color:#C8A97E;">setup em 48h</strong> e resultados mensur&aacute;veis no primeiro trimestre. Quer agendar 15 min com o Silvio?
    </p>
    ${ctaButton('Escolher hor&aacute;rio &#8594;', 'https://calendly.com/silviofilhosf/nova-reuniao')}
  `);
}

function buildFollowHtml7(first, servico) {
  return emailBase(`
    <p style="font-size:18px;font-weight:600;color:#f0f0f0;margin:0 0 20px;">Comparativo para voc&ecirc;, ${first} &#128202;</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-collapse:collapse;">
      <tr style="background:rgba(255,255,255,0.04);">
        <td style="padding:10px 14px;font-size:11px;color:rgba(255,255,255,0.35);letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.06);"></td>
        <td style="padding:10px 14px;font-size:11px;color:rgba(255,255,255,0.35);letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.06);">Influencer Humano</td>
        <td style="padding:10px 14px;font-size:11px;color:#C8A97E;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.06);">M2W AI</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-size:13px;color:rgba(255,255,255,0.45);border-bottom:1px solid rgba(255,255,255,0.04);">30 posts/m&ecirc;s</td>
        <td style="padding:10px 14px;font-size:13px;color:#f87171;border-bottom:1px solid rgba(255,255,255,0.04);">R$30k&ndash;R$255k</td>
        <td style="padding:10px 14px;font-size:13px;color:#C8A97E;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.04);">R$1.990/m&ecirc;s</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-size:13px;color:rgba(255,255,255,0.45);border-bottom:1px solid rgba(255,255,255,0.04);">Disponibilidade</td>
        <td style="padding:10px 14px;font-size:13px;color:#f87171;border-bottom:1px solid rgba(255,255,255,0.04);">Hor&aacute;rio comercial</td>
        <td style="padding:10px 14px;font-size:13px;color:#C8A97E;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.04);">24/7</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-size:13px;color:rgba(255,255,255,0.45);">Garantia de ROI</td>
        <td style="padding:10px 14px;font-size:13px;color:#f87171;">Nenhuma</td>
        <td style="padding:10px 14px;font-size:13px;color:#C8A97E;font-weight:700;">Em contrato</td>
      </tr>
    </table>
    ${ctaButton('Ver proposta completa &#8594;', 'https://calendly.com/silviofilhosf/nova-reuniao')}
  `);
}

function buildFollowHtml14(first) {
  return emailBase(`
    <p style="font-size:18px;font-weight:600;color:#f0f0f0;margin:0 0 20px;">${first}, &uacute;ltimo recado &#128336;</p>
    <p style="font-size:15px;color:rgba(255,255,255,0.72);line-height:1.85;margin:0 0 16px;">
      N&atilde;o quero ser intrusivo &mdash; s&oacute; queria garantir que voc&ecirc; soubesse que nossa <strong style="color:#C8A97E;">garantia de ROI no 1&ordm; trimestre</strong> ainda est&aacute; dispon&iacute;vel.
    </p>
    <p style="font-size:15px;color:rgba(255,255,255,0.72);line-height:1.85;margin:0 0 20px;">
      Se surgir qualquer d&uacute;vida, pode responder este e-mail &mdash; o Silvio l&ecirc; tudo pessoalmente.
    </p>
    ${ctaButton('Agendar 15 min com Silvio &#8594;', 'https://calendly.com/silviofilhosf/nova-reuniao')}
  `);
}

// ── Main handler ─────────────────────────────────────────────────────────────

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
      whatsapp = '', servico = '', mensagem = '',
      plataforma = '', setor = '', volume_atual = '', budget = '',
      perfil = '', score = '',
    } = body;

    if (!email || !nome) {
      return json({ ok: false, error: 'missing_fields' }, 400);
    }

    const key = env.BREVO_API_KEY;
    await ensureAttributes(key);
    const parts = nome.trim().split(' ');
    const first = parts[0] || '';
    const last  = parts.slice(1).join(' ') || '';

    let contactId = null;
    let dealId    = null;

    /* ── 1. Criar / atualizar contato ── */
    try {
      const res = await brevoPost(key, '/contacts', {
        email,
        attributes: {
          FIRSTNAME: first, LASTNAME: last,
          SMS: whatsapp, EMPRESA: empresa,
          SERVICO: servico, ORIGEM: 'm2w-ai.com',
          PLATAFORMA: plataforma, BUDGET: budget,
          SETOR: setor, VOLUME_ATUAL: volume_atual,
        },
        listIds: [LIST_ID],
        updateEnabled: true,
      });

      if (res.status === 201) {
        contactId = (await res.json()).id ?? null;
        console.log('contact created', contactId);
      } else if (res.status === 204) {
        const r = await brevoGet(key, `/contacts/${encodeURIComponent(email)}`);
        if (r.ok) { contactId = (await r.json()).id ?? null; console.log('contact updated', contactId); }
      } else {
        const t = await res.text();
        console.error('contact error', res.status, t);
      }
    } catch (e) { console.error('contact ex', e.message); }

    /* ── 2. Criar deal ── */
    try {
      const dealName = `Lead M2W — ${nome}${servico ? ' — ' + servico : ''}`;
      const descParts = [
        empresa      && `Empresa: ${empresa}`,
        setor        && `Setor: ${setor}`,
        plataforma   && `Plataforma: ${plataforma}`,
        volume_atual && `Volume atual: ${volume_atual}`,
        budget       && `Budget: ${budget}`,
        perfil       && `Perfil: ${perfil}`,
        score        && `Score: ${score}`,
        mensagem     && `Origem: ${mensagem}`,
      ].filter(Boolean);

      const res = await brevoPost(key, '/crm/deals', {
        name:       dealName,
        stageId:    STAGE_NOVO,
        pipelineId: PIPELINE_ID,
        attributes: descParts.length ? { deal_description: descParts.join(' | ') } : {},
      });

      if (res.ok) {
        dealId = (await res.json()).id ?? null;
        console.log('deal created', dealId);
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
          notes:      `Score: ${score || '—'} | Serviço: ${servico || '—'} | Plataforma: ${plataforma || '—'} | Setor: ${setor || '—'} | Budget: ${budget || '—'} | Volume: ${volume_atual || '—'} | WA: ${whatsapp || '—'} | Perfil: ${perfil || '—'}`,
          duration:   20,
        },
        {
          name:       `💬 WhatsApp follow-up — ${nome}`,
          taskTypeId: TASK.todo,
          date:       daysFromNow(3),
          notes:      `Sem resposta após call. Contato: ${whatsapp || email}`,
          duration:   10,
        },
        {
          name:       `📧 Enviar proposta — ${nome}`,
          taskTypeId: TASK.email,
          date:       daysFromNow(7),
          notes:      `${servico || 'Serviço M2W'} | Empresa: ${empresa || '—'}`,
          duration:   15,
        },
        {
          name:       `🔗 LinkedIn — ${nome}`,
          taskTypeId: TASK.linkedin,
          date:       daysFromNow(14),
          notes:      `Follow-up final. ${email} — ${empresa || ''}`,
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

    /* ── 5. Sequência de e-mails HTML direto ── */
    const sender       = { email: 'comercial@m2w-ai.com', name: 'Mia — M2W AI Solutions' };
    const senderSilvio = { email: 'comercial@m2w-ai.com', name: 'Silvio — M2W AI Solutions' };
    const emailTo      = [{ email, name: nome }];
    const ccSilvio     = [{ email: 'comercial@m2w-ai.com', name: 'Silvio Correia Filho' }];

    const sequence = [
      {
        sender,
        to:          emailTo,
        cc:          ccSilvio,
        subject:     `Olá ${first}! Sua análise M2W está chegando ✨`,
        htmlContent: buildWelcomeHtml(first, servico, perfil),
        scheduledAt: null,
      },
      {
        sender:      senderSilvio,
        to:          emailTo,
        subject:     `${first}, uma pergunta rápida 💬`,
        htmlContent: buildFollowHtml3(first, servico),
        scheduledAt: daysFromNow(3),
      },
      {
        sender:      senderSilvio,
        to:          emailTo,
        subject:     `Comparativo: ${first} vs influencer humano 📊`,
        htmlContent: buildFollowHtml7(first, servico),
        scheduledAt: daysFromNow(7),
      },
      {
        sender:      senderSilvio,
        to:          emailTo,
        subject:     `${first}, último recado da M2W 👋`,
        htmlContent: buildFollowHtml14(first),
        scheduledAt: daysFromNow(14),
      },
    ];

    await Promise.allSettled(
      sequence.map(({ sender: s, to, cc, subject, htmlContent, scheduledAt }) => {
        const payload = { sender: s, to, subject, htmlContent };
        if (scheduledAt) payload.scheduledAt = scheduledAt;
        if (cc)          payload.cc = cc;
        return brevoPost(key, '/smtp/email', payload)
          .then(async r => {
            if (!r.ok) console.error('email err', subject, r.status, await r.text());
            else console.log('email queued', subject);
          })
          .catch(e => console.error('email ex', subject, e.message));
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
