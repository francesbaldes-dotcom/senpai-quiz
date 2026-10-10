// Torii-Pfad: Wochen-Herausforderung nach dem Vorbild der Quizduell-Events, mit eigenen Regeln.
//
// Neun Tore, jedes Tor ist eine Kategorie. Jede Woche (ISO-Woche, Montag bis Sonntag) gibt es
// neue Tore in neuer Reihenfolge. Ein Tor hat einen Pfad aus 20 Feldern; jede richtige Antwort
// ist ein Schritt. Auf Feld 5 und 15 liegt ein Stern (XP), auf Feld 10 der Schlüssel für das
// nächste Tor, auf Feld 20 eine Truhe (das Tor ist gemeistert). Gespielt wird in Läufen zu
// 5 Fragen; jeder Lauf kostet eine Laterne. Laternen wachsen mit der Zeit nach oder kommen
// per Belohnungsvideo. Richtige Antworten sind Punkte für die Bestenliste unter Duell-Freunden.
//
// Zustand: profil.torii = { woche, tore: [{ kat, felder, gefragt }], laternen, laterneSeit,
// punkte, gemeldet, allesGemeistert }

import { belohnungsvideo } from './werbung.js';
import * as online from './online.js';
import { kategorieIcon } from './grafik.js';

const TORE = 9;
const FELDER = 20; // richtige Antworten, bis ein Tor gemeistert ist
const LAUF = 5; // Fragen pro Lauf
const LATERNEN = 5; // höchstens so viele Laternen
const LATERNE_MIN = 30; // Minuten, bis eine Laterne nachwächst
const SCHLUESSEL_FELD = 10;
const BELOHNUNG = { 5: 'stern', 10: 'schluessel', 15: 'stern', 20: 'truhe' };
const XP_STERN = 20;
const XP_TRUHE = 100;
const XP_ALLE = 500; // alle neun Tore gemeistert
// Schwierigkeit je Tor: vorne leichter, hinten Otaku
const STUFEN_JE_TOR = [[1, 2], [1, 2], [1, 2], [2], [2], [2], [2, 3], [2, 3], [2, 3]];

let app = null; // Anbindung aus app.js
const tui = { ergebnis: null, liste: { stand: null, vorige: null, geladen: 0, laedt: false, fehler: '' } };

export function toriiEinrichten(anbindung) {
  app = anbindung;
  // Laternen-Uhr und Countdown sichtbar weiterlaufen lassen
  setInterval(() => {
    if (['torii', 'toriiListe'].includes(app.ui.screen) && !app.ui.dialog) app.render();
  }, 30000);
}

// ---------- Woche und Zustand ----------

// ISO-Woche wie auf dem Server (liga_woche), z. B. 2026-W41
function isoWoche(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const tag = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - tag);
  const jahrStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const woche = Math.ceil(((t - jahrStart) / 86400000 + 1) / 7);
  return { woche, schluessel: `${t.getUTCFullYear()}-W${String(woche).padStart(2, '0')}` };
}

// Ende der laufenden Woche: kommender Montag, 0 Uhr (Gerätezeit)
function wochenEnde() {
  const d = new Date();
  const tag = d.getDay() || 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 8 - tag);
}

function restzeit(bis) {
  const min = Math.max(0, Math.floor((bis - Date.now()) / 60000));
  const t = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  if (t) return `${t} T ${h} Std`;
  if (h) return `${h} Std ${min % 60} Min`;
  return `${min} Min`;
}

// Zustand der laufenden Woche; beim Wochenwechsel neue Tore, volle Laternen
function stand() {
  const p = app.profil();
  const w = isoWoche().schluessel;
  if (p.torii?.woche !== w) {
    const zufall = app.seededZufall(`torii-${w}`);
    const kats = app.mischen(Object.keys(app.KATEGORIEN()), zufall).slice(0, TORE);
    p.torii = { woche: w, tore: kats.map((kat) => ({ kat, felder: 0, gefragt: [] })), laternen: LATERNEN, laterneSeit: Date.now(), punkte: 0, gemeldet: 0, allesGemeistert: false };
    app.speichern();
  }
  return p.torii;
}

function torOffen(t, i) {
  return i === 0 || t.tore[i - 1].felder >= SCHLUESSEL_FELD;
}

