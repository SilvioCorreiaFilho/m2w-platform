# M2W Workers

Dois Cloudflare Workers + Supabase + Brevo + Groq.

## m2w-leads (worker/)

Endpoint principal de captura de leads. Salva no Brevo CRM, envia email de boas-vindas, agenda follow-ups D+3/D+7/D+14, e expõe o endpoint /audit para a calculadora.

### Rotas
- **POST /** (raiz) — captura padrão de form. Cria contato Brevo, cria deal, agenda welcome email + cron tasks.
- **POST /audit** — Audit M2W. Recebe calc + dados do lead. Salva em Supabase + Brevo. Enfileira evaluation via Llama. Em background: gera audit lead-facing + briefing owner-facing, envia 2 emails via Brevo.
- **scheduled** — Cron Trigger diário (13:00 UTC). Despacha D+7 e D+14 follow-up emails.

### Secrets
- `BREVO_API_KEY`
- `GROQ_API_KEY` (novo)
- `SUPABASE_URL` = `https://zryuzzjnwdfbnaufjqon.supabase.co`
- `SUPABASE_SERVICE_KEY` (Dashboard > Settings > API > service_role)

## m2w-chat (worker/chat/)

Mia Park · Llama 3.3-70b conversacional + Calendly slots + intent detection.

### Rotas
- **POST /** — chat completions, retorna { reply, leadCaptured, calendly, calendlySlots, qrVenha }
- **GET /slots** — próximos 5 slots Calendly via API v2

### Sentinels
- `LEAD_CAPTURED:{json}` — encaminha pro m2w-leads
- `SHOW_CALENDLY` — iframe legado
- `SHOW_CALENDLY_SLOTS` — picker inline (NOVO)
- `SHOW_QR_VENHA` — renderiza QR no chat (NOVO)

### Secrets
- `GROQ_API_KEY`
- `CALENDLY_TOKEN` (Dashboard > Integrations > API & Webhooks)
- `CALENDLY_USER`, `CALENDLY_EVENT` (opcionais; cache)

## Setup completo

```bash
# 1. Rodar SQL no Supabase Dashboard > SQL Editor
cat worker/supabase-schema.sql | pbcopy && open https://supabase.com/dashboard/project/zryuzzjnwdfbnaufjqon/sql/new

# 2. Setar secrets no worker leads
cd worker
echo "https://zryuzzjnwdfbnaufjqon.supabase.co" | npx wrangler secret put SUPABASE_URL
echo "<service_role_key>"                       | npx wrangler secret put SUPABASE_SERVICE_KEY
echo "<groq_api_key>"                           | npx wrangler secret put GROQ_API_KEY

# 3. Setar secrets no worker chat
cd chat
echo "<calendly_personal_access_token>" | npx wrangler secret put CALENDLY_TOKEN

# 4. Deploy
cd .. && CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=26506bdaf1ff1827371b618583cbc05e npx wrangler deploy
cd chat && CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=26506bdaf1ff1827371b618583cbc05e npx wrangler deploy
```

## Fluxo Audit M2W (isca digital)

```
Lead na calculadora → POST /audit {nome, email, site, calc}
  │
  ├─→ Supabase.leads (upsert por email)
  ├─→ Brevo (contato + deal + welcome)
  └─→ ctx.waitUntil(runEvaluation):
        ├─→ Llama 3.3 (lead audit: 3 problemas + CTA)
        ├─→ Llama 3.3 (owner briefing: full + proposta)
        ├─→ Supabase.evaluations (persiste ambos)
        ├─→ Brevo.email lead   → cliente
        └─→ Brevo.email owner  → Silvio
```
