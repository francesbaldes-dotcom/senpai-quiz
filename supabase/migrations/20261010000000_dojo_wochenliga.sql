-- Senpai Quiz: Wochenliga des Senpai Dojo.
--
-- Jeder Spieler sammelt pro ISO-Woche (Europe/Berlin) Dojo-Punkte (= im Dojo verdiente XP).
-- Die Liga zeigt den Spieler und alle, mit denen er je ein Duell hatte. Geschrieben und
-- gelesen wird nur über die Funktionen, die Tabelle selbst hat keine Policies.

create table public.dojo_liga (
  spieler uuid not null references public.profile(id) on delete cascade,
  woche text not null, -- ISO-Woche, z. B. 2026-W41
  punkte integer not null default 0 check (punkte >= 0),
  aktualisiert timestamptz not null default now(),
  primary key (spieler, woche)
);
create index dojo_liga_woche_idx on public.dojo_liga (woche, punkte desc);
alter table public.dojo_liga enable row level security;

create function public.liga_woche(p_vorige boolean default false) returns text
language sql stable set search_path = '' as $$
  select to_char((now() at time zone 'Europe/Berlin') - case when p_vorige then interval '7 days' else interval '0' end, 'IYYY-"W"IW');
$$;

-- Punkte für die laufende Woche melden; Rückgabe: neuer Wochenstand
create function public.liga_melden(p_punkte integer) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  ich uuid := auth.uid();
  stand integer;
begin
  if ich is null then raise exception 'Nicht angemeldet'; end if;
  if p_punkte is null or p_punkte < 1 or p_punkte > 2000 then raise exception 'Ungültige Punkte'; end if;
  insert into public.dojo_liga (spieler, woche, punkte) values (ich, public.liga_woche(), p_punkte)
    on conflict (spieler, woche) do update set punkte = public.dojo_liga.punkte + excluded.punkte, aktualisiert = now()
    returning punkte into stand;
  return stand;
end $$;

-- Stand der Liga: ich und alle Duellpartner, laufende oder vorige Woche
create function public.liga_stand(p_vorige boolean default false)
returns table (spieler uuid, spielername text, punkte integer, ich boolean)
language sql security definer stable set search_path = '' as $$
  with freunde as (
    select auth.uid() as id
    union select d.spieler2 from public.duelle d where d.spieler1 = auth.uid()
    union select d.spieler1 from public.duelle d where d.spieler2 = auth.uid()
  )
  select p.id, p.spielername::text, coalesce(l.punkte, 0), p.id = auth.uid()
  from public.profile p
  join freunde f on f.id = p.id
  left join public.dojo_liga l on l.spieler = p.id and l.woche = public.liga_woche(p_vorige)
  where auth.uid() is not null
  order by coalesce(l.punkte, 0) desc, p.spielername;
$$;

revoke execute on function public.liga_woche(boolean) from public, anon;
revoke execute on function public.liga_melden(integer) from public, anon;
revoke execute on function public.liga_stand(boolean) from public, anon;
grant execute on function public.liga_woche(boolean) to authenticated;
grant execute on function public.liga_melden(integer) to authenticated;
grant execute on function public.liga_stand(boolean) to authenticated;
