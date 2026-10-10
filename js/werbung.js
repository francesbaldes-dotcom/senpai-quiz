// Belohnungsvideos. Im Browser läuft eine Werbe-Attrappe mit Countdown. In der iPhone-App
// liefert Google AdMob (@capacitor-community/admob) echte Videos. Vor dem ersten Video holt
// die App die Einwilligung über Googles Fenster (UMP) ein und fragt danach iOS nach dem
// Tracking (App Tracking Transparency), so wie es datenschutz.html Abschnitt 8 beschreibt.
// Rückgabe von belohnungsvideo(): true, wenn das Video bis zum Ende lief und es die Belohnung gibt.

const DAUER = 5; // Sekunden Attrappe; echte Videos dauern meist 15–30 s

// AdMob-Kennungen. Bis zum Store-Start laufen Googles Test-Anzeigen; die echten Kennungen
// stehen im AdMob-Konto. Die App-ID steht zusätzlich in ios/App/App/Info.plist
// (GADApplicationIdentifier), die Anzeigen-ID hier.
const WERBE_ID = { belohnung: 'ca-app-pub-3940256099942544/1712485313' }; // Googles Test-ID „Rewarded“
const TESTMODUS = true; // vor dem Store-Start auf false setzen und echte Kennungen eintragen

const NATIV = !!window.Capacitor?.isNativePlatform?.();

function admob() {
  return NATIV ? window.Capacitor.Plugins?.AdMob ?? null : null;
}

let offen = false;
let bereit = null; // Promise der einmaligen Initialisierung (SDK, Einwilligung, Tracking-Abfrage)

export function werbungOffen() {
  return offen;
}

// Gibt es in dieser Umgebung echte Werbung mit Einwilligungs-Fenster? (nur iPhone-App)
export function werbeEinwilligungMoeglich() {
  return !!admob();
}

function vorbereiten() {
  const a = admob();
  if (!a) return Promise.resolve(false);
  bereit ||= (async () => {
    await a.initialize({ initializeForTesting: TESTMODUS });
    const info = await a.requestConsentInfo({});
    if (info.isConsentFormAvailable && info.status === 'REQUIRED') await a.showConsentForm();
    const tracking = await a.trackingAuthorizationStatus();
    if (tracking.status === 'notDetermined') await a.requestTrackingAuthorization();
    return true;
  })().catch((fehler) => {
    console.warn('AdMob konnte nicht starten:', fehler);
    bereit = null; // beim nächsten Video noch einmal versuchen
    return false;
  });
  return bereit;
}

// „Werbe-Einwilligung“ unter „Über Senpai Quiz“: Googles Fenster erneut öffnen.
// Rückgabe: kurzer Text für die Meldung in der App.
export async function werbeEinwilligungAendern() {
  const a = admob();
  if (!a) return 'Werbe-Einstellungen gibt es nur in der iPhone-App.';
  try {
    if (!(await vorbereiten())) return 'Die Werbe-Einstellungen sind gerade nicht erreichbar.';
    const info = await a.requestConsentInfo({});
    if (info.privacyOptionsRequirementStatus === 'REQUIRED') {
      await a.showPrivacyOptionsForm();
      return 'Deine Werbe-Einwilligung ist gespeichert.';
    }
    await a.resetConsentInfo();
    const neu = await a.requestConsentInfo({});
    if (neu.isConsentFormAvailable) {
      await a.showConsentForm();
      return 'Deine Werbe-Einwilligung ist gespeichert.';
    }
    return 'Für deine Region ist keine Einwilligung nötig. Tracking regelst du in den iOS-Einstellungen unter Datenschutz & Sicherheit.';
  } catch (fehler) {
    console.warn('Werbe-Einwilligung:', fehler);
    return `Das hat nicht geklappt: ${fehler?.message ?? fehler}`;
  }
}

