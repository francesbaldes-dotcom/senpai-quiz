// Verbindung zum Server (Supabase) für Accounts und Duelle.
// Der Schlüssel ist der öffentliche „publishable key“: Er darf im App-Code stehen,
// der Schutz der Daten passiert über die Zugriffsregeln in der Datenbank.

const SERVER = 'https://oxnxvumqiynuslvkszvy.supabase.co';
const SCHLUESSEL = 'sb_publishable_-T7tHglUSBaAinmqDoAGYw_y6YoUgLV';

let client = null;

function sb() {
  if (!client) {
    if (!window.supabase) throw new Error('Die Online-Funktionen konnten nicht geladen werden.');
    client = window.supabase.createClient(SERVER, SCHLUESSEL, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'senpai-quiz-konto' },
    });
  }
  return client;
}

function fehlerText(fehler) {
  const text = fehler?.message || String(fehler || '');
  if (/fetch|network|Failed to fetch|Load failed/i.test(text)) return 'Keine Verbindung zum Server. Bist du online?';
  if (/anonymous.*disabled/i.test(text)) return 'Anmeldungen sind auf dem Server noch ausgeschaltet.';
  return text || 'Unbekannter Fehler';
}

function pruefe({ data, error }) {
  if (error) throw new Error(fehlerText(error));
  return data;
}

async function versuche(aufruf) {
  try {
    return pruefe(await aufruf());
  } catch (fehler) {
    throw new Error(fehlerText(fehler));
  }
}

export async function meinProfil() {
  let sitzung;
  try {
    sitzung = (await sb().auth.getSession()).data.session;
  } catch (fehler) {
    throw new Error(fehlerText(fehler));
  }
  if (!sitzung) return null;
  return versuche(() => sb().from('profile').select('*').eq('id', sitzung.user.id).maybeSingle());
}

export async function accountAnlegen(name) {
  const sitzung = (await sb().auth.getSession()).data.session;
  if (!sitzung) {
    const { error } = await sb().auth.signInAnonymously();
    if (error) throw new Error(fehlerText(error));
  }
  return versuche(() => sb().rpc('profil_anlegen', { p_name: name }));
}

export async function spielerSuchen(text) {
  // _ und % sind in LIKE Platzhalter und müssen maskiert werden
  const muster = `${text.replace(/[\\%_]/g, (z) => `\\${z}`)}%`;
  return versuche(() => sb().from('profile').select('id, spielername').ilike('spielername', muster).order('spielername').limit(10));
}

export async function profilPerCode(code) {
  return versuche(() => sb().from('profile').select('id, spielername').eq('einladungscode', code.trim().toUpperCase()).maybeSingle());
}

export async function herausfordern(gegnerId) {
  return versuche(() => sb().rpc('duell_herausfordern', { p_gegner: gegnerId }));
}

export async function meineDuelle() {
  return versuche(() => sb()
    .from('duelle')
    .select('*, s1:profile!duelle_spieler1_fkey(spielername), s2:profile!duelle_spieler2_fkey(spielername), duell_runden(nr, kategorie, fragen, gewaehlt_von, duell_antworten(spieler, ergebnisse))')
    .order('aktualisiert', { ascending: false })
    .limit(50));
}

export async function rundeStarten(duellId, kategorie) {
  return versuche(() => sb().rpc('runde_starten', { p_duell: duellId, p_kategorie: kategorie }));
}

export async function rundeAbschliessen(duellId, ergebnisse) {
  return versuche(() => sb().rpc('runde_abschliessen', { p_duell: duellId, p_ergebnisse: ergebnisse }));
}

export async function aufgeben(duellId) {
  return versuche(() => sb().rpc('duell_aufgeben', { p_duell: duellId }));
}

// Meldung zu einer Frage („Frage melden“). Braucht keinen Account: Die Tabelle
// erlaubt der Rolle anon das Einfügen, lesen kann sie nur das Dashboard.
export async function frageMelden(daten) {
  return versuche(() => sb().from('meldungen').insert({
    frage_id: daten.frageId,
    grund: daten.grund,
    text: daten.text || null,
    antwort: daten.antwort ?? null,
    als_richtig: daten.alsRichtig ?? null,
    modus: daten.modus ?? null,
    version: daten.version ?? null,
  }));
}

export async function kontoLoeschen() {
  await versuche(() => sb().rpc('konto_loeschen'));
  await sb().auth.signOut({ scope: 'local' });
}
