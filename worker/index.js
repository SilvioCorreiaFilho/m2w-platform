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

/* Audit M2W: microservico isca-digital */
const GROQ_API   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const OWNER_EMAIL = 'comercial@m2w-ai.com';

// Custom attributes to auto-create on cold start (Brevo ignores 400 if already exists)
const CUSTOM_ATTRS = ['PLATAFORMA', 'BUDGET', 'SETOR', 'VOLUME_ATUAL', 'SITE_URL', 'REDES_SOCIAIS', 'REFERENCIAS', 'LEAD_TIER', 'LEAD_SOURCE'];

/* Lead tier classification: roteia tipo de email + prioridade comercial.
 *   quente: calculadora completa, ticket >= R$100, volume >= 30 posts/mes — recebe Audit M2W via Llama
 *   morno : form padrao com site/whatsapp/empresa preenchidos, ou chat com score >= medio — recebe welcome + deck PDF
 *   frio  : minimo (so nome+email), source desconhecido — recebe welcome basico apenas
 */
function classifyLeadTier(lead) {
  const calc = lead.calc || {};
  const score = (lead.score || '').toLowerCase();

  if (lead.source === 'audit') {
    const ticket = Number(calc.ticket_medio) || 0;
    const vol    = Number(calc.volume_posts_mes) || 0;
    if (ticket >= 100 && vol >= 30) return 'quente';
    if (ticket >= 50  || vol >= 30) return 'morno';
    return 'morno'; /* qualquer audit submit ja e morno minimo */
  }

  if (score === 'alto')  return 'quente';
  if (score === 'medio') return 'morno';

  /* Form padrao: classifica por riqueza dos dados */
  const richness = [lead.empresa, lead.whatsapp, lead.site, lead.redes, lead.servico]
    .filter(v => v && String(v).trim()).length;
  if (richness >= 3) return 'morno';
  return 'frio';
}
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
// Design editorial portado dos templates standalone em worker/*.html.
// Hibrido de paleta: deep #06060e como base (igual landing) + gold #C8A97E
// como acento warm para CTAs e dividers (assinatura propria de email).

const MAIL_DEEP   = '#06060e';
const MAIL_CARD   = '#0d0d11';
const MAIL_RULE   = '#1c1c22';
const MAIL_GOLD   = '#C8A97E';
const MAIL_INK    = '#f5f5f5';
const MAIL_BODY   = '#ababab';
const MAIL_QUIET  = '#6b6b6b';
const MAIL_FONT_S = "-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif";
const MAIL_FONT_D = "Georgia,'Times New Roman',serif";
const MAIL_FONT_M = "'Courier New',Courier,monospace";