function huelleBauen(belohnung, text, knopfText) {
  const huelle = document.createElement('div');
  huelle.className = 'werbung';
  huelle.setAttribute('role', 'dialog');
  huelle.setAttribute('aria-modal', 'true');
  huelle.setAttribute('aria-label', 'Werbevideo');
  huelle.innerHTML = `<div class="werbung-karte">
    <span class="label">Werbung</span>
    <p class="werbung-text"></p>
    <div class="balken"><span></span></div>
    <p class="werbung-belohnung"></p>
    <div class="zweier">
      <button class="knopf" data-wahl="abbrechen">Abbrechen</button>
      <button class="knopf knopf-video" data-wahl="fertig" disabled></button>
    </div>
  </div>`;
  huelle.querySelector('.werbung-text').textContent = text;
  huelle.querySelector('.werbung-belohnung').textContent = `Belohnung: ${belohnung}`;
  huelle.querySelector('[data-wahl="fertig"]').textContent = knopfText;
  document.body.append(huelle);
  return huelle;
}

// iPhone-App: echtes Video über AdMob. Während das Video lädt, zeigt die App eine kleine
// Karte mit „Abbrechen“; das Video selbst ist ein natives Vollbild von Google.
async function nativesVideo(belohnung) {
  const a = admob();
  const huelle = huelleBauen(belohnung, 'Das Video wird geladen …', 'Lädt …');
  huelle.querySelector('.balken').hidden = true;
  const abbruch = new Promise((fertig) => {
    huelle.addEventListener('click', (e) => { if (e.target.closest('[data-wahl="abbrechen"]')) fertig('abbruch'); });
  });
  const handles = [];
  let belohnt = false;
  try {
    const start = await Promise.race([vorbereiten(), abbruch]);
    if (start === 'abbruch') return false;
    if (!start) throw new Error('AdMob nicht bereit');
    const zuEnde = new Promise((fertig) => {
      handles.push(
        a.addListener('onRewardedVideoAdReward', () => { belohnt = true; }),
        a.addListener('onRewardedVideoAdDismissed', () => fertig('zu')),
        a.addListener('onRewardedVideoAdFailedToShow', () => fertig('fehler')),
      );
    });
    await Promise.all(handles);
    const geladen = await Promise.race([a.prepareRewardVideoAd({ adId: WERBE_ID.belohnung, isTesting: TESTMODUS }), abbruch]);
    if (geladen === 'abbruch') return false;
    huelle.remove();
    await a.showRewardVideoAd();
    await zuEnde;
    return belohnt;
  } catch (fehler) {
    console.warn('Belohnungsvideo:', fehler);
    if (!huelle.isConnected) return belohnt;
    // Kein Video verfügbar: kurz sagen und schließen lassen
    huelle.querySelector('.werbung-text').textContent = 'Gerade ist kein Video verfügbar. Versuch es später noch einmal.';
    huelle.querySelector('[data-wahl="fertig"]').hidden = true;
    huelle.querySelector('[data-wahl="abbrechen"]').textContent = 'Schließen';
    await abbruch;
    return false;
  } finally {
    for (const h of handles) h.then?.((x) => x.remove?.()).catch?.(() => {});
    huelle.remove();
  }
}

// Browser: Attrappe mit Countdown, es gibt keinen Werbepartner im Web.
function attrappe(belohnung) {
  return new Promise((fertig) => {
    const huelle = huelleBauen(belohnung, 'Hier läuft in der iPhone-App ein kurzes Werbevideo. Im Browser ist das nur ein Platzhalter.', '');
    huelle.querySelector('.label').textContent = 'Werbung · Platzhalter';
    const balken = huelle.querySelector('.balken span');
    const fertigKnopf = huelle.querySelector('[data-wahl="fertig"]');
    const start = Date.now();
    let uhr = null;
    const tick = () => {
      const rest = Math.max(0, DAUER - (Date.now() - start) / 1000);
      balken.style.width = `${(1 - rest / DAUER) * 100}%`;
      fertigKnopf.textContent = rest > 0 ? `Noch ${Math.ceil(rest)} s` : 'Belohnung holen';
      if (rest <= 0) {
        fertigKnopf.disabled = false;
        clearInterval(uhr);
      }
    };
    uhr = setInterval(tick, 100);
    tick();
    huelle.addEventListener('click', (e) => {
      const knopf = e.target.closest('[data-wahl]');
      if (!knopf || knopf.disabled) return;
      clearInterval(uhr);
      huelle.remove();
      fertig(knopf.dataset.wahl === 'fertig');
    });
  });
}

export async function belohnungsvideo(belohnung) {
  if (offen) return false;
  offen = true;
  try {
    return await (admob() ? nativesVideo(belohnung) : attrappe(belohnung));
  } finally {
    offen = false;
  }
}
