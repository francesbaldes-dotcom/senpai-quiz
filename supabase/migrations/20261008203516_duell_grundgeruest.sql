-- Senpai Quiz: Accounts und Duelle (Supabase-Projekt senpai-quiz, Ref oxnxvumqiynuslvkszvy)
-- Voraussetzung im Dashboard: Authentication → Sign In / Providers → „Allow anonymous sign-ins“ an.

create extension if not exists citext with schema extensions;

-- ---------- Tabellen ----------

create table public.profile (
  id uuid primary key references auth.users(id) on delete cascade,
  spielername extensions.citext not null unique check (spielername::text ~ '^[A-Za-z0-9_]{3,20}$'),
  einladungscode text not null unique,
  erstellt timestamptz not null default now()
);

create table public.fragen (
  id text primary key,
  kategorie text not null,
  schwierigkeit smallint not null,
  typ text not null
);

create table public.duelle (
  id uuid primary key default gen_random_uuid(),
  spieler1 uuid not null references public.profile(id) on delete cascade,
  spieler2 uuid not null references public.profile(id) on delete cascade,
  status text not null default 'laeuft' check (status in ('laeuft', 'beendet', 'aufgegeben')),
  runde smallint not null default 1 check (runde between 1 and 6),
  am_zug uuid references public.profile(id) on delete set null,
  kategorie_optionen text[] not null,
  aufgegeben_von uuid,
  gewinner uuid,
  erstellt timestamptz not null default now(),
  aktualisiert timestamptz not null default now(),
  check (spieler1 <> spieler2)
);
create index duelle_spieler1_idx on public.duelle (spieler1);
create index duelle_spieler2_idx on public.duelle (spieler2);

create table public.duell_runden (
  duell_id uuid not null references public.duelle(id) on delete cascade,
  nr smallint not null check (nr between 1 and 6),
  kategorie text not null,
  fragen text[] not null,
  gewaehlt_von uuid not null,
  primary key (duell_id, nr)
);

create table public.duell_antworten (
  duell_id uuid not null,
  nr smallint not null,
  spieler uuid not null,
  ergebnisse boolean[] not null check (array_length(ergebnisse, 1) = 3),
  erstellt timestamptz not null default now(),
  primary key (duell_id, nr, spieler),
  foreign key (duell_id, nr) references public.duell_runden(duell_id, nr) on delete cascade
);

-- ---------- Zugriffsregeln (geschrieben wird nur über die Funktionen unten) ----------

alter table public.profile enable row level security;
alter table public.fragen enable row level security;
alter table public.duelle enable row level security;
alter table public.duell_runden enable row level security;
alter table public.duell_antworten enable row level security;

create policy "Profile sind für angemeldete Spieler sichtbar" on public.profile
  for select to authenticated using (true);
create policy "Fragenliste ist für angemeldete Spieler sichtbar" on public.fragen
  for select to authenticated using (true);
create policy "Nur eigene Duelle" on public.duelle
  for select to authenticated using ((select auth.uid()) in (spieler1, spieler2));
create policy "Nur Runden eigener Duelle" on public.duell_runden
  for select to authenticated using (exists (
    select 1 from public.duelle d where d.id = duell_id and (select auth.uid()) in (d.spieler1, d.spieler2)));
create policy "Nur Antworten eigener Duelle" on public.duell_antworten
  for select to authenticated using (exists (
    select 1 from public.duelle d where d.id = duell_id and (select auth.uid()) in (d.spieler1, d.spieler2)));

-- ---------- Spielregeln ----------

create function public.zufalls_kategorien() returns text[]
language sql volatile set search_path = '' as $$
  select array(select k from unnest(array['shonen', 'shojo', 'filme', 'manga', 'neu', 'kultur']) k order by random() limit 3)
$$;

create function public.profil_anlegen(p_name text) returns public.profile
language plpgsql security definer set search_path = '' as $$
declare
  ich uuid := auth.uid();
  code text;
  p public.profile;
begin
  if ich is null then raise exception 'Nicht angemeldet'; end if;
  if exists (select 1 from public.profile where id = ich) then raise exception 'Du hast schon einen Account'; end if;
  if p_name !~ '^[A-Za-z0-9_]{3,20}$' then
    raise exception 'Der Spielername braucht 3 bis 20 Zeichen: Buchstaben, Zahlen oder _';
  end if;
  if exists (select 1 from public.profile where spielername = p_name::extensions.citext) then
    raise exception 'Dieser Spielername ist schon vergeben';
  end if;
  loop
    code := (select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
             from generate_series(1, 6));
    exit when not exists (select 1 from public.profile where einladungscode = code);
  end loop;
  insert into public.profile (id, spielername, einladungscode) values (ich, p_name, code) returning * into p;
  return p;
end $$;

