// In-App-Käufe für das Senpai Dojo. Im Browser läuft eine Kauf-Attrappe.
//
// In der iPhone-App läuft der Kauf über den App Store (Apple verlangt für
// Lerninhalte In-App-Käufe, keine Web-Zahlung), direkt mit StoreKit 2 über das
// Plugin @capgo/native-purchases, ohne Drittanbieter wie RevenueCat. Die
// Produkt-IDs unten sind die Kennungen, die in App Store Connect angelegt werden;
// zum Testen im Simulator liegen sie in ios/App/Products.storekit.
//
// Rückgabe von kaufen(): { art, bis } bei Erfolg (bis = Ablauf der bezahlten
// Periode als ISO-Datum), sonst null (abgebrochen oder fehlgeschlagen).

export const ANGEBOTE = [
  { id: 'abo', produkt: 'de.senpaiquiz.dojo.monat', name: 'Monatsabo', preis: '2,99 €', je: 'pro Monat', text: 'Jederzeit kündbar, verlängert sich automatisch.', tage: 30 },
  { id: 'jahr', produkt: 'de.senpaiquiz.dojo.jahr', name: 'Jahresabo', preis: '19,99 €', je: 'pro Jahr', text: 'Fast die Hälfte günstiger als monatlich. Jederzeit kündbar.', tage: 365 },
];

const ATTRAPPE_DAUER = 1.5; // Sekunden „Verbindung zum Store“

// Die Attrappe läuft nur bei lokaler Entwicklung. Auf der veröffentlichten
// Web-Version (GitHub Pages) gibt es keinen Store, dort ist das Dojo nur
// über die Probelektionen nutzbar; gekauft wird in der iPhone-App.
// Achtung: In der Capacitor-App heißt der Host ebenfalls „localhost“ (capacitor://localhost).
// Dort darf die Attrappe nie laufen, sonst wäre das Dojo ohne Kauf offen.
const NATIV = !!window.Capacitor?.isNativePlatform?.();
const LOKAL = !NATIV && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

let offen = false;

export function kaufOffen() {
  return offen;
}

// Kann hier überhaupt gekauft werden? (nativ mit Store oder lokale Attrappe)
export function kaufMoeglich() {
  return !!store() || LOKAL;
}

function store() {
  // Natives Plugin (StoreKit 2); im Browser gibt es keinen Store.
  return NATIV ? window.Capacitor.Plugins?.NativePurchases ?? null : null;
}

// Preise aus dem App Store holen (Landeswährung, Steuern), ersetzt die festen Texte in ANGEBOTE.
export async function preiseLaden() {
  const s = store();
  if (!s) return false;
  try {
    const { products } = await s.getProducts({ productIdentifiers: ANGEBOTE.map((a) => a.produkt) });
    for (const produkt of products) {
      const angebot = ANGEBOTE.find((a) => a.produkt === produkt.identifier);
      if (angebot && produkt.priceString) angebot.preis = produkt.priceString;
    }
    return products.length > 0;
  } catch (fehler) {
    console.warn('Store-Preise:', fehler);
    return false;
  }
}

// Aus einer Store-Transaktion den Freischalt-Stand ableiten; null, wenn nichts (mehr) gilt.
function ausTransaktion(t) {
  const angebot = ANGEBOTE.find((a) => a.produkt === t.productIdentifier);
  if (!angebot || t.revocationDate) return null;
  const bis = t.expirationDate ?? ablauf(angebot);
  return new Date(bis) > new Date() ? { art: angebot.id, bis } : null;
}

// Was gilt laut App Store gerade? (das Abo mit dem spätesten Ablauf; null ohne gültigen Kauf)
export async function aktuelleKaeufe() {
  const s = store();
  if (!s) return null;
  try {
    const { purchases } = await s.getPurchases({ onlyCurrentEntitlements: true });
    const gueltig = purchases.map(ausTransaktion).filter(Boolean);
    return gueltig.sort((a, b) => new Date(b.bis) - new Date(a.bis))[0] ?? null;
  } catch (fehler) {
    console.warn('Store-Käufe:', fehler);
    return null;
  }
}

async function nativKaufen(angebot) {
  const s = store();
  try {
    const t = await s.purchaseProduct({ productIdentifier: angebot.produkt, productType: angebot.tage ? 'subs' : 'inapp', quantity: 1 });
    return ausTransaktion({ ...t, productIdentifier: t.productIdentifier ?? angebot.produkt }) ?? { art: angebot.id, bis: ablauf(angebot) };
  } catch (fehler) {
    // Abbruch im Apple-Fenster ist kein Fehler
    if (/cancel|abgebrochen/i.test(String(fehler?.message ?? fehler))) return null;
    throw fehler;
  }
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
  if (store()) return nativKaufen(angebot);
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
  const s = store();
  if (!s) return null;
  await s.restorePurchases();
  return aktuelleKaeufe();
}