function htmlEscape(s) {
  return String(s || '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function mailtoHref(subject) {
  return `mailto:comercial@m2w-ai.com?subject=${encodeURIComponent(subject)}`;
}

function emailShell(preheader, eyebrow, content, opts = {}) {
  const { hairlineColor = MAIL_GOLD } = opts;
  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>M2W</title>
<style>
@media only screen and (max-width:600px){
  .wrap{width:100%!important;padding:0 20px!important;box-sizing:border-box!important}
  .card{padding:40px 28px!important}
  .hl{font-size:32px!important}
  .stats td,.roi-row td{display:block!important;width:100%!important;padding:18px 0!important;border-right:none!important;border-bottom:1px solid ${MAIL_RULE}!important;text-align:left!important}
  .stats td:last-child,.roi-row td:last-child{border-bottom:none!important}
  .logo{width:130px!important}
}
</style>
</head>
<body style="margin:0;padding:0;background:${MAIL_DEEP};font-family:${MAIL_FONT_S};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&#8203;&#65279;&#847;</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${MAIL_DEEP};">
<tr><td align="center" style="padding:48px 16px 0;">
<table class="wrap" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;">
  <tr><td style="padding:0 0 40px;">
    <img class="logo" src="https://m2w-ai.com/logo-white.png" width="140" alt="M2W" style="display:block;width:140px;height:auto;opacity:0.95;">
  </td></tr>
  <tr><td><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background:${hairlineColor};">&nbsp;</td></tr></table></td></tr>
  <tr><td class="card" style="background:${MAIL_CARD};border-left:1px solid ${MAIL_RULE};border-right:1px solid ${MAIL_RULE};border-bottom:1px solid ${MAIL_RULE};padding:52px 52px 48px;">
    ${eyebrow ? `<p style="margin:0 0 20px;font-size:9px;font-weight:400;letter-spacing:5px;text-transform:uppercase;color:${MAIL_GOLD};font-family:${MAIL_FONT_M};">${eyebrow}</p>` : ''}
    ${content}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px;"><tr><td style="height:1px;background:${MAIL_RULE};">&nbsp;</td></tr></table>
    <table cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="vertical-align:middle;padding-right:18px;">
          <table cellpadding="0" cellspacing="0" border="0"><tr><td style="width:44px;height:44px;border:1px solid ${MAIL_GOLD};text-align:center;line-height:44px;font-size:12px;color:${MAIL_GOLD};font-family:${MAIL_FONT_M};letter-spacing:2px;">SC</td></tr></table>
        </td>
        <td style="vertical-align:middle;">
          <p style="margin:0 0 4px;font-size:14px;color:${MAIL_INK};letter-spacing:-0.01em;">Silvio Correia Filho</p>
          <p style="margin:0;font-size:9px;color:${MAIL_QUIET};font-family:${MAIL_FONT_M};letter-spacing:3px;text-transform:uppercase;">Founder &middot; M2W AI Solutions</p>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background:${MAIL_RULE};">&nbsp;</td></tr></table></td></tr>
  <tr><td style="padding:32px 0 52px;text-align:center;">
    <!-- QR Venha! -->
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 22px;">
      <tr><td align="center">
        <a href="https://m2w-ai.com" style="text-decoration:none;display:inline-block;">
          <img src="https://m2w-ai.com/public/qr-venha.png" alt="QR M2W Venha!" width="96" height="120" style="display:block;border:0;outline:none;">
        </a>
      </td></tr>
    </table>
    <p style="margin:0 0 10px;">
      <a href="https://m2w-ai.com" style="font-family:${MAIL_FONT_M};font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#666;text-decoration:none;">m2w-ai.com</a>
      <span style="color:#222;padding:0 12px;">&middot;</span>
      <a href="mailto:comercial@m2w-ai.com" style="font-family:${MAIL_FONT_M};font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#666;text-decoration:none;">comercial@m2w-ai.com</a>
      <span style="color:#222;padding:0 12px;">&middot;</span>
      <a href="https://wa.me/5561991533243" style="font-family:${MAIL_FONT_M};font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#666;text-decoration:none;">WhatsApp</a>
    </p>
    <p style="margin:0;font-size:11px;line-height:1.7;color:#2a2a2a;">
      Voc&ecirc; recebeu este e-mail porque preencheu o formul&aacute;rio em m2w-ai.com.<br>
      <a href="https://m2w-ai.com" style="color:#2a2a2a;text-decoration:underline;">Descadastrar</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function pullQuote(text, color = MAIL_GOLD, italic = true) {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 30px;">
  <tr>
    <td width="1" style="background:${color};">&nbsp;</td>
    <td width="28">&nbsp;</td>
    <td style="padding:20px 0;">
      <p style="margin:0;font-family:${MAIL_FONT_D};font-size:18px;${italic ? 'font-style:italic;' : ''}font-weight:400;line-height:1.60;color:${MAIL_INK};">${text}</p>
    </td>
  </tr>
</table>`;
}

function ctaOutline(text, href) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 44px;">
  <tr><td style="border:1px solid ${MAIL_GOLD};">
    <a href="${href}" style="display:block;padding:15px 40px;font-family:${MAIL_FONT_M};font-size:10px;font-weight:400;letter-spacing:4px;text-transform:uppercase;color:${MAIL_GOLD};text-decoration:none;white-space:nowrap;">${text}&nbsp;&rarr;</a>
  </td></tr>
</table>`;
}

function ctaSolid(text, href) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
  <tr><td style="background:${MAIL_GOLD};">
    <a href="${href}" style="display:block;padding:16px 44px;font-family:${MAIL_FONT_M};font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${MAIL_DEEP};text-decoration:none;white-space:nowrap;">${text}&nbsp;&rarr;</a>
  </td></tr>
</table>`;
}

function buildWelcomeHtml(first, servico, perfil, tier = 'morno') {
  const f = htmlEscape(first);
  const s = htmlEscape(servico && servico !== 'Chat M2W' ? servico : '');
  const p = htmlEscape(perfil);
  const subj = `Re: ${first}, M2W`;

  /* Bloco extra de deck PDF + cases pra leads morno/frio
   * (quente recebe Audit Llama personalizado, nao precisa) */
  const deckBlock = tier !== 'quente' ? `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px;">
      <tr><td style="border:1px solid ${MAIL_GOLD};border-radius:4px;padding:24px 28px;">
        <p style="margin:0 0 8px;font-size:9px;font-weight:400;letter-spacing:5px;text-transform:uppercase;color:${MAIL_GOLD};font-family:${MAIL_FONT_M};">Material completo</p>
        <p style="margin:0 0 16px;font-size:14px;font-weight:400;line-height:1.7;color:${MAIL_BODY};">Enquanto eu preparo seu contato, da uma olhada no deck M2W: cases reais (Mia Park, Luna Chen, Sofia Reyes), comparativo de custo vs influencer humano, e a tecnologia que esta por tras (LTX-2.3, Higgsfield, ComfyUI).</p>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr><td style="border:1px solid ${MAIL_GOLD};">
            <a href="https://m2w-ai.com/public/m2w-deck.pdf" style="display:block;padding:13px 28px;font-family:${MAIL_FONT_M};font-size:10px;font-weight:400;letter-spacing:4px;text-transform:uppercase;color:${MAIL_GOLD};text-decoration:none;white-space:nowrap;">Baixar deck completo &nbsp;&rarr;</a>
          </td></tr>
        </table>
      </td></tr>
    </table>` : '';

  const content = `
    <h1 class="hl" style="margin:0 0 32px;font-family:${MAIL_FONT_D};font-size:46px;font-weight:400;font-style:italic;line-height:1.08;color:${MAIL_INK};letter-spacing:-0.025em;">${f}.</h1>
    <p style="margin:0 0 20px;font-size:15px;font-weight:400;line-height:1.80;color:${MAIL_BODY};">Acabei de ver sua solicita&ccedil;&atilde;o. N&atilde;o &eacute; autoresposta: sou eu, Silvio, lendo cada pedido antes de responder.</p>
    <p style="margin:0 0 20px;font-size:15px;font-weight:400;line-height:1.80;color:${MAIL_BODY};">Marcas que estruturam presen&ccedil;a com IA agora est&atilde;o criando vantagem que dificilmente ser&aacute; revertida. As que chegam depois competem por migalhas do mercado.</p>
    ${p ? `<p style="margin:0 0 20px;font-size:13px;font-style:italic;line-height:1.7;color:${MAIL_QUIET};border-left:1px solid ${MAIL_GOLD};padding-left:14px;">Voc&ecirc; descreveu: <span style="color:${MAIL_INK};">${p}</span></p>` : ''}
    ${s ? `<p style="margin:0 0 20px;font-size:13px;font-weight:400;line-height:1.7;color:${MAIL_BODY};">Interesse registrado: <strong style="color:${MAIL_GOLD};font-weight:400;">${s}</strong></p>` : ''}
    <p style="margin:0 0 30px;font-size:15px;font-weight:400;line-height:1.80;color:${MAIL_BODY};">Antes de qualquer proposta, uma pergunta direta:</p>
    ${pullQuote('&ldquo;Qual &eacute; o custo real, em tempo, dinheiro e oportunidade perdida, do conte&uacute;do que voc&ecirc; produz hoje?&rdquo;')}
    <p style="margin:0 0 36px;font-size:15px;font-weight:400;line-height:1.80;color:${MAIL_BODY};">Responde aqui neste e-mail. Duas linhas mudam completamente o que vou preparar para a nossa conversa.</p>
    ${ctaOutline('Responder agora', mailtoHref(subj))}
    ${deckBlock}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 40px;"><tr><td style="height:1px;background:${MAIL_RULE};">&nbsp;</td></tr></table>
    <p style="margin:0 0 28px;font-size:9px;font-weight:400;letter-spacing:5px;text-transform:uppercase;color:${MAIL_QUIET};font-family:${MAIL_FONT_M};">O que entregamos</p>
    <table class="stats" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 44px;">
      <tr>
        <td style="width:33%;padding-right:28px;border-right:1px solid ${MAIL_RULE};vertical-align:top;">
          <p style="margin:0 0 8px;font-family:${MAIL_FONT_D};font-size:38px;font-weight:400;font-style:italic;color:${MAIL_INK};line-height:1;">450%</p>
          <p style="margin:0;font-size:11px;font-weight:400;line-height:1.60;color:${MAIL_QUIET};">Crescimento m&eacute;dio em TikTok Shop nos primeiros 6 meses.</p>
        </td>
        <td style="width:28px;">&nbsp;</td>
        <td style="width:33%;padding:0 28px;border-right:1px solid ${MAIL_RULE};vertical-align:top;">
          <p style="margin:0 0 8px;font-family:${MAIL_FONT_D};font-size:38px;font-weight:400;font-style:italic;color:${MAIL_INK};line-height:1;">&minus;90%</p>
          <p style="margin:0;font-size:11px;font-weight:400;line-height:1.60;color:${MAIL_QUIET};">De custo por asset vs. influencer humano com exclusividade.</p>
        </td>
        <td style="width:28px;">&nbsp;</td>
        <td style="width:33%;padding-left:28px;vertical-align:top;">
          <p style="margin:0 0 8px;font-family:${MAIL_FONT_D};font-size:38px;font-weight:400;font-style:italic;color:${MAIL_INK};line-height:1;">48h</p>
          <p style="margin:0;font-size:11px;font-weight:400;line-height:1.60;color:${MAIL_QUIET};">Da proposta aprovada ao avatar publicando.</p>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 36px;"><tr><td style="height:1px;background:${MAIL_RULE};">&nbsp;</td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 44px;">
      <tr>
        <td style="border:1px solid ${MAIL_RULE};padding:24px 28px;">
          <p style="margin:0 0 8px;font-size:9px;font-weight:400;letter-spacing:5px;text-transform:uppercase;color:${MAIL_GOLD};font-family:${MAIL_FONT_M};">Janela de mercado</p>
          <p style="margin:0;font-size:14px;font-weight:400;line-height:1.75;color:#888;">TikTok Shop com IA generativa ainda est&aacute; em fase de baixa concorr&ecirc;ncia no Brasil. Quem estrutura o canal agora define o padr&atilde;o e captura audi&ecirc;ncia org&acirc;nica antes que o custo de aquisi&ccedil;&atilde;o suba. <span style="color:${MAIL_INK};">Cada semana importa.</span></p>
        </td>
      </tr>
    </table>`;
  return emailShell('Vi seu formul&aacute;rio. Sou eu, Silvio, com uma pergunta antes de falarmos.', 'Mensagem direta', content);
}

function buildFollowHtml3(first, servico) {
  const f = htmlEscape(first);
  const subj = `Quero agendar, ${first}`;
  const content = `
    <h1 class="hl" style="margin:0 0 32px;font-family:${MAIL_FONT_D};font-size:40px;font-weight:400;font-style:italic;line-height:1.1;color:${MAIL_INK};letter-spacing:-0.02em;">${f}, deixa eu ser direto.</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.80;color:${MAIL_BODY};">Tentei te ligar. Se n&atilde;o foi um bom momento, sem problema. N&atilde;o queria deixar passar sem mostrar uma conta simples.</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr><td style="background:#111;border:1px solid ${MAIL_RULE};padding:28px 32px;">
        <p style="margin:0 0 16px;font-size:9px;font-weight:400;letter-spacing:5px;text-transform:uppercase;color:${MAIL_GOLD};font-family:${MAIL_FONT_M};">A conta que ningu&eacute;m faz</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid ${MAIL_RULE};"><p style="margin:0;font-size:13px;color:#888;">Micro-influencer &middot; 30 posts/m&ecirc;s</p></td>
            <td style="padding:10px 0;border-bottom:1px solid ${MAIL_RULE};text-align:right;"><p style="margin:0;font-family:${MAIL_FONT_D};font-size:15px;font-style:italic;color:${MAIL_INK};">R$30.000&ndash;R$80.000</p></td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid ${MAIL_RULE};"><p style="margin:0;font-size:13px;color:#888;">Ag&ecirc;ncia tradicional &middot; gest&atilde;o mensal</p></td>
            <td style="padding:10px 0;border-bottom:1px solid ${MAIL_RULE};text-align:right;"><p style="margin:0;font-family:${MAIL_FONT_D};font-size:15px;font-style:italic;color:${MAIL_INK};">R$8.000&ndash;R$25.000</p></td>
          </tr>
          <tr>
            <td style="padding:12px 0 0;"><p style="margin:0;font-size:13px;color:${MAIL_GOLD};font-weight:400;">M2W &middot; avatar exclusivo &middot; ilimitado</p></td>
            <td style="padding:12px 0 0;text-align:right;"><p style="margin:0;font-family:${MAIL_FONT_D};font-size:18px;font-style:italic;color:${MAIL_GOLD};">a partir de R$2.490</p></td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.80;color:${MAIL_BODY};">N&atilde;o &eacute; desconto. &Eacute; um modelo diferente: custo fixo, volume escal&aacute;vel, sem cach&ecirc;, sem agenda, sem renegocia&ccedil;&atilde;o.</p>
    <p style="margin:0 0 36px;font-size:15px;line-height:1.80;color:${MAIL_BODY};">15 minutos de conversa e consigo te mostrar exatamente o que faz sentido para o seu caso. Quando &eacute; bom para voc&ecirc;?</p>
    ${ctaOutline('Agendar 15 minutos', mailtoHref(subj))}`;
  return emailShell('Deixa eu ser mais direto. Te mostro uma conta que muda tudo.', 'Follow-up &middot; D+3', content);
}

function buildFollowHtml7(first, servico) {
  const f = htmlEscape(first);
  const s = htmlEscape(servico && servico !== 'Chat M2W' ? servico : '');
  const subj = `Quero a proposta completa, ${first}`;
  const content = `
    <h1 class="hl" style="margin:0 0 32px;font-family:${MAIL_FONT_D};font-size:40px;font-weight:400;font-style:italic;line-height:1.1;color:${MAIL_INK};letter-spacing:-0.02em;">Uma proposta concreta para ${f}.</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.80;color:${MAIL_BODY};">Com base no que voc&ecirc; informou${s ? ` sobre <strong style="color:${MAIL_INK};font-weight:400;">${s}</strong>` : ''}, montei o cen&aacute;rio que faz mais sentido para o seu neg&oacute;cio agora.</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr><td style="background:#0a0a0a;border:1px solid ${MAIL_RULE};padding:28px 32px;">
        <p style="margin:0 0 20px;font-size:9px;font-weight:400;letter-spacing:5px;text-transform:uppercase;color:${MAIL_GOLD};font-family:${MAIL_FONT_M};">Proje&ccedil;&atilde;o de retorno &middot; 90 dias</p>
        <table class="roi-row" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="width:32%;padding-right:20px;border-right:1px solid ${MAIL_RULE};vertical-align:top;">
              <p style="margin:0 0 6px;font-family:${MAIL_FONT_D};font-size:30px;font-style:italic;color:${MAIL_INK};line-height:1;">30&times;</p>
              <p style="margin:0;font-size:11px;color:${MAIL_QUIET};line-height:1.5;">Mais conte&uacute;do vs. produ&ccedil;&atilde;o interna.</p>
            </td>
            <td style="width:20px;">&nbsp;</td>
            <td style="width:32%;padding:0 20px;border-right:1px solid ${MAIL_RULE};vertical-align:top;">
              <p style="margin:0 0 6px;font-family:${MAIL_FONT_D};font-size:30px;font-style:italic;color:${MAIL_INK};line-height:1;">300%</p>
              <p style="margin:0;font-size:11px;color:${MAIL_QUIET};line-height:1.5;">ROI garantido no 1&ordm; trimestre.</p>
            </td>
            <td style="width:20px;">&nbsp;</td>
            <td style="width:32%;padding-left:20px;vertical-align:top;">
              <p style="margin:0 0 6px;font-family:${MAIL_FONT_D};font-size:30px;font-style:italic;color:${MAIL_GOLD};line-height:1;">0</p>
              <p style="margin:0;font-size:11px;color:${MAIL_QUIET};line-height:1.5;">Custo adicional se a meta n&atilde;o for atingida.</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
    ${pullQuote('&ldquo;Se o ROI n&atilde;o aparecer no primeiro trimestre, continuamos sem custo adicional at&eacute; aparecer.&rdquo;')}
    <p style="margin:0 0 20px;font-size:15px;line-height:1.80;color:${MAIL_BODY};">Essa &eacute; a garantia que damos para cada cliente. N&atilde;o por marketing: porque o modelo funciona quando aplicado corretamente.</p>
    <p style="margin:0 0 36px;font-size:15px;line-height:1.80;color:${MAIL_BODY};">Responde aqui e te envio a proposta completa com escopo, entreg&aacute;veis e cronograma em menos de 24h.</p>
    ${ctaSolid('Ver proposta completa', mailtoHref(subj))}
    <p style="margin:0 0 44px;font-size:12px;line-height:1.6;color:${MAIL_QUIET};font-family:${MAIL_FONT_M};letter-spacing:1px;">Ou responda com &ldquo;quero proposta&rdquo;. Envio em menos de 24h.</p>`;
  return emailShell('Montei uma proposta espec&iacute;fica para o seu neg&oacute;cio. Pode dar uma olhada?', 'Proposta &middot; D+7', content);
}

function buildFollowHtml14(first) {
  const f = htmlEscape(first);
  const subj = `Quero conversar, ${first}`;
  const content = `
    <h1 class="hl" style="margin:0 0 32px;font-family:${MAIL_FONT_D};font-size:40px;font-weight:400;font-style:italic;line-height:1.1;color:${MAIL_INK};letter-spacing:-0.02em;">${f}, encerro por aqui.</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.80;color:${MAIL_BODY};">Entrei em contato algumas vezes ao longo das &uacute;ltimas duas semanas. Se n&atilde;o avan&ccedil;amos, provavelmente o timing n&atilde;o &eacute; esse. E tudo bem.</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.80;color:${MAIL_BODY};">N&atilde;o vou mais te contatar de forma proativa. Este &eacute; o &uacute;ltimo e-mail desta sequ&ecirc;ncia.</p>
    ${pullQuote('&ldquo;O mercado de TikTok Shop com IA no Brasil ainda est&aacute; em forma&ccedil;&atilde;o. Quem entrar nos pr&oacute;ximos 60 dias captura audi&ecirc;ncia org&acirc;nica que dificilmente estar&aacute; dispon&iacute;vel depois.&rdquo;', '#333', true)}
    <p style="margin:0 0 20px;font-size:15px;line-height:1.80;color:${MAIL_BODY};">Quando o timing for certo (semana que vem, no pr&oacute;ximo trimestre, no ano que vem), estarei aqui.</p>
    <p style="margin:0 0 36px;font-size:15px;line-height:1.80;color:${MAIL_BODY};">Basta responder este e-mail com &ldquo;quero conversar&rdquo; e retomo em menos de 24h, sem precisar preencher nada de novo.</p>
    ${ctaOutline('Retomar quando estiver pronto', mailtoHref(subj))}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 40px;">
      <tr><td style="background:#0a0a0a;border:1px solid #161616;padding:24px 28px;">
        <p style="margin:0;font-size:13px;line-height:1.75;color:${MAIL_QUIET};">Para continuar acompanhando o que estamos fazendo (casos, resultados, novidades do mercado de IA), voc&ecirc; pode acessar <a href="https://m2w-ai.com" style="color:${MAIL_GOLD};text-decoration:none;">m2w-ai.com</a> quando quiser. Sem obriga&ccedil;&atilde;o.</p>
      </td></tr>
    </table>`;
  return emailShell('Vou encerrar por aqui. Deixo uma porta aberta se fizer sentido mais pra frente.', '&Uacute;ltimo contato &middot; D+14', content, { hairlineColor: '#333' });
}

// ── Main handler ─────────────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: CORS });
    }

    const url = new URL(request.url);

    /* ── Endpoint /audit: gera diagnostico via Llama, salva em Supabase, envia 2 emails ── */
    if (url.pathname === '/audit') {
      return handleAudit(request, env, ctx);
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ ok: false, error: 'invalid_json' }, 400); }

    const {
      nome = '', email = '', empresa = '',
      whatsapp = '', servico = '', mensagem = '',
      site = '', redes = '', referencias = '',
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
    let contactError = null;

    /* Classifica tier do lead (quente/morno/frio) — roteia email + prioridade CRM */
    const leadTier = classifyLeadTier({
      source: body.source || (body.servico === 'Chat M2W' ? 'chat' : 'form'),
      score, empresa, whatsapp, site, redes, servico, calc: body.calc,
    });
    const leadSource = body.source || (body.servico === 'Chat M2W' ? 'chat' : 'form');

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
          SITE_URL: site, REDES_SOCIAIS: redes, REFERENCIAS: referencias,
          LEAD_TIER: leadTier, LEAD_SOURCE: leadSource,
        },
        listIds: [LIST_ID],
        updateEnabled: true,
      });

      if (res.status === 201) {
        contactId = (await res.json()).id ?? null;
        console.log('contact created', contactId);
      } else if (res.status === 204) {
        const r = await brevoGet(key, `/contacts/${encodeURIComponent(email)}`);
        if (r.ok) {
          contactId = (await r.json()).id ?? null;
          console.log('contact updated', contactId);
        } else {
          contactError = `contact-get ${r.status}: ${(await r.text()).slice(0, 240)}`;
          console.error('contact-get error', contactError);
        }
      } else {
        contactError = `contact-post ${res.status}: ${(await res.text()).slice(0, 240)}`;
        console.error('contact error', contactError);
      }
    } catch (e) {
      contactError = `contact-exception: ${e.message}`;
      console.error('contact ex', contactError);
    }

    /* ── 2. Criar deal ── */
    try {
      const tierTag = leadTier === 'quente' ? '🔥' : leadTier === 'morno' ? '🌡️' : '❄️';
      const dealName = `${tierTag} ${nome}${servico ? ' · ' + servico : ''}`;
      /* sempre incluir contato no topo da descricao para garantir que vendedor
       * encontre o lead mesmo se o contato Brevo nao tiver sido criado */
      const descParts = [
        `Tier: ${leadTier.toUpperCase()} | Source: ${leadSource}`,
        `Nome: ${nome}`,
        `Email: ${email}`,
        whatsapp     && `WhatsApp: ${whatsapp}`,
        empresa      && `Empresa: ${empresa}`,
        site         && `Site: ${site}`,
        redes        && `Redes sociais: ${redes}`,
        servico      && `Servico: ${servico}`,
        setor        && `Setor: ${setor}`,
        plataforma   && `Plataforma: ${plataforma}`,
        volume_atual && `Volume atual: ${volume_atual}`,
        budget       && `Budget: ${budget}`,
        referencias  && `Referencias: ${referencias}`,
        perfil       && `Perfil: ${perfil}`,
        score        && `Score: ${score}`,
        mensagem     && `Origem/Mensagem: ${mensagem}`,
        contactError && `[debug contato] ${contactError}`,
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
    const sender   = { email: 'comercial@m2w-ai.com', name: 'Silvio Correia Filho · M2W' };
    const emailTo  = [{ email, name: nome }];
    const ccSilvio = [{ email: 'comercial@m2w-ai.com', name: 'Silvio Correia Filho' }];

    /* Roteamento por tier:
     *   - quente: Audit Llama (gerado via /audit endpoint, nao via aqui)
     *   - morno : welcome enriquecido com deck PDF + D+3 follow-up
     *   - frio  : welcome basico, sem D+3 (so D+7 e D+14 via cron, se sobreviver)
     */
    const sequence = [
      {
        sender,
        to:          emailTo,
        cc:          ccSilvio,
        subject:     leadTier === 'morno' ? `${first}, sua proposta M2W` : `${first}.`,
        htmlContent: buildWelcomeHtml(first, servico, perfil, leadTier),
      },
    ];

    /* D+3 follow-up so para morno (frio recebe apenas via cron diario se sobreviver) */
    if (leadTier === 'morno') {
      sequence.push({
        sender,
        to:          emailTo,
        subject:     `${first}, deixa eu ser direto`,
        htmlContent: buildFollowHtml3(first, servico),
        scheduledAt: daysFromNow(3),
      });
    }

    const emailResults = await Promise.allSettled(
      sequence.map(async ({ sender: s, to, cc, subject, htmlContent, scheduledAt }) => {
        const payload = { sender: s, to, subject, htmlContent };
        if (scheduledAt) payload.scheduledAt = scheduledAt;
        if (cc)          payload.cc = cc;
        const r = await brevoPost(key, '/smtp/email', payload);
        if (!r.ok) {
          const errText = await r.text();
          console.error('email err', subject, r.status, errText);
          return { subject, status: r.status, error: errText };
        }
        const body = await r.json().catch(() => ({}));
        console.log('email queued', subject, body.messageId || '');
        return { subject, status: 200, messageId: body.messageId };
      })
    );

    const emailErrors = emailResults
      .filter(r => r.status === 'rejected' || r.value?.error)
      .map(r => r.reason?.message || r.value?.error || 'unknown');

    return json({
      ok: true,
      contactId,
      dealId,
      contactError: contactError || undefined,
      emailErrors: emailErrors.length ? emailErrors : undefined,
    });
  },

  /* ── Cron Trigger: roda 1x/dia, despacha D+7 e D+14 ─────────────────────────
   * Brevo transactional `scheduledAt` so aceita ate 72h, entao D+7 e D+14
   * precisam de execucao separada. Este handler escaneia todos os deals
   * da pipeline e dispara o follow-up apropriado para os que tem idade exata.
   * Marca [D7_SENT] / [D14_SENT] na descricao para evitar duplicatas.
   */
  async scheduled(event, env, ctx) {
    const key = env.BREVO_API_KEY;
    if (!key) return;
    await ensureAttributes(key);

    /* Listar deals da pipeline com paginacao (max ~10 paginas por seguranca) */
    const allDeals = [];
    let offset = 0;
    const limit = 100;
    for (let page = 0; page < 10; page++) {
      const r = await brevoGet(
        key,
        `/crm/deals?limit=${limit}&offset=${offset}` +
        `&filter[pipeline]=${PIPELINE_ID}`,
      );
      if (!r.ok) {
        console.error('cron deals list error', r.status, await r.text());
        break;
      }
      const data = await r.json().catch(() => ({}));
      const items = data.items || [];
      allDeals.push(...items);
      if (items.length < limit) break;
      offset += limit;
    }
    console.log('cron scanning', allDeals.length, 'deals');

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const followups = [
      {
        days:    7,
        marker:  '[D7_SENT]',
        subject: first => `Uma proposta concreta para ${first}`,
        build:   (first, servico) => buildFollowHtml7(first, servico),
      },
      {
        days:    14,
        marker:  '[D14_SENT]',
        subject: first => `${first}, encerro por aqui`,
        build:   first => buildFollowHtml14(first),
      },
    ];

    let dispatched = 0;
    let skipped = 0;
    let errors = 0;

    for (const fu of followups) {
      const targetTime = now - fu.days * oneDay;
      const windowMin = targetTime - oneDay / 2;
      const windowMax = targetTime + oneDay / 2;

      for (const deal of allDeals) {
        const createdAt = new Date(deal.createdAt || deal.created_at || 0).getTime();
        if (createdAt < windowMin || createdAt > windowMax) { continue; }
        const desc = deal.attributes?.deal_description || '';
        if (desc.includes(fu.marker)) { skipped++; continue; }

        const contactIds = deal.linkedContactsIds || deal.attributes?.linkedContactsIds || [];
        if (contactIds.length === 0) { skipped++; continue; }

        try {
          const cr = await brevoGet(key, `/contacts/${contactIds[0]}`);
          if (!cr.ok) { errors++; continue; }
          const contact = await cr.json();
          const first = contact.attributes?.FIRSTNAME || (contact.email || '').split('@')[0];
          const toEmail = contact.email;
          const servico = contact.attributes?.SERVICO || '';
          if (!toEmail) { skipped++; continue; }

          const er = await brevoPost(key, '/smtp/email', {
            sender: { email: 'comercial@m2w-ai.com', name: 'Silvio Correia Filho · M2W' },
            to:      [{ email: toEmail, name: first }],
            subject: fu.subject(first),
            htmlContent: fu.build(first, servico),
          });

          if (!er.ok) {
            console.error('cron email error', deal.id, er.status, (await er.text()).slice(0, 200));
            errors++;
            continue;
          }

          /* Marca o deal como enviado */
          await brevoPatch(key, `/crm/deals/${deal.id}`, {
            attributes: { deal_description: (desc + ' | ' + fu.marker).slice(0, 4000) },
          }).catch(e => console.error('cron mark error', deal.id, e.message));
          dispatched++;
        } catch (e) {
          console.error('cron deal ex', deal.id, e.message);
          errors++;
        }
      }
    }

    console.log('cron summary', { dispatched, skipped, errors });
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

/* ═══════════════════════════════════════════════════════════════════════════
 * AUDIT M2W — Isca digital
 *
 * Fluxo:
 *   1. Lead submete calculadora -> POST /audit { nome, email, site, calc, lang }
 *   2. Worker salva lead em Supabase + Brevo (atualiza contact + cria deal)
 *   3. Worker retorna 200 imediato (UX rapida); enfileira evaluacao via ctx.waitUntil
 *   4. Em background: chama Llama 3.3-70b 2x (lead-facing + owner-facing)
 *   5. Persiste evaluations em Supabase
 *   6. Envia email para o LEAD com a versao pain-pointing (CTA = call Calendly)
 *   7. Envia email para SILVIO (owner) com diagnostico completo + proposta financeira
 * ═══════════════════════════════════════════════════════════════════════════ */

async function handleAudit(request, env, ctx) {
  let payload;
  try { payload = await request.json(); }
  catch { return json({ ok: false, error: 'invalid_json' }, 400); }

  const {
    nome = '', email = '', site = '', redes = '', referencias = '',
    empresa = '', whatsapp = '', servico = 'Audit M2W',
    source = 'audit', lang = 'pt', calc = {},
  } = payload;

  if (!email || !nome) {
    return json({ ok: false, error: 'missing_fields' }, 400);
  }

  /* 1) Insert/upsert no Supabase */
  let supabaseLeadId = null;
  let supabaseErr = null;
  try {
    const sb = await supabaseUpsertLead(env, {
      nome, email, empresa, whatsapp, site, redes, referencias,
      servico, source, lang, calc,
    });
    supabaseLeadId = sb?.id || null;
    if (!supabaseLeadId) supabaseErr = sb?.error || 'no_id_returned';
  } catch (e) {
    supabaseErr = e.message;
    console.error('supabase upsert ex', e.message);
  }

  /* 2) Forward para o fluxo Brevo normal (contact + deal + welcome email curto) */
  const brevoTask = forwardToBrevo(env, {
    nome, email, empresa, whatsapp, site, redes, referencias, servico,
    mensagem: `[Audit] source=${source} | calc=${JSON.stringify(calc)}`,
  });

  /* 3) Enfileirar evaluacao Llama em background */
  ctx.waitUntil(
    runEvaluationAndDispatch(env, {
      supabaseLeadId,
      nome, email, site, redes, referencias, empresa, lang, calc,
    }).catch(e => console.error('eval pipeline ex', e.message))
  );

  /* 4) Aguarda Brevo brevo apenas pro response (sem bloquear eval) */
  const brevoResult = await brevoTask.catch(e => ({ error: e.message }));

  return json({
    ok: true,
    supabaseLeadId,
    supabaseErr: supabaseErr || undefined,
    brevoContactId: brevoResult?.contactId,
    brevoDealId:    brevoResult?.dealId,
    message: 'Audit enfileirado. Email chega em <24h.',
  });
}

/* Reaproveita pipeline existente: chama o handler principal via fetch interno
 * simplificado — cria contact + deal no Brevo */
async function forwardToBrevo(env, lead) {
  const key = env.BREVO_API_KEY;
  if (!key) return { error: 'no_brevo_key' };
  await ensureAttributes(key);
  const parts = lead.nome.trim().split(' ');
  const first = parts[0] || '';
  const last  = parts.slice(1).join(' ') || '';

  let contactId = null, dealId = null;
  try {
    const res = await brevoPost(key, '/contacts', {
      email: lead.email,
      attributes: {
        FIRSTNAME: first, LASTNAME: last, SMS: lead.whatsapp,
        EMPRESA: lead.empresa, SERVICO: lead.servico, ORIGEM: 'audit-m2w',
        SITE_URL: lead.site, REDES_SOCIAIS: lead.redes, REFERENCIAS: lead.referencias,
      },
      listIds: [LIST_ID],
      updateEnabled: true,
    });
    if (res.status === 201) contactId = (await res.json()).id ?? null;
    else if (res.status === 204) {
      const r = await brevoGet(key, `/contacts/${encodeURIComponent(lead.email)}`);
      if (r.ok) contactId = (await r.json()).id ?? null;
    }
  } catch (e) { console.error('audit brevo contact ex', e.message); }

  try {
    const dr = await brevoPost(key, '/crm/deals', {
      name: `Audit · ${lead.nome}${lead.servico ? ' · ' + lead.servico : ''}`,
      stageId: STAGE_NOVO,
      pipelineId: PIPELINE_ID,
      attributes: {
        deal_description: [
          `Nome: ${lead.nome}`,
          `Email: ${lead.email}`,
          lead.whatsapp && `WhatsApp: ${lead.whatsapp}`,
          lead.site     && `Site: ${lead.site}`,
          lead.redes    && `Redes: ${lead.redes}`,
          lead.empresa  && `Empresa: ${lead.empresa}`,
          `[ORIGEM] Audit M2W (calculadora)`,
          lead.mensagem,
        ].filter(Boolean).join(' | '),
      },
    });
    if (dr.ok) dealId = (await dr.json()).id ?? null;
  } catch (e) { console.error('audit brevo deal ex', e.message); }

  if (contactId && dealId) {
    brevoPatch(key, `/crm/deals/${dealId}/link-unlink-contacts`,
      { linkContactIds: [contactId] }).catch(() => {});
  }

  return { contactId, dealId };
}

/* ── Supabase REST helpers ─────────────────────────────────────────────────── */

async function supabaseFetch(env, method, path, body) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('supabase_not_configured');
  const r = await fetch(`${url}/rest/v1${path}`, {
    method,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation,resolution=merge-duplicates',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`supabase ${method} ${path} ${r.status}: ${t.slice(0, 240)}`);
  }
  return r.json().catch(() => null);
}

async function supabaseUpsertLead(env, lead) {
  const row = await supabaseFetch(env, 'POST', '/leads?on_conflict=email', {
    email:        lead.email,
    nome:         lead.nome,
    empresa:      lead.empresa || null,
    whatsapp:     lead.whatsapp || null,
    site:         lead.site || null,
    redes:        lead.redes || null,
    referencias:  lead.referencias || null,
    servico:      lead.servico || null,
    source:       lead.source || 'audit',
    lang:         lead.lang || 'pt',
    calc:         lead.calc || null,
  });
  return Array.isArray(row) ? row[0] : row;
}

async function supabaseInsertEvaluation(env, evaluation) {
  return supabaseFetch(env, 'POST', '/evaluations', evaluation);
}

async function supabaseInsertEvent(env, leadId, type, payload) {
  if (!leadId) return null;
  return supabaseFetch(env, 'POST', '/events', { lead_id: leadId, type, payload }).catch(() => null);
}

/* ── Llama 3.3-70b: gera audit lead-facing + owner-facing ──────────────────── */

async function callGroq(env, systemPrompt, userPrompt, maxTokens = 1200) {
  const key = env.GROQ_API_KEY;
  if (!key) throw new Error('groq_not_configured');
  const r = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.55,
    }),
  });
  if (!r.ok) throw new Error(`groq ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const data = await r.json();
  return data.choices?.[0]?.message?.content || '';
}

function buildLeadPrompt(lead) {
  const calc = lead.calc || {};
  return `Voce e o sistema de Audit M2W. Sua missao: gerar um diagnostico curto e impactante PARA O LEAD que aponta APENAS PROBLEMAS criticos.

REGRAS DURAS:
- NUNCA mencione preco, plano M2W ou solucao especifica.
- NUNCA prometa resolucao; APONTE problemas com clareza cirurgica.
- 3 problemas, nao mais.
- Cada problema tem: titulo curto (max 8 palavras), 2-3 linhas de explicacao com numero/consequencia.
- Tom: parceiro tecnico que mostra o invisivel. Especifico, nao generico.
- SEM em dash (use ponto, virgula, dois pontos).
- Encerra com 1 paragrafo que prepara para a CTA: agendar call com Silvio.
- Saida em MARKDOWN simples (## titulos, **negrito**, listas com -).
- Idioma: ${lead.lang === 'en' ? 'INGLES' : lead.lang === 'es' ? 'ESPANHOL' : 'PORTUGUES-BR'}.

DADOS DO LEAD:
- Nome: ${lead.nome}
- Site/Handle: ${lead.site || 'nao informado'}
- Empresa: ${lead.empresa || 'nao informado'}
- Setor inferido: ${calc.setor || 'a inferir do site/handle'}
- Volume mensal desejado: ${calc.volume_posts_mes || '?'} posts
- Modelo atual: ${calc.modelo_atual || '?'}
- Ticket medio do produto: R$${calc.ticket_medio || '?'}
- Custo atual estimado: R$${calc.custo_atual_estimado || '?'}/mes

ESTRUTURA OBRIGATORIA DO MARKDOWN:

# Audit M2W para ${lead.nome}

[1 paragrafo de abertura, max 3 linhas, contextualizando o que voce analisou. Mencione o nome dele.]

## Problema 1 · [titulo curto]
[2-3 linhas com numero/consequencia especifica baseada nos dados acima.]

## Problema 2 · [titulo curto]
[idem]

## Problema 3 · [titulo curto]
[idem]

## O que isso significa
[1 paragrafo de 3-4 linhas que conecta os 3 problemas a um custo composto (oportunidade, CAC, perda de janela competitiva). Termina preparando o terreno para a CTA.]

[NAO insira a CTA, ela e adicionada pelo template do email.]`;
}

function buildOwnerPrompt(lead) {
  const calc = lead.calc || {};
  return `Voce e o sistema interno M2W. Gera para o Silvio (founder) o briefing completo de venda para este lead. Tudo que ele precisa para fechar.

ESTRUTURA OBRIGATORIA:

# Briefing comercial · ${lead.nome}

## 1. Perfil
- Nome: ${lead.nome}
- Email: ${lead.email}
- Site/Handle: ${lead.site || 'nao informado'}
- Empresa: ${lead.empresa || 'nao informado'}
- Setor inferido: [deduza do site/handle e calc.modelo_atual]
- Maturidade digital: [baixa/media/alta com 1 frase de justificativa]
- ICP fit: [forte/medio/fraco com 1 frase]

## 2. Numeros declarados
- Volume desejado: ${calc.volume_posts_mes || '?'} posts/mes
- Modelo atual: ${calc.modelo_atual || '?'}
- Ticket medio: R$${calc.ticket_medio || '?'}
- Custo atual estimado: R$${calc.custo_atual_estimado || '?'}/mes
- Plano M2W recomendado pela calculadora: ${calc.plano_m2w_recomendado || '?'} (R$${calc.custo_m2w || '?'}/mes)
- Economia projetada: R$${calc.economia_mensal || '?'}/mes (R$${calc.economia_anual || '?'}/ano)

## 3. Problemas reais (vista interna)
[Liste 3-5 problemas concretos com base nos dados. Mais cru que a versao do lead. Inclua riscos invisiveis que o lead nao percebeu.]

## 4. Solucao recomendada
- Plano principal: [especifique exato, com SKU/nome]
- Add-ons sugeridos: [se aplicavel]
- Justificativa em 3 linhas: [por que esse plano resolve os 3-5 problemas acima]

## 5. Proposta financeira sugerida
- Setup: [R$ ou incluido]
- Mensalidade: R$X
- Contrato: 90 dias minimo / 12 meses com desconto
- Garantia: ROI 1o trimestre ou continua sem custo
- Ticket anual: R$X
- Margem estimada: [%]

## 6. Como abrir a call
- Gancho de abertura: 1 frase usando algo especifico do site/handle/numeros
- Objeção mais provavel: [com resposta pronta]
- Fechamento sugerido: [proposta concreta na 1a call ou via email pos-call]

## 7. Score interno
- Lead score: 0-100 com 1 frase de justificativa
- Prioridade: [alta/media/baixa]
- Prazo recomendado de followup: [hoje/24h/48h/semana]

DADOS DO LEAD:
- Nome: ${lead.nome}
- Email: ${lead.email}
- Site/Handle: ${lead.site || 'nao informado'}
- Empresa: ${lead.empresa || 'nao informado'}
- Redes: ${lead.redes || 'nao informado'}
- Referencias citadas: ${lead.referencias || 'nao informado'}
- Calculadora: ${JSON.stringify(calc, null, 2)}

REGRAS:
- Idioma: SEMPRE PORTUGUES-BR (o briefing e interno).
- Numeros reais, sem inventar.
- Saida em MARKDOWN simples.
- Seja cirurgico. Silvio le rapido, quer dado, nao prosa.`;
}

async function runEvaluationAndDispatch(env, ctx) {
  const startedAt = Date.now();
  await supabaseInsertEvent(env, ctx.supabaseLeadId, 'audit_queued', { lang: ctx.lang });

  /* Roda Llama 2x em paralelo */
  const [leadAudit, ownerBriefing] = await Promise.all([
    callGroq(env, 'Audit M2W gerador de versao publica.', buildLeadPrompt(ctx), 900),
    callGroq(env, 'Audit M2W gerador de briefing interno.', buildOwnerPrompt(ctx), 1400),
  ]);

  /* Persiste em Supabase (evaluations) */
  await supabaseInsertEvaluation(env, {
    lead_id:        ctx.supabaseLeadId,
    lead_version:   leadAudit,
    owner_version:  ownerBriefing,
    llama_model:    GROQ_MODEL,
    status:         'generated',
  }).catch(e => console.error('eval insert', e.message));

  /* Envia 2 emails */
  const key = env.BREVO_API_KEY;
  if (key) {
    const leadHtml  = buildLeadAuditEmail(ctx.nome, leadAudit, ctx.lang);
    const ownerHtml = buildOwnerBriefingEmail(ctx.nome, ctx.email, ownerBriefing, ctx.calc);

    await Promise.all([
      brevoPost(key, '/smtp/email', {
        sender:      { email: OWNER_EMAIL, name: 'Silvio Correia Filho · M2W' },
        to:          [{ email: ctx.email, name: ctx.nome }],
        subject:     `Audit M2W · ${ctx.nome}: 3 problemas identificados`,
        htmlContent: leadHtml,
      }).then(r => console.log('lead audit sent', r.status)),
      brevoPost(key, '/smtp/email', {
        sender:      { email: OWNER_EMAIL, name: 'Audit M2W (sistema)' },
        to:          [{ email: OWNER_EMAIL, name: 'Silvio Correia Filho' }],
        subject:     `[Briefing] ${ctx.nome} · ${ctx.email}`,
        htmlContent: ownerHtml,
      }).then(r => console.log('owner briefing sent', r.status)),
    ]).catch(e => console.error('audit emails ex', e.message));
  }

  await supabaseInsertEvent(env, ctx.supabaseLeadId, 'audit_dispatched', {
    duration_ms: Date.now() - startedAt,
  });
}

/* ── Email templates pro audit ─────────────────────────────────────────────── */

function mdToHtml(md) {
  /* Conversor minimo markdown -> HTML pra email */
  let s = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  s = s.replace(/^# (.+)$/gm,  `<h1 style="font-family:${MAIL_FONT_D};font-style:italic;font-weight:400;font-size:32px;color:${MAIL_INK};margin:0 0 24px;letter-spacing:-0.02em;line-height:1.15;">$1</h1>`);
  s = s.replace(/^## (.+)$/gm, `<h2 style="font-family:${MAIL_FONT_D};font-style:italic;font-weight:400;font-size:20px;color:${MAIL_GOLD};margin:28px 0 10px;letter-spacing:-0.01em;line-height:1.25;">$1</h2>`);
  s = s.replace(/^### (.+)$/gm, `<h3 style="font-family:${MAIL_FONT_M};font-size:10px;font-weight:500;letter-spacing:3.5px;text-transform:uppercase;color:${MAIL_GOLD};margin:24px 0 8px;">$1</h3>`);
  s = s.replace(/\*\*(.+?)\*\*/g, `<strong style="color:${MAIL_INK};font-weight:600;">$1</strong>`);
  s = s.replace(/^- (.+)$/gm, `<li style="margin-bottom:4px;color:${MAIL_BODY};">$1</li>`);
  s = s.replace(/(<li[^>]*>.*?<\/li>\n?)+/gs, m => `<ul style="margin:8px 0 16px;padding-left:18px;font-size:14px;line-height:1.7;">${m}</ul>`);
  s = s.split(/\n\n+/).map(p =>
    p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<li')
      ? p
      : `<p style="margin:0 0 14px;font-size:15px;line-height:1.78;color:${MAIL_BODY};">${p.replace(/\n/g, '<br>')}</p>`
  ).join('\n');
  return s;
}

function buildLeadAuditEmail(nome, auditMd, lang) {
  const first = htmlEscape((nome.split(' ')[0] || nome));
  const ctaLabel = lang === 'en' ? 'Schedule 15min with Silvio' : lang === 'es' ? 'Agendar 15min con Silvio' : 'Agendar 15min com Silvio';
  const ctaUrl   = 'https://calendly.com/silviofilhosf/nova-reuniao';
  const subject  = lang === 'en' ? `M2W Audit, ${first}` : lang === 'es' ? `Audit M2W, ${first}` : `Audit M2W, ${first}`;

  const content = `
    ${mdToHtml(auditMd)}

    <div style="margin:36px 0 16px;padding:24px;background:rgba(200,169,126,0.05);border:1px solid rgba(200,169,126,0.25);border-radius:8px;">
      <p style="margin:0 0 14px;font-family:${MAIL_FONT_M};font-size:10px;font-weight:500;letter-spacing:3.5px;text-transform:uppercase;color:${MAIL_GOLD};">Proximo passo</p>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:${MAIL_BODY};">Esses 3 problemas tem solucao concreta. Em 15 minutos com o Silvio voce sai com plano, prazo e proposta especifica pro seu caso. Sem compromisso.</p>
      ${ctaSolid(ctaLabel, ctaUrl)}
    </div>`;

  return emailShell(subject, 'Audit M2W', content);
}

function buildOwnerBriefingEmail(nome, email, briefingMd, calc) {
  const f = htmlEscape(nome);
  const e = htmlEscape(email);
  const calcSummary = calc ? `
    <div style="background:#0a0a0a;border:1px solid ${MAIL_RULE};padding:18px 22px;margin:0 0 24px;border-radius:6px;">
      <p style="margin:0 0 8px;font-family:${MAIL_FONT_M};font-size:9px;font-weight:500;letter-spacing:3.5px;text-transform:uppercase;color:${MAIL_GOLD};">Dados da calculadora</p>
      <p style="margin:0;font-size:12px;line-height:1.7;color:${MAIL_BODY};font-family:${MAIL_FONT_M};">
        Vol: <strong style="color:${MAIL_INK};">${calc.volume_posts_mes || '?'}</strong> posts/mes &middot;
        Modelo: <strong style="color:${MAIL_INK};">${calc.modelo_atual || '?'}</strong> &middot;
        Ticket: <strong style="color:${MAIL_INK};">R$${calc.ticket_medio || '?'}</strong><br>
        Custo atual: <strong style="color:#f87171;">R$${calc.custo_atual_estimado || '?'}/mes</strong> &middot;
        Plano: <strong style="color:${MAIL_GOLD};">${calc.plano_m2w_recomendado || '?'} R$${calc.custo_m2w || '?'}</strong> &middot;
        Economia: <strong style="color:${MAIL_GOLD};">R$${calc.economia_mensal || '?'}/mes</strong>
      </p>
    </div>` : '';

  const content = `
    <p style="margin:0 0 8px;font-family:${MAIL_FONT_M};font-size:9px;font-weight:500;letter-spacing:5px;text-transform:uppercase;color:${MAIL_GOLD};">[interno] Briefing comercial</p>
    <h1 class="hl" style="margin:0 0 8px;font-family:${MAIL_FONT_D};font-size:36px;font-weight:400;font-style:italic;line-height:1.1;color:${MAIL_INK};letter-spacing:-0.02em;">${f}</h1>
    <p style="margin:0 0 28px;font-family:${MAIL_FONT_M};font-size:11px;color:${MAIL_QUIET};">${e}</p>
    ${calcSummary}
    ${mdToHtml(briefingMd)}`;

  return emailShell('Briefing interno M2W', '[Interno] Briefing comercial', content, { hairlineColor: '#7a7a7a' });
}