create function public.duell_herausfordern(p_gegner uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  ich uuid := auth.uid();
  neu uuid;
begin
  if ich is null or not exists (select 1 from public.profile where id = ich) then raise exception 'Erst einen Account anlegen'; end if;
  if p_gegner = ich then raise exception 'Du kannst nicht gegen dich selbst spielen'; end if;
  if not exists (select 1 from public.profile where id = p_gegner) then raise exception 'Spieler nicht gefunden'; end if;
  if exists (select 1 from public.duelle where status = 'laeuft'
             and ((spieler1 = ich and spieler2 = p_gegner) or (spieler1 = p_gegner and spieler2 = ich))) then
    raise exception 'Gegen diesen Spieler läuft schon ein Duell';
  end if;
  insert into public.duelle (spieler1, spieler2, am_zug, kategorie_optionen)
    values (ich, p_gegner, ich, public.zufalls_kategorien()) returning id into neu;
  return neu;
end $$;

create function public.runde_starten(p_duell uuid, p_kategorie text) returns text[]
language plpgsql security definer set search_path = '' as $$
declare
  ich uuid := auth.uid();
  d public.duelle;
  ids text[];
begin
  select * into d from public.duelle where id = p_duell for update;
  if not found or ich is null or ich not in (d.spieler1, d.spieler2) then raise exception 'Duell nicht gefunden'; end if;
  if d.status <> 'laeuft' or d.am_zug is distinct from ich then raise exception 'Du bist gerade nicht am Zug'; end if;
  if exists (select 1 from public.duell_runden where duell_id = p_duell and nr = d.runde) then
    raise exception 'Für diese Runde wurde schon eine Kategorie gewählt';
  end if;
  if not (p_kategorie = any (d.kategorie_optionen)) then raise exception 'Diese Kategorie steht nicht zur Wahl'; end if;
  select array_agg(x.id) into ids from (
    select f.id from public.fragen f
    where f.kategorie = p_kategorie
      and not exists (select 1 from public.duell_runden r where r.duell_id = p_duell and f.id = any (r.fragen))
    order by random() limit 3) x;
  if coalesce(array_length(ids, 1), 0) < 3 then raise exception 'In dieser Kategorie gibt es nicht genug Fragen'; end if;
  insert into public.duell_runden (duell_id, nr, kategorie, fragen, gewaehlt_von) values (p_duell, d.runde, p_kategorie, ids, ich);
  update public.duelle set aktualisiert = now() where id = p_duell;
  return ids;
end $$;

create function public.runde_abschliessen(p_duell uuid, p_ergebnisse boolean[]) returns void
language plpgsql security definer set search_path = '' as $$
declare
  ich uuid := auth.uid();
  d public.duelle;
  andere uuid;
  gewaehlt uuid;
  p1 int;
  p2 int;
begin
  select * into d from public.duelle where id = p_duell for update;
  if not found or ich is null or ich not in (d.spieler1, d.spieler2) then raise exception 'Duell nicht gefunden'; end if;
  if d.status <> 'laeuft' or d.am_zug is distinct from ich then raise exception 'Du bist gerade nicht am Zug'; end if;
  select gewaehlt_von into gewaehlt from public.duell_runden where duell_id = p_duell and nr = d.runde;
  if not found then raise exception 'Erst eine Kategorie wählen'; end if;
  if array_length(p_ergebnisse, 1) is distinct from 3 or array_position(p_ergebnisse, null) is not null then
    raise exception 'Ungültige Ergebnisse';
  end if;
  insert into public.duell_antworten (duell_id, nr, spieler, ergebnisse) values (p_duell, d.runde, ich, p_ergebnisse);
  andere := case when ich = d.spieler1 then d.spieler2 else d.spieler1 end;

  if gewaehlt = ich then
    -- Ich habe die Kategorie gewählt und zuerst gespielt: jetzt spielt der Gegner dieselben Fragen
    update public.duelle set am_zug = andere, aktualisiert = now() where id = p_duell;
  elsif d.runde >= 6 then
    select count(*) filter (where e and a.spieler = d.spieler1), count(*) filter (where e and a.spieler = d.spieler2)
      into p1, p2
      from public.duell_antworten a cross join lateral unnest(a.ergebnisse) as e
      where a.duell_id = p_duell;
    update public.duelle set status = 'beendet', am_zug = null, aktualisiert = now(),
      gewinner = case when p1 > p2 then d.spieler1 when p2 > p1 then d.spieler2 end
      where id = p_duell;
  else
    -- Runde komplett: wer zuletzt gespielt hat, wählt die nächste Kategorie
    update public.duelle set runde = d.runde + 1, am_zug = ich, kategorie_optionen = public.zufalls_kategorien(),
      aktualisiert = now() where id = p_duell;
  end if;
end $$;

create function public.duell_aufgeben(p_duell uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  ich uuid := auth.uid();
  d public.duelle;
begin
  select * into d from public.duelle where id = p_duell for update;
  if not found or ich is null or ich not in (d.spieler1, d.spieler2) then raise exception 'Duell nicht gefunden'; end if;
  if d.status <> 'laeuft' then raise exception 'Das Duell ist schon vorbei'; end if;
  update public.duelle set status = 'aufgegeben', aufgegeben_von = ich, am_zug = null, aktualisiert = now(),
    gewinner = case when ich = d.spieler1 then d.spieler2 else d.spieler1 end
    where id = p_duell;
end $$;

create function public.konto_loeschen() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  delete from auth.users where id = auth.uid();
end $$;

-- Funktionen nur für angemeldete Spieler
revoke execute on function public.zufalls_kategorien() from public, anon, authenticated;
revoke execute on function public.profil_anlegen(text) from public, anon;
revoke execute on function public.duell_herausfordern(uuid) from public, anon;
revoke execute on function public.runde_starten(uuid, text) from public, anon;
revoke execute on function public.runde_abschliessen(uuid, boolean[]) from public, anon;
revoke execute on function public.duell_aufgeben(uuid) from public, anon;
revoke execute on function public.konto_loeschen() from public, anon;
grant execute on function public.profil_anlegen(text) to authenticated;
grant execute on function public.duell_herausfordern(uuid) to authenticated;
grant execute on function public.runde_starten(uuid, text) to authenticated;
grant execute on function public.runde_abschliessen(uuid, boolean[]) to authenticated;
grant execute on function public.duell_aufgeben(uuid) to authenticated;
grant execute on function public.konto_loeschen() to authenticated;
