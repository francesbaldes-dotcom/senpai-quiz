// Belohnungsvideos. Im Browser läuft eine Werbe-Attrappe mit Countdown.
// In der iPhone-App kommt hier das AdMob-Plugin (@capacitor-community/admob) hinein, wie bei Resist the Cute.
// Rückgabe: true, wenn das Video bis zum Ende angesehen wurde und es die Belohnung gibt.

const DAUER = 5; // Sekunden; echte Videos dauern meist 15–30 s

let offen = false;

export function werbungOffen() {
  return offen;
}

export function belohnungsvideo(belohnung) {
  if (offen) return Promise.resolve(false);
  offen = true;
  return new Promise((fertig) => {
    const huelle = document.createElement('div');
    huelle.className = 'werbung';
    huelle.setAttribute('role', 'dialog');
    huelle.setAttribute('aria-modal', 'true');
    huelle.setAttribute('aria-label', 'Werbevideo');
    huelle.innerHTML = `<div class="werbung-karte">
      <span class="label">Werbung · Platzhalter</span>
      <p class="werbung-text">Hier läuft in der App später ein kurzes Werbevideo.</p>
      <div class="balken"><span></span></div>
      <p class="werbung-belohnung"></p>
      <div class="zweier">
        <button class="knopf" data-wahl="abbrechen">Abbrechen</button>
        <button class="knopf knopf-video" data-wahl="fertig" disabled></button>
      </div>
    </div>`;
    huelle.querySelector('.werbung-belohnung').textContent = `Belohnung: ${belohnung}`;
    document.body.append(huelle);

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
      offen = false;
      fertig(knopf.dataset.wahl === 'fertig');
    });
  });
}