function torGemeistert(tor) {
  return tor.felder >= FELDER;
}

function offeneTore(t) {
  return t.tore.filter((_, i) => torOffen(t, i)).length;
}

// Aktuelles Tor: das letzte offene, das noch nicht gemeistert ist
function aktuellesTor(t) {
  for (let i = TORE - 1; i >= 0; i--) if (torOffen(t, i) && !torGemeistert(t.tore[i])) return i;
  return -1;
}

// Laternen nachwachsen lassen; Rückgabe: Anzahl und Minuten bis zur nächsten
function laternen() {
  const t = stand();
  const takt = LATERNE_MIN * 60000;
  if (t.laternen >= LATERNEN) {
    t.laterneSeit = Date.now();
    return { n: t.laternen, naechste: null };
  }
  const dazu = Math.floor((Date.now() - t.laterneSeit) / takt);
  if (dazu > 0) {
    t.laternen = Math.min(LATERNEN, t.laternen + dazu);
    t.laterneSeit += dazu * takt;
    if (t.laternen >= LATERNEN) t.laterneSeit = Date.now();
    app.speichern();
  }
  const naechste = t.laternen >= LATERNEN ? null : Math.max(1, Math.ceil((t.laterneSeit + takt - Date.now()) / 60000));
  return { n: t.laternen, naechste };
}

// ---------- Fragen ----------

// Fragen für einen Lauf: Kategorie des Tors, passende Stufe, in dieser Woche noch nicht gefragt,
// bisher ungesehene zuerst. Der Rest dient dem Joker „Weiter“.
function laufFragen(i) {
  const t = stand();
  const tor = t.tore[i];
  const stufen = STUFEN_JE_TOR[i];
  const alle = app.FRAGEN().filter((f) => f.category === tor.kat);
  let pool = alle.filter((f) => stufen.includes(f.difficulty));
  if (pool.length < 30) pool = alle;
  const gefragt = new Set(tor.gefragt);
  const gesehen = new Set(app.profil().gesehen);
  const neu = app.mischen(pool.filter((f) => !gefragt.has(f.id) && !gesehen.has(f.id)));
  const bekannt = app.mischen(pool.filter((f) => !gefragt.has(f.id) && gesehen.has(f.id)));
  const wieder = app.mischen(pool.filter((f) => gefragt.has(f.id)));
  const sortiert = [...neu, ...bekannt, ...wieder];
  return { fragen: sortiert.slice(0, LAUF), reserve: sortiert.slice(LAUF) };
}

// ---------- Bausteine ----------

const ICON = {
  schluessel: '<svg class="ti-schluessel" width="22" height="22" viewBox="0 0 24 24" fill="#FFD23F" stroke="#141414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="12" r="4.5"/><circle cx="7.5" cy="12" r="1.4" fill="#141414"/><path d="M12 10.5h9v3h-2v3h-3v-3h-4z"/></svg>',
  stern: '<svg class="ti-stern" width="22" height="22" viewBox="0 0 24 24" fill="#FFD23F" stroke="#141414" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1-4.5-4.2 6.1-.8z"/></svg>',
  truhe: '<svg class="ti-truhe" width="24" height="24" viewBox="0 0 24 24" stroke="#141414" stroke-width="2" stroke-linejoin="round"><path d="M3 10a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v1H3z" fill="#D7261E"/><path d="M3 11h18v8H3z" fill="#8B5A2B"/><path d="M10 9.5h4v4h-4z" fill="#FFD23F"/></svg>',
  laterne: '<svg class="ti-laterne" width="22" height="22" viewBox="0 0 24 24" stroke="#141414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1.5v2"/><path d="M8.5 4.5h7M8.5 20h7" fill="none"/><path d="M8.5 4.5C4.5 6 4.5 18.5 8.5 20h7c4-1.5 4-14 0-15.5z" fill="#D7261E"/><path d="M6.2 9h11.6M5.8 12.3h12.4M6.2 15.6h11.6" stroke-width="1.4"/><path d="M12 20v2.5"/></svg>',
  laterneLeer: '<svg class="ti-laterne leer" width="22" height="22" viewBox="0 0 24 24" stroke="#8A857C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1.5v2"/><path d="M8.5 4.5C4.5 6 4.5 18.5 8.5 20h7c4-1.5 4-14 0-15.5z" fill="none"/><path d="M12 20v2.5"/></svg>',
};

