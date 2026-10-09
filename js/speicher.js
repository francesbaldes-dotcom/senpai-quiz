// Speichern des Spielerprofils.
//
// Im Browser liegt das Profil in localStorage (synchron). In der iPhone-App
// (Capacitor) wird stattdessen das Plugin Preferences genutzt, weil localStorage
// in einer WebView vom System gelöscht werden kann. Preferences ist asynchron,
// deshalb wird das Profil beim Start einmal geladen (speicherBereit) und danach
// im Speicher gehalten: speichereProfil schreibt sofort in diesen Cache und
// im Hintergrund nach Preferences.
//
// Der native Pfad ist noch ungetestet: Es gibt bisher kein Capacitor-Projekt,
// in dem er laufen könnte. Beim Verpacken als App prüfen, ob
// window.Capacitor.Plugins.Preferences vorhanden ist (Plugin @capacitor/preferences).

const SPEICHER = 'senpai-quiz-v1';

let cache = null; // nativer Pfad: zuletzt bekannter JSON-Text des Profils

function preferences() {
  const cap = window.Capacitor;
  if (!cap?.isNativePlatform?.()) return null;
  return cap.Plugins?.Preferences ?? null;
}

// Vor dem ersten render() abwarten. Im Browser sofort fertig.
export async function speicherBereit() {
  const prefs = preferences();
  if (!prefs) return;
  try {
    cache = (await prefs.get({ key: SPEICHER })).value ?? null;
  } catch {
    cache = null;
  }
}

// Gespeichertes Profil, mit den Startwerten aufgefüllt (ältere Profile kennen
// neuere Felder nicht). Ohne oder mit kaputtem Speicher kommt das Startprofil.
export function ladeProfil(start) {
  const basis = structuredClone(start);
  try {
    const text = preferences() ? cache : localStorage.getItem(SPEICHER);
    const gespeichert = JSON.parse(text);
    return gespeichert ? { ...basis, ...gespeichert } : basis;
  } catch {
    return basis;
  }
}

export function speichereProfil(profil) {
  const text = JSON.stringify(profil);
  const prefs = preferences();
  if (prefs) {
    cache = text;
    prefs.set({ key: SPEICHER, value: text }).catch(() => {});
    return;
  }
  try {
    localStorage.setItem(SPEICHER, text);
  } catch {
    // Speichern nicht möglich (z. B. privates Fenster) – Spiel läuft trotzdem.
  }
}
