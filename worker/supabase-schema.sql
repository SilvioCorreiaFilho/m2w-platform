-- ═══════════════════════════════════════════════════════════════════════════
-- M2W Lead Capture + Audit Microservice — Supabase Schema
-- Project: zryuzzjnwdfbnaufjqon
--
-- Rode este SQL no Supabase Dashboard > SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Extensions (UUID generation) ──────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── leads ─────────────────────────────────────────────────────────────────
-- Mirror canonico do que entra no Brevo. Email e a chave de dedupe.
create table if not exists public.leads (
  id              uuid primary key default uuid_generate_v4(),
  email           text unique not null,
  nome            text not null,
  empresa         text,
  whatsapp        text,
  site            text,
  redes           text,
  referencias     text,
  servico         text,
  source          text default 'form',
  lang            text default 'pt',
  calc            jsonb,
  brevo_contact_id text,
  brevo_deal_id   text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_created_idx on public.leads (created_at desc);

-- ── evaluations ───────────────────────────────────────────────────────────
-- Dois documentos por lead: o que vai pro lead (pain-pointing) e o que vai
-- pro Silvio (briefing comercial completo com proposta).
create table if not exists public.evaluations (
  id                 uuid primary key default uuid_generate_v4(),
  lead_id            uuid references public.leads(id) on delete cascade,
  lead_version       text,        -- markdown que vai no email para o lead
  owner_version      text,        -- markdown do briefing interno para o Silvio
  problems_summary   text,        -- 1 frase extraida do lead_version (futuro: SQL function)
  recommended_plan   text,        -- ex.: "Padrao TikTok Shop · R$4.990"
  recommended_price  numeric,
  llama_model        text,        -- ex.: "llama-3.3-70b-versatile"
  status             text default 'pending', -- pending|generated|sent|failed
  created_at         timestamptz default now(),
  sent_at            timestamptz
);

create index if not exists evaluations_lead_idx on public.evaluations (lead_id);
create index if not exists evaluations_status_idx on public.evaluations (status);

-- ── events ────────────────────────────────────────────────────────────────
-- Timeline de eventos por lead. Tudo que aconteceu desde o submit do form.
-- type: audit_queued | audit_dispatched | call_scheduled | reply_received |
--       d3_sent | d7_sent | d14_sent | proposta_sent | closed_won | closed_lost
create table if not exists public.events (
  id          uuid primary key default uuid_generate_v4(),
  lead_id     uuid references public.leads(id) on delete cascade,
  type        text not null,
  payload     jsonb,
  created_at  timestamptz default now()
);

create index if not exists events_lead_idx on public.events (lead_id, created_at);
create index if not exists events_type_idx on public.events (type, created_at);

-- ── RLS (Row Level Security) ──────────────────────────────────────────────
-- Por enquanto deixamos service_role com acesso total e nao expomos anon.
alter table public.leads        enable row level security;
alter table public.evaluations  enable row level security;
alter table public.events       enable row level security;

-- Service role policy (Worker usa service key, nao anon)
create policy "service all leads"       on public.leads       for all to service_role using (true) with check (true);
create policy "service all evaluations" on public.evaluations for all to service_role using (true) with check (true);
create policy "service all events"      on public.events      for all to service_role using (true) with check (true);

-- ── updated_at trigger ────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_touch_updated on public.leads;
create trigger leads_touch_updated
  before update on public.leads
  for each row execute function public.touch_updated_at();