function kategorieName(kat) {
  return app.KATEGORIEN()[kat] ?? kat;
}

// Pfad eines Tors: 20 Felder, gefüllt bis „felder“, Belohnungen als Symbole
function pfad(felder, neu = 0, klein = false) {
  return `<div class="ti-pfad ${klein ? 'klein' : ''}" aria-label="${felder} von ${FELDER} Feldern">${Array.from({ length: FELDER }, (_, i) => {
    const nr = i + 1;
    const b = BELOHNUNG[nr];
    const zustand = nr <= felder - neu ? 'voll' : nr <= felder ? 'voll neu' : '';
    return `<span class="ti-feld ${zustand} ${b ? 'belohnung' : ''}">${b ? ICON[b] : ''}</span>`;
  }).join('')}</div>`;
}

function laternenLeiste() {
  const l = laternen();
  return `<div class="ti-laternen" aria-label="${l.n} von ${LATERNEN} Laternen">
    <span class="reihe">${Array.from({ length: LATERNEN }, (_, i) => (i < l.n ? ICON.laterne : ICON.laterneLeer)).join('')}</span>
    <small>${l.naechste ? `+1 in ${l.naechste} Min` : 'voll'}</small>
  </div>`;
}

// Kopf der Frage während eines Laufs (wird in app.js in frageKopf eingesetzt)
export function toriiKopf(r) {
  const t = stand();
  const i = r.opts.tor;
  const tor = t.tore[i];
  const richtig = r.verlauf.filter(Boolean).length;
  return `<b>Tor ${i + 1} · ${app.esc(kategorieName(tor.kat))} · Frage ${r.index + 1} von ${r.fragen.length}</b>${pfad(Math.min(FELDER, tor.felder + richtig), richtig, true)}`;
}

// Karte auf der Startseite
export function toriiKarteStart() {
  if (!app?.FRAGEN().length) return '';
  const t = stand();
  const i = aktuellesTor(t);
  const tor = i >= 0 ? t.tore[i] : null;
  const text = tor ? `Tor ${i + 1} von ${TORE}: ${kategorieName(tor.kat)} · ${tor.felder} / ${FELDER}` : 'Alle neun Tore gemeistert!';
  return `<button class="karte startkarte torii" data-aktion="nav" data-ziel="torii">
    <span class="text">
      <span class="titel">${app.ICON.torii}Torii-Pfad</span>
      <small>${app.esc(text)}</small>
      <span class="ti-start-zeile">${ICON.schluessel}<b>${offeneTore(t)} / ${TORE}</b><span class="uhr">Noch ${restzeit(wochenEnde())}</span></span>
    </span>
    <span class="pfeil gelb">${app.ICON.weiter}</span>
  </button>`;
}

// ---------- Bildschirme ----------

