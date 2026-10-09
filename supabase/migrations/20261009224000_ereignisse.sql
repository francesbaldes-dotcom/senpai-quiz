-- Anonyme Ereigniszählung: wie oft die App gestartet und Runden gespielt werden.
-- Keine Nutzer-ID, keine Geräte-ID, kein Spielername. tag_nr = Tage seit dem ersten
-- Start auf dem Gerät (0 = erster Tag, höchstens 30), damit sich die Wiederkehr-Quote
-- (Tag 1, Tag 7) aus Summen berechnen lässt, ohne jemanden wiederzuerkennen.

create table public.ereignisse (
  id uuid primary key default gen_random_uuid(),
  erstellt timestamptz not null default now(),
  art text not null check (art in ('start', 'runde')),
  modus text check (modus is null or char_length(modus) <= 20),
  tag_nr integer check (tag_nr is null or (tag_nr >= 0 and tag_nr <= 30)),
  version text check (version is null or char_length(version) <= 20)
);

comment on table public.ereignisse is 'Anonyme Zählung von App-Starts und gespielten Runden, ohne Bezug zu Personen';

alter table public.ereignisse enable row level security;

create policy "Jeder darf Ereignisse zählen" on public.ereignisse
  for insert to anon, authenticated with check (true);

-- Lesen nur mit Service-Rolle (Dashboard / SQL-Editor). Keine Select-Policy.

-- Tageszahlen bequem abfragen: Starts je Tag und Wiederkehr-Tag.
create view public.ereignisse_tage with (security_invoker = true) as
  select date(erstellt at time zone 'Europe/Berlin') as tag, art, modus, tag_nr, count(*) as anzahl
  from public.ereignisse
  group by 1, 2, 3, 4;

revoke all on public.ereignisse_tage from anon, authenticated;
