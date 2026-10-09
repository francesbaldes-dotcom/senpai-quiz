-- Senpai Quiz: Sperrliste für Spielernamen (sexualisierte, beleidigende, extremistische Begriffe).
-- Erzeugt aus js/spielername.js mit scripts/spielername_sql.mjs. Beide Listen müssen gleich bleiben.

create or replace function public.spielername_erlaubt(p_name text) returns boolean
language plpgsql immutable set search_path = '' as $$
declare
  roh text := lower(coalesce(p_name, ''));
  roh_kompakt text := replace(roh, '_', '');
  kompakt text := translate(roh_kompakt, '0134578', 'oieastb');
  kollabiert text := regexp_replace(kompakt, '(.)\1{2,}', '\1', 'g');
  woerter text[] := regexp_split_to_array(roh, '[_0-9]+') || regexp_split_to_array(translate(roh, '0134578', 'oieastb'), '_');
  sperre_teil text[] := array['fick', 'fuck', 'porno', 'porn', 'hentai', 'ecchi', 'ahegao', 'oppai', 'bukkake', 'futanari', 'lolicon', 'shotacon', 'paedo', 'pedophil', 'padophil', 'rapist', 'vergewalt', 'inzest', 'incest', 'orgasm', 'masturb', 'wichs', 'fotze', 'muschi', 'titten', 'boobs', 'nutte', 'schlampe', 'huren', 'whore', 'slut', 'bitch', 'blowjob', 'cumshot', 'dildo', 'vibrator', 'penis', 'vagina', 'pussy', 'cunt', 'sexy', 'sexgott', 'sexgod', 'sexchat', 'sextoy', 'sexbomb', 'sexsklav', 'sexslave', 'sexfilm', 'sexvideo', 'sexpuppe', 'sexdoll', 'nackt', 'naked', 'sperma', 'sperm', 'lutsch', 'schwanzlutscher', 'fellatio', 'cunnilingus', 'gangbang', 'milf', 'bdsm', 'bondage', 'fetisch', 'fetish', 'stripper', 'onlyfans', 'xxx', 'erotik', 'erotic', 'nsfw', 'arschloch', 'asshole', 'kinderschaender', 'kinderschander', 'chikan', 'yiff', 'nazi', 'hitler', 'himmler', 'goebbels', 'nsdap', 'swastika', 'hakenkreuz', 'siegheil', 'fuehrer', 'fuhrer', 'waffenss', 'blutundehre', 'meinkampf', 'whitepower', 'whitepride', 'weissemacht', 'weisemacht', 'racewar', 'rassenkrieg', 'auslaenderraus', 'auslanderraus', 'kuklux', 'kkk', 'judensau', 'judenhass', 'drecksjude', 'scheissjude', 'killjews', 'gaskammer', 'vergasen', 'vergast', 'holocaust', 'zyklonb', 'genocide', 'genozid', 'voelkermord', 'volkermord', 'nigger', 'nigga', 'neger', 'kanake', 'faggot', 'schwuchtel', 'jihad', 'dschihad', 'alqaida', 'alkaida', 'alqaeda', 'daesh', 'taliban', 'hezbollah', 'hisbollah', 'terror', 'amoklauf'];
  sperre_wort text[] := array['sex', 'anal', 'arsch', 'cock', 'dick', 'cum', 'tits', 'nude', 'nudes', 'hure', 'schwanz', 'rape', 'pedo', 'loli', 'shota', 'escort', 'heil', 'isis', 'isil', 'hamas', 'juden', 'jews'];
  sperre_code text[] := array['1488', 'hh88', '88hh', '14words', '14worte', 'r18'];
begin
  if exists (select 1 from unnest(sperre_code) b where position(b in roh_kompakt) > 0) then return false; end if;
  if exists (select 1 from unnest(sperre_teil) b where position(b in kompakt) > 0 or position(b in kollabiert) > 0) then return false; end if;
  if exists (select 1 from unnest(sperre_wort) b where b = any (woerter) or b = kompakt or b = kollabiert) then return false; end if;
  return true;
end $$;

revoke execute on function public.spielername_erlaubt(text) from public, anon;
grant execute on function public.spielername_erlaubt(text) to authenticated;

-- Neue oder geänderte Namen müssen die Sperrliste bestehen; bestehende Zeilen bleiben unangetastet.
alter table public.profile drop constraint if exists spielername_erlaubt;
alter table public.profile add constraint spielername_erlaubt check (public.spielername_erlaubt(spielername::text)) not valid;

create or replace function public.profil_anlegen(p_name text) returns public.profile
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
  if not public.spielername_erlaubt(p_name) then
    raise exception 'Dieser Spielername ist nicht erlaubt. Bitte wähle einen anderen.';
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