function toriiScreen() {
  const t = stand();
  const w = isoWoche();
  const platz = meinPlatz();
  const offen = offeneTore(t);
  const gemeistert = t.tore.filter(torGemeistert).length;
  return `<section class="screen torii">
    <div class="kopfzeile">
      <button class="icon-knopf" data-aktion="nav" data-ziel="start" aria-label="Zurück zum Start">${app.ICON.zurueck}</button>
      <h1>Torii-Pfad</h1>
      ${laternenLeiste()}
    </div>

    <div class="karte ti-event">
      <div class="oben">
        <span class="label">Woche ${w.woche}</span>
        <span class="uhr">Noch ${restzeit(wochenEnde())}</span>
      </div>
      <div class="mitte">
        <img class="maskottchen" src="assets/stimmung/${gemeistert === TORE ? 'siegreich' : 'kaempferisch'}.webp" alt="">
        <div class="werte">
          <span><b>${t.punkte}</b><small>${t.punkte === 1 ? 'Punkt' : 'Punkte'}</small></span>
          <span><b>${platz ? `#${platz}` : '–'}</b><small>unter Freunden</small></span>
        </div>
      </div>
      <button class="knopf knopf-klein" data-aktion="nav" data-ziel="toriiListe">Bestenliste ${app.ICON.weiter}</button>
    </div>

    <div class="ti-tore">${t.tore.map((tor, i) => torKachel(t, tor, i)).join('')}</div>

    <div class="karte ti-schluesselleiste">
      <span class="kreis">${ICON.schluessel}</span>
      <div class="balken"><span style="width:${Math.round((offen / TORE) * 100)}%"></span></div>
      <b>${offen} / ${TORE}</b>
      <span class="ziel">${ICON.truhe}</span>
    </div>

    <p class="kleingedruckt ti-regeln">Jede richtige Antwort ist ein Schritt auf dem Pfad. Auf Feld ${SCHLUESSEL_FELD} liegt der Schlüssel für das nächste Tor, auf Feld 5 und 15 Sterne (+${XP_STERN} XP), auf Feld ${FELDER} eine Truhe (+${XP_TRUHE} XP). Ein Lauf hat ${LAUF} Fragen und kostet eine Laterne, alle ${LATERNE_MIN} Minuten wächst eine nach. Alle neun Tore bringen +${XP_ALLE} XP. Am Montag beginnt ein neuer Pfad.</p>
  </section>`;
}

function torKachel(t, tor, i) {
  const offen = torOffen(t, i);
  const meister = torGemeistert(tor);
  const zustand = !offen ? 'gesperrt' : meister ? 'gemeistert' : 'offen';
  const markierungen = [5, 10, 15, 20].map((f) => `<span class="${tor.felder >= f ? 'an' : ''}">${ICON[BELOHNUNG[f] === 'schluessel' && i === TORE - 1 ? 'stern' : BELOHNUNG[f]]}</span>`).join('');
  return `<button class="ti-tor ${zustand}" data-aktion="toriiTor" data-i="${i}" ${offen && !meister ? '' : 'aria-disabled="true"'} aria-label="Tor ${i + 1}: ${app.esc(kategorieName(tor.kat))}${!offen ? ', gesperrt' : meister ? ', gemeistert' : `, ${tor.felder} von ${FELDER}`}">
    <span class="nr">${i + 1}</span>
    <b>${app.esc(kategorieName(tor.kat))}</b>
    <span class="icon">${kategorieIcon(tor.kat, 40)}${!offen ? `<span class="schloss">${app.ICON.schloss}</span>` : ''}</span>
    ${offen ? `<span class="stand">${meister ? `${app.ICON.haken} gemeistert` : `${tor.felder} / ${FELDER}`}</span><span class="marken">${markierungen}</span>` : ''}
  </button>`;
}

function toriiErgebnisScreen() {
  const e = tui.ergebnis;
  if (!e) return toriiScreen();
  const t = stand();
  const tor = t.tore[e.tor];
  const l = laternen();
  const weiter = !torGemeistert(tor);
  const stimmung = e.alle ? 'konfetti' : e.belohnungen.includes('truhe') ? 'siegreich' : e.schluessel != null ? 'jubelnd' : e.richtig >= 4 ? 'daumenhoch' : e.richtig >= 2 ? 'entschlossen' : 'verlegen';
  const zeilen = [];
  if (e.schluessel != null) zeilen.push(`<div class="erfolg">${ICON.schluessel}<span><b>Schlüssel gefunden!</b><small>Tor ${e.schluessel + 1} ist offen: ${app.esc(kategorieName(t.tore[e.schluessel].kat))}</small></span></div>`);
  const sterne = e.belohnungen.filter((b) => b === 'stern').length;
  if (sterne) zeilen.push(`<div class="erfolg">${ICON.stern}<span><b>${sterne === 1 ? 'Ein Stern' : `${sterne} Sterne`}</b><small>+${sterne * XP_STERN} XP</small></span></div>`);
  if (e.belohnungen.includes('truhe')) zeilen.push(`<div class="erfolg">${ICON.truhe}<span><b>Tor gemeistert!</b><small>Die Truhe bringt +${XP_TRUHE} XP</small></span></div>`);
  if (e.alle) zeilen.push(`<div class="erfolg">${ICON.truhe}<span><b>Alle neun Tore!</b><small>Der ganze Pfad gemeistert: +${XP_ALLE} XP</small></span></div>`);
  return `<section class="screen torii ti-ergebnis-screen">
    <div class="karte ti-ergebnis">
      ${app.maskottchen(stimmung)}
      <span class="label">Tor ${e.tor + 1} · ${app.esc(kategorieName(tor.kat))}</span>
      <h2>${e.richtig} von ${e.gesamt} richtig</h2>
      ${pfad(tor.felder, e.neu)}
      <p>${tor.felder} / ${FELDER} Felder${weiter ? ` · noch ${Math.max(0, SCHLUESSEL_FELD - tor.felder) ? `${SCHLUESSEL_FELD - tor.felder} bis zum Schlüssel` : `${FELDER - tor.felder} bis zur Truhe`}` : ''}</p>
      <span class="xp">+${e.xp} XP · +${e.richtig} ${e.richtig === 1 ? 'Punkt' : 'Punkte'}</span>
    </div>
    ${zeilen.join('')}
    <div class="unten">
      ${weiter
        ? `<button class="knopf knopf-rot" data-aktion="toriiTor" data-i="${e.tor}">${l.n ? `Nächster Lauf · ${ICON.laterne} ${l.n}` : `${app.ICON.video} Laterne per Video`}</button>`
        : e.schluessel != null || aktuellesTor(t) >= 0 ? `<button class="knopf knopf-rot" data-aktion="nav" data-ziel="torii">Zum nächsten Tor ${app.ICON.weiter}</button>` : ''}
      <button class="knopf" data-aktion="nav" data-ziel="torii">Zum Torii-Pfad</button>
    </div>
  </section>`;
}

function toriiListeScreen() {
  const t = stand();
  const konto = app.onlineProfil?.();
  const l = tui.liste;
  let inhalt;
  if (konto === undefined) inhalt = '<p class="kleingedruckt">Verbinde mit dem Server …</p>';
  else if (!konto) {
    inhalt = `<div class="karte ti-liste-leer">
      <p>Die Bestenliste vergleicht deine Punkte dieser Woche mit allen, gegen die du schon ein Duell gespielt hast. Dafür brauchst du einen Account.</p>
      <button class="knopf knopf-rot" data-aktion="nav" data-ziel="duelle">${app.ICON.schwerter} Account anlegen</button>
    </div>`;
  } else {
    if (Date.now() - l.geladen > 60000 && !l.laedt) setTimeout(ladeListe, 0);
    const stand = l.stand ?? [];
    const sieger = (l.vorige ?? []).filter((x) => x.punkte > 0)[0];
    inhalt = `${l.fehler ? `<p class="fehler">${app.esc(l.fehler)}</p>` : ''}
      ${!l.stand ? '<p class="kleingedruckt">Lade die Bestenliste …</p>' : `<ol class="karte liga-liste ti-liste">${stand.map((x, i) => `<li class="${x.ich ? 'ich' : ''} ${i === 0 && x.punkte > 0 ? 'spitze' : ''}">
          <span class="platz">${i + 1}</span><span class="name">${app.esc(x.spielername)}${x.ich ? ' <small>(du)</small>' : ''}</span><span class="punkte">${x.punkte}</span>
        </li>`).join('')}</ol>`}
      ${l.stand && stand.length <= 1 ? `<p class="kleingedruckt">Du bist noch allein. Fordere Freunde zum Duell heraus, dann tretet ihr hier jede Woche gegeneinander an.</p><button class="knopf" data-aktion="nav" data-ziel="duelle">${app.ICON.schwerter} Freunde finden</button>` : ''}
      ${sieger ? `<p class="kleingedruckt">Letzte Woche vorn: ${app.esc(sieger.spielername)} mit ${sieger.punkte} Punkten.</p>` : ''}`;
  }
  return `<section class="screen torii">
    <div class="kopfzeile">
      <button class="icon-knopf" data-aktion="nav" data-ziel="torii" aria-label="Zurück zum Torii-Pfad">${app.ICON.zurueck}</button>
      <h1>Bestenliste</h1>
    </div>
    <div class="karte ti-event klein">
      <div class="oben"><span class="label">Woche ${isoWoche().woche} · deine Punkte</span><span class="uhr">Noch ${restzeit(wochenEnde())}</span></div>
      <b class="gross">${t.punkte}</b>
    </div>
    ${inhalt}
  </section>`;
}

export const TORII_SCREENS = {
  torii: toriiScreen,
  toriiErgebnis: toriiErgebnisScreen,
  toriiListe: toriiListeScreen,
};

// ---------- Ablauf ----------

// Nach dem Lauf (aus app.js beendeRunde bzw. abbrechen): Schritte, Belohnungen, XP, Punkte
export function toriiRundeFertig(r) {
  const p = app.profil();
  const t = stand();
  const i = r.opts.tor;
  const tor = t.tore[i];
  const richtig = r.verlauf.filter(Boolean).length;
  const vorher = tor.felder;
  tor.felder = Math.min(FELDER, vorher + richtig);
  tor.gefragt.push(...r.fragen.slice(0, r.verlauf.length).map((f) => f.id));
  const belohnungen = [];
  for (let f = vorher + 1; f <= tor.felder; f++) if (BELOHNUNG[f]) belohnungen.push(BELOHNUNG[f] === 'schluessel' && i === TORE - 1 ? 'stern' : BELOHNUNG[f]);
  const schluessel = belohnungen.includes('schluessel') ? i + 1 : null;
  let xp = Math.round(r.punkte / 10) + belohnungen.filter((b) => b === 'stern').length * XP_STERN + (belohnungen.includes('truhe') ? XP_TRUHE : 0);
  const alle = !t.allesGemeistert && t.tore.every(torGemeistert);
  if (alle) {
    t.allesGemeistert = true;
    xp += XP_ALLE;
  }
  t.punkte += richtig;
  p.xp += xp;
  p.spiele++;
  app.ereignis('runde', 'torii');
  app.speichern();
  melden();
  tui.ergebnis = { tor: i, richtig, gesamt: r.verlauf.length, neu: tor.felder - vorher, belohnungen, schluessel, xp, alle };
  app.ui.runde = null;
  app.ui.screen = 'toriiErgebnis';
  app.render();
}

async function laufStarten(i) {
  const t = stand();
  if (!torOffen(t, i) || torGemeistert(t.tore[i])) return;
  if (laternen().n < 1) {
    const ok = await app.frage({ titel: 'Keine Laterne mehr', text: `Alle ${LATERNE_MIN} Minuten wächst eine nach. Oder du siehst dir ein kurzes Video an und bekommst sofort eine.`, ja: 'Video ansehen', nein: 'Später', stimmung: 'schlafend' });
    if (!ok) return;
    const gesehen = await belohnungsvideo('1 Laterne für den Torii-Pfad');
    if (!gesehen) return;
    t.laternen += 1;
    app.speichern();
  }
  const { fragen, reserve } = laufFragen(i);
  if (!fragen.length) return;
  t.laternen -= 1;
  if (t.laternen === LATERNEN - 1) t.laterneSeit = Date.now();
  app.speichern();
  app.neueRunde('torii', { tor: i, fragen, reserve });
}

export const toriiAktionen = {
  toriiTor(d) {
    laufStarten(Number(d.i));
  },
};

// ---------- Bestenliste ----------

let meldet = false;

// Punkte als Wochenstand melden (der Server übernimmt nur höhere Stände)
async function melden() {
  const t = stand();
  if (meldet || t.punkte <= t.gemeldet || !app.onlineProfil?.()) return;
  meldet = true;
  const punkte = t.punkte;
  try {
    await online.toriiMelden(punkte);
    t.gemeldet = Math.max(t.gemeldet, punkte);
    app.speichern();
    tui.liste.geladen = 0;
  } catch (fehler) {
    console.warn('Torii-Meldung fehlgeschlagen:', fehler.message);
  }
  meldet = false;
}

async function ladeListe() {
  const l = tui.liste;
  if (l.laedt || !app.onlineProfil?.()) return;
  l.laedt = true;
  l.fehler = '';
  try {
    await melden();
    const [jetzt, vorige] = await Promise.all([online.toriiStand(false), online.toriiStand(true)]);
    l.stand = jetzt;
    l.vorige = vorige;
    l.geladen = Date.now();
  } catch (fehler) {
    l.fehler = fehler.message;
  }
  l.laedt = false;
  if (['torii', 'toriiListe'].includes(app.ui.screen)) app.render();
}

function meinPlatz() {
  if (!app.onlineProfil?.()) return null;
  const l = tui.liste;
  if (Date.now() - l.geladen > 60000 && !l.laedt) setTimeout(ladeListe, 0);
  const i = (l.stand ?? []).findIndex((x) => x.ich);
  return i >= 0 ? i + 1 : null;
}
