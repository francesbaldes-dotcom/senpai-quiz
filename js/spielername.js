// Sperrliste für Spielernamen: keine sexualisierten, beleidigenden oder
// extremistischen Begriffe. Dieselbe Prüfung läuft auf dem Server in
// public.spielername_erlaubt (supabase/migrations/…_spielername_sperrliste.sql).
// Beide Listen müssen gleich bleiben; `node scripts/spielername_sql.mjs` erzeugt die SQL-Arrays.

// Begriffe, die nirgends im Namen vorkommen dürfen (nach Leetspeak-Auflösung, ohne _).
export const SPERRE_TEIL = [
  // sexualisiert
  'fick', 'fuck', 'porno', 'porn', 'hentai', 'ecchi', 'ahegao', 'oppai', 'bukkake', 'futanari',
  'lolicon', 'shotacon', 'paedo', 'pedophil', 'padophil', 'rapist', 'vergewalt', 'inzest', 'incest',
  'orgasm', 'masturb', 'wichs', 'fotze', 'muschi', 'titten', 'boobs', 'nutte', 'schlampe', 'huren',
  'whore', 'slut', 'bitch', 'blowjob', 'cumshot', 'dildo', 'vibrator', 'penis', 'vagina', 'pussy',
  'cunt', 'sexy', 'sexgott', 'sexgod', 'sexchat', 'sextoy', 'sexbomb', 'sexsklav', 'sexslave',
  'sexfilm', 'sexvideo', 'sexpuppe', 'sexdoll', 'nackt', 'naked', 'sperma', 'sperm', 'lutsch',
  'schwanzlutscher', 'fellatio', 'cunnilingus', 'gangbang', 'milf', 'bdsm', 'bondage', 'fetisch',
  'fetish', 'stripper', 'onlyfans', 'xxx', 'erotik', 'erotic', 'nsfw', 'arschloch', 'asshole',
  'kinderschaender', 'kinderschander', 'chikan', 'yiff',
  // radikal, extremistisch, menschenverachtend
  'nazi', 'hitler', 'himmler', 'goebbels', 'nsdap', 'swastika', 'hakenkreuz', 'siegheil',
  'fuehrer', 'fuhrer', 'waffenss', 'blutundehre', 'meinkampf', 'whitepower', 'whitepride',
  'weissemacht', 'weisemacht', 'racewar', 'rassenkrieg', 'auslaenderraus', 'auslanderraus',
  'kuklux', 'kkk', 'judensau', 'judenhass', 'drecksjude', 'scheissjude', 'killjews', 'gaskammer',
  'vergasen', 'vergast', 'holocaust', 'zyklonb', 'genocide', 'genozid', 'voelkermord', 'volkermord',
  'nigger', 'nigga', 'neger', 'kanake', 'faggot', 'schwuchtel', 'jihad', 'dschihad', 'alqaida',
  'alkaida', 'alqaeda', 'daesh', 'taliban', 'hezbollah', 'hisbollah', 'terror', 'amoklauf',
];

// Begriffe, die nur als ganzes Wort gesperrt sind (zwischen _ oder Ziffern),
// weil sie sonst in harmlosen Namen stecken (essex, marschall, torpedo, nudel …).
export const SPERRE_WORT = [
  'sex', 'anal', 'arsch', 'cock', 'dick', 'cum', 'tits', 'nude', 'nudes', 'hure', 'schwanz',
  'rape', 'pedo', 'loli', 'shota', 'escort', 'heil', 'isis', 'isil', 'hamas', 'juden', 'jews',
];

// Zahlencodes, geprüft am rohen Namen (Leetspeak-Auflösung würde sie zerstören).
export const SPERRE_CODE = ['1488', 'hh88', '88hh', '14words', '14worte', 'r18'];

const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b' };

function leet(text) {
  return text.replace(/[0134578]/g, (z) => LEET[z]);
}

export function spielernameErlaubt(name) {
  const roh = String(name).toLowerCase();
  const rohKompakt = roh.replace(/_/g, '');
  const kompakt = leet(rohKompakt);
  const kollabiert = kompakt.replace(/(.)\1{2,}/g, '$1');
  const woerter = new Set([...roh.split(/[_0-9]+/), ...leet(roh).split('_')].filter(Boolean));

  if (SPERRE_CODE.some((b) => rohKompakt.includes(b))) return false;
  if (SPERRE_TEIL.some((b) => kompakt.includes(b) || kollabiert.includes(b))) return false;
  if (SPERRE_WORT.some((b) => woerter.has(b) || kompakt === b || kollabiert === b)) return false;
  return true;
}

export const SPIELERNAME_VERBOTEN = 'Dieser Spielername ist nicht erlaubt. Bitte wähle einen anderen.';
