-- Senpai Quiz: Meldungen zu Fragen („Frage melden“ in der App).
-- Jeder darf einfügen (auch ohne Account), lesen kann nur das Dashboard (service role).

create table public.meldungen (
  id uuid primary key default gen_random_uuid(),
  erstellt timestamptz not null default now(),
  frage_id text not null check (char_length(frage_id) <= 60),
  grund text not null check (grund in ('antwort_falsch', 'unklar', 'tippfehler')),
  text text check (char_length(text) <= 200),
  antwort text check (char_length(antwort) <= 300),
  als_richtig boolean,
  modus text check (char_length(modus) <= 20),
  version text check (char_length(version) <= 20)
);

alter table public.meldungen enable row level security;

create policy "Jeder darf Fragen melden" on public.meldungen
  for insert to anon, authenticated with check (true);

-- Kein Select, Update oder Delete für App-Rollen: ohne Policy sperrt RLS ohnehin,
-- die Rechte werden zusätzlich entzogen, damit auch kein „insert … returning“ geht.
revoke select, update, delete on public.meldungen from anon, authenticated;
