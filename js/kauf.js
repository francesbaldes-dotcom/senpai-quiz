// In-App-Käufe für das Senpai Dojo. Im Browser läuft eine Kauf-Attrappe.
//
// In der iPhone-App muss hier der App Store hinein (Apple verlangt für
// Lerninhalte In-App-Käufe, keine Web-Zahlung): am einfachsten RevenueCat
// (@revenuecat/purchases-capacitor), das Abo-Status, Quittungen und
// „Käufe wiederherstellen“ übernimmt. Die Produkt-IDs unten sind die
// Kennungen, die in App Store Connect angelegt werden müssen.
//
// Rückgabe von kaufen(): { art, bis } bei Erfolg (bis = Ablauf als ISO-Datum,
// null beim Einmalkauf), sonst null (abgebrochen oder fehlgeschlagen).

export const ANGEBOTE = [
  { id: 'abo', produkt: 'de.senpaiquiz.dojo.monat', name: 'Monatsabo', preis: '2,99 €', je: 'pro Monat', text: 'Jederzeit kündbar, verlängert sich automatisch.', tage: 30 },
  { id: 'einmal', produkt: 'de.senpaiquiz.dojo.lebenslang', name: 'Für immer', preis: '19,99 €', je: 'einmalig', text: 'Alle Lektionen, auch alle kommenden. Kein Abo.', tage: null },
];

const ATTRAPPE_DAUER = 1.5; // Sekunden „Verbindung zum Store“

// Die Attrappe läuft nur bei lokaler Entwicklung. Auf der veröffentlichten
// Web-Version (GitHub Pages) gibt es keinen Store, dort ist das Dojo nur
// über die Probelektionen nutzbar; gekauft wird in der iPhone-App.
const LOKAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

let offen = false;

export function kaufOffen() {
  return offen;
}

// Kann hier überhaupt gekauft werden? (nativ mit Store oder lokale Attrappe)
export function kaufMoeglich() {
  return !!store() || LOKAL;
}

function store() {
  // Platz für das native Plugin; im Browser gibt es keinen Store.
  return window.Capacitor?.isNativePlatform?.() ? window.Capacitor.Plugins?.Purchases ?? null : null;
}

function ablauf(angebot) {
  if (!angebot.tage) return null;
  const d = new Date();
  d.setDate(d.getDate() + angebot.tage);
  return d.toISOString();
}

export function kaufen(angebotId) {
  const angebot = ANGEBOTE.find((a) => a.id === angebotId);
  if (!angebot || offen) return Promise.resolve(null);
  if (store()) {
    // Nativer Pfad, noch nicht angebunden: erst mit RevenueCat ausfüllen.
    console.warn('In-App-Kauf: Store-Plugin noch nicht angebunden.');
    return Promise.resolve(null);
  }
  if (!LOKAL) return Promise.resolve(null);
  offen = true;
  return new Promise((fertig) => {
    const huelle = document.createElement('div');
    huelle.className = 'werbung kauf';
    huelle.setAttribute('role', 'dialog');
    huelle.setAttribute('aria-modal', 'true');
    huelle.setAttribute('aria-label', 'Kauf bestätigen');
    huelle.innerHTML = `<div class="werbung-karte">
      <span class="label">App Store · Platzhalter</span>
      <p class="werbung-text">Hier erscheint in der App das Kauf-Fenster von Apple. Im Browser ist das nur eine Probe, es wird nichts berechnet.</p>
      <div class="kauf-zeile"><b></b><span></span></div>
      <div class="balken"><span></span></div>
      <div class="zweier">
        <button class="knopf" data-wahl="abbrechen">Abbrechen</button>
        <button class="knopf knopf-rot" data-wahl="kaufen" disabled>Verbinde …</button>
      </div>
    </div>`;
    huelle.querySelector('.kauf-zeile b').textContent = angebot.name;
    huelle.querySelector('.kauf-zeile span').textContent = `${angebot.preis} ${angebot.je}`;
    document.body.append(huelle);

    const balken = huelle.querySelector('.balken span');
    const kaufKnopf = huelle.querySelector('[data-wahl="kaufen"]');
    const start = Date.now();
    let uhr = null;
    const tick = () => {
      const anteil = Math.min(1, (Date.now() - start) / 1000 / ATTRAPPE_DAUER);
      balken.style.width = `${anteil * 100}%`;
      if (anteil >= 1) {
        kaufKnopf.disabled = false;
        kaufKnopf.textContent = 'Kaufen (Probe)';
        kaufKnopf.focus();
      } else {
        uhr = requestAnimationFrame(tick);
      }
    };
    uhr = requestAnimationFrame(tick);

    const schliessen = (ergebnis) => {
      cancelAnimationFrame(uhr);
      huelle.remove();
      offen = false;
      fertig(ergebnis);
    };
    huelle.addEventListener('click', (e) => {
      const wahl = e.target.closest('[data-wahl]')?.dataset.wahl;
      if (wahl === 'abbrechen') schliessen(null);
      if (wahl === 'kaufen' && !kaufKnopf.disabled) schliessen({ art: angebot.id, bis: ablauf(angebot) });
    });
  });
}

// „Käufe wiederherstellen“: fragt den Store nach früheren Käufen dieser Apple-ID.
// Im Browser gibt es nichts wiederherzustellen.
export async function kaeufeWiederherstellen() {
  if (store()) {
    console.warn('In-App-Kauf: Wiederherstellen noch nicht angebunden.');
  }
  return null;
}
