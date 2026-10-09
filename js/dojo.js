// Senpai Dojo: Japanisch lernen (Kana mit Eselsbrücken, Anime-Vokabeln).
//
// Eigenes Modul mit eigenen Bildschirmen und Aktionen; app.js bindet es über
// dojoEinrichten() an (Profil, Speichern, Render, Bausteine). Die Inhalte
// stehen in data/dojo.json. Das Dojo ist eine Kauf-Funktion: Die ersten
// Lektionen sind frei, der Rest braucht Abo oder Einmalkauf (js/kauf.js).
//
// Lernen nach Leitner: Jede Karte hat ein Fach 0–5. Richtig → ein Fach höher,
// falsch → zurück auf 0. Das Fach bestimmt den Abstand bis zur nächsten
// Wiederholung (INTERVALLE in Tagen) und die Art der Abfrage: erst erkennen
// (Mehrfachwahl), dann schreiben (Zeichen wählen), ab Fach 3 die Lesung tippen.
// Ab Fach 3 „sitzt“ eine Karte und zählt für den Gürtel.

import { ANGEBOTE, kaufen, kaufOffen, kaufMoeglich, kaeufeWiederherstellen } from './kauf.js';

const INTERVALLE = [0, 1, 3, 7, 14, 30]; // Tage bis zur nächsten Wiederholung je Fach
const SITZT_AB = 3; // ab diesem Fach zählt eine Karte als gelernt
const MAX_WIEDERHOLUNG = 20; // Karten pro Wiederholungsrunde
const XP_RICHTIG = 5;
const XP_LEKTION = 25; // beim ersten Abschluss einer Lektion
const HOEREN_ANTEIL = 0.3; // Anteil der Hör-Aufgaben, wenn eine japanische Stimme da ist

// Profil-Teil (profil.dojo). karten: { id: { f: Fach, bis: 'JJJJ-MM-TT' } }
export const DOJO_PROFIL = { frei: null, karten: {}, lektionen: [], tage: {} };

let DATEN = null; // data/dojo.json
let KARTEN = {}; // id → Karte
let LEKTIONEN = []; // alle Lektionen in Reihenfolge, mit .gruppe und .karten (IDs)
let app = null; // Anbindung aus app.js

// Zustand der Dojo-Bildschirme
const dui = {
  lektion: null, // Lektion auf den Lernkarten
  schritt: 0, // Index der Lernkarte
  runde: null, // laufende Abfrage
  ergebnis: null,
  eingabe: '',
  meldung: '',
  fehler: '',
  kauft: false,
};

// ---------- Daten ----------

export async function ladeDojo() {
  const antwort = await fetch('data/dojo.json');
  DATEN = await antwort.json();
  KARTEN = {};
  LEKTIONEN = [];
  for (const g of DATEN.gruppen) {
    for (const l of g.lektionen) {
      const lektion = { ...l, gruppe: g, karten: [] };
      for (const z of l.zeichen ?? []) {
        const id = `${g.id === 'hiragana' ? 'h' : 'k'}:${z[0]}`;
        KARTEN[id] = { id, typ: 'kana', schrift: g.titel, lektion, zeichen: z[0], romaji: z[1], merk: z[2], nurLernen: !!z[3] };
        lektion.karten.push(id);
      }
      for (const w of l.woerter ?? []) {
        const id = `v:${w[1]}`;
        KARTEN[id] = { id, typ: 'vokabel', lektion, ja: w[0], romaji: w[1], de: w[2], hinweis: w[3] };
        lektion.karten.push(id);
      }
      LEKTIONEN.push(lektion);
    }
  }
}

export function dojoEinrichten(anbindung) {
  app = anbindung;
  const p = app.profil();
  p.dojo ||= structuredClone(DOJO_PROFIL);
  p.dojo.karten ||= {};
  p.dojo.lektionen ||= [];
  p.dojo.tage ||= {};
  stimmenLaden();
  document.getElementById('app').addEventListener('input', (e) => {
    if (e.target.id === 'dojo-eingabe') dui.eingabe = e.target.value;
  });
  document.addEventListener('keydown', tastatur);
}

function profil() {
  return app.profil();
}

function heute() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function tagPlus(tage) {
  const d = new Date();
  d.setDate(d.getDate() + tage);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function mischen(liste) {
  const l = [...liste];
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}

// ---------- Freischaltung ----------

export function dojoFrei() {
  const frei = profil().dojo?.frei;
  if (frei?.art === 'einmal') return true;
  if (frei?.bis && new Date(frei.bis) > new Date()) return true;
  const bis = app.onlineProfil?.()?.dojo_bis;
  return !!bis && new Date(bis) > new Date();
}

function freiText() {
  const frei = profil().dojo?.frei;
  if (frei?.art === 'einmal') return 'Für immer freigeschaltet';
  if (frei?.bis && new Date(frei.bis) > new Date()) return `Abo läuft bis ${new Date(frei.bis).toLocaleDateString('de-DE')}`;
  if (dojoFrei()) return 'Freigeschaltet';
  return '';
}

function lektionOffen(l) {
  return l.frei || dojoFrei();
}

// ---------- Lernstand ----------

function fach(id) {
  return profil().dojo.karten[id]?.f ?? -1; // -1 = noch nie gelernt
}

function sitzt(id) {
  return fach(id) >= SITZT_AB;
}

function faelligeKarten() {
  const h = heute();
  const karten = profil().dojo.karten;
  return Object.keys(karten)
    .filter((id) => KARTEN[id] && !KARTEN[id].nurLernen && karten[id].bis <= h && lektionOffen(KARTEN[id].lektion))
    .sort((a, b) => karten[a].f - karten[b].f || karten[a].bis.localeCompare(karten[b].bis));
}

function lektionStand(l) {
  const abfragbar = l.karten.filter((id) => !KARTEN[id].nurLernen);
  return {
    gesamt: abfragbar.length,
    gelernt: abfragbar.filter((id) => fach(id) >= 0).length,
    sitzt: abfragbar.filter((id) => sitzt(id)).length,
    fertig: profil().dojo.lektionen.includes(l.id),
  };
}

function gesamtSitzt() {
  return Object.keys(KARTEN).filter((id) => sitzt(id)).length;
}

function guertel(n = gesamtSitzt()) {
  const liste = DATEN.guertel;
  let aktuell = liste[0];
  for (const g of liste) if (n >= g.ab) aktuell = g;
  const naechster = liste[liste.indexOf(aktuell) + 1] ?? null;
  return { ...aktuell, naechster, n };
}

function guertelChip(g = guertel()) {
  return `<span class="guertel-chip"><span class="guertel-punkt" style="background:${g.farbe}"></span>${app.esc(g.name)}er Gürtel</span>`;
}

function naechsteLektion(l) {
  const i = LEKTIONEN.indexOf(l);
  return LEKTIONEN.slice(i + 1).find((x) => !lektionStand(x).fertig && lektionOffen(x)) ?? null;
}

// ---------- Sprachausgabe ----------

let stimme = null;

function stimmenLaden() {
  if (!('speechSynthesis' in window)) return;
  const suche = () => {
    const stimmen = speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('ja'));
    stimme = stimmen.find((v) => v.localService) ?? stimmen[0] ?? null;
  };
  suche();
  speechSynthesis.addEventListener?.('voiceschanged', suche);
}

function kannSprechen() {
  return !!stimme;
}

function sprich(karte) {
  if (!stimme) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(karte.typ === 'kana' ? karte.zeichen : karte.ja);
  u.voice = stimme;
  u.lang = 'ja-JP';
  u.rate = 0.85;
  speechSynthesis.speak(u);
}

const ICON_LAUT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';

// ---------- Abfrage ----------

// Anzeige-Texte einer Karte
function vorderseite(k) {
  return k.typ === 'kana' ? k.zeichen : k.ja;
}
function rueckseite(k) {
  return k.typ === 'kana' ? k.romaji : k.de;
}

// Art der Aufgabe je Fach: erkennen → schreiben → tippen, dazwischen Hören
function aufgabenArt(id, erzwungen = null) {
  if (erzwungen) return erzwungen;
  const f = fach(id);
  if (kannSprechen() && f >= 1 && Math.random() < HOEREN_ANTEIL) return 'hoeren';
  if (f <= 1) return 'lesen';
  if (f === 2) return 'schreiben';
  return 'tippen';
}

// Drei Ablenker aus derselben Schrift bzw. aus den Vokabeln, bevorzugt aus derselben Lektion
function ablenker(k, n = 3) {
  const gleich = (x) => x.id !== k.id && x.typ === k.typ && (k.typ !== 'kana' || x.schrift === k.schrift) && !x.nurLernen && rueckseite(x) !== rueckseite(k) && vorderseite(x) !== vorderseite(k);
  const nah = mischen(k.lektion.karten.map((id) => KARTEN[id]).filter(gleich));
  const fern = mischen(Object.values(KARTEN).filter((x) => gleich(x) && !k.lektion.karten.includes(x.id)));
  const gewaehlt = [];
  for (const x of [...nah, ...fern]) {
    if (gewaehlt.length >= n) break;
    if (!gewaehlt.some((g) => rueckseite(g) === rueckseite(x) || vorderseite(g) === vorderseite(x))) gewaehlt.push(x);
  }
  return gewaehlt;
}

function baueAufgabe(id, art) {
  const k = KARTEN[id];
  const a = { id, karte: k, art, ergebnis: null, optionen: null, loesung: 0 };
  if (art !== 'tippen') {
    const andere = ablenker(k);
    const alle = mischen([k, ...andere]);
    a.optionen = alle.map((x) => (art === 'lesen' ? rueckseite(x) : art === 'schreiben' ? vorderseite(x) : k.typ === 'kana' ? vorderseite(x) : rueckseite(x)));
    a.loesung = alle.indexOf(k);
  }
  return a;
}

function starteRunde(art, ids, lektion = null) {
  const aufgaben = [];
  if (art === 'lektion') {
    // erst alle erkennen, dann alle schreiben
    mischen(ids).forEach((id) => aufgaben.push(baueAufgabe(id, 'lesen')));
    mischen(ids).forEach((id) => aufgaben.push(baueAufgabe(id, kannSprechen() && Math.random() < HOEREN_ANTEIL ? 'hoeren' : 'schreiben')));
  } else {
    ids.forEach((id) => aufgaben.push(baueAufgabe(id, aufgabenArt(id))));
  }
  dui.runde = { art, lektion, aufgaben, i: 0, richtig: 0, falsch: 0, xp: 0, gesehen: new Set(), guertelVorher: guertel().ab };
  dui.eingabe = '';
  app.ui.screen = 'dojoAbfrage';
  app.render();
  starteAufgabe();
}

function aktuelleAufgabe() {
  return dui.runde?.aufgaben[dui.runde.i] ?? null;
}

function starteAufgabe() {
  const a = aktuelleAufgabe();
  if (!a) return;
  if (a.art === 'hoeren') setTimeout(() => sprich(a.karte), 250);
  if (a.art === 'tippen') setTimeout(() => document.getElementById('dojo-eingabe')?.focus(), 50);
}

// Rōmaji vergleichbar machen: Makrons, Doppelvokale, Leerzeichen, Bindestriche
function normal(text) {
  return String(text).toLowerCase()
    .replace(/[āâ]/g, 'a').replace(/[īî]/g, 'i').replace(/[ūû]/g, 'u').replace(/[ēê]/g, 'e').replace(/[ōô]/g, 'o')
    .replace(/[\s\-–'’]/g, '')
    .replace(/ou|oo/g, 'o').replace(/uu/g, 'u').replace(/aa/g, 'a').replace(/ee/g, 'e');
}

function tippRichtig(a, eingabe) {
  const soll = normal(a.karte.romaji);
  const ist = normal(eingabe);
  if (!ist) return false;
  if (ist === soll) return true;
  // gängige Schreibvarianten
  const varianten = [soll.replace(/shi/g, 'si').replace(/chi/g, 'ti').replace(/tsu/g, 'tu').replace(/fu/g, 'hu').replace(/ji/g, 'zi'), soll.replace(/n(?=[bmp])/g, 'm')];
  return varianten.includes(ist);
}

function werte(a, korrekt) {
  const r = dui.runde;
  const p = profil();
  const karten = p.dojo.karten;
  const vorher = karten[a.id]?.f ?? -1;
  const f = korrekt ? Math.min(INTERVALLE.length - 1, Math.max(0, vorher) + 1) : 0;
  karten[a.id] = { f, bis: tagPlus(INTERVALLE[f]) };
  a.ergebnis = { korrekt, fachVorher: vorher, fach: f };
  if (korrekt) {
    r.richtig++;
    r.xp += XP_RICHTIG;
    p.xp += XP_RICHTIG;
  } else {
    r.falsch++;
    // falsche Karte noch einmal ans Ende der Runde, aber höchstens einmal
    if (!r.gesehen.has(a.id)) {
      r.gesehen.add(a.id);
      r.aufgaben.push(baueAufgabe(a.id, a.art === 'tippen' ? 'tippen' : 'lesen'));
    }
  }
  p.dojo.tage[heute()] = (p.dojo.tage[heute()] ?? 0) + 1;
  app.speichern();
  app.render();
}

function beendeRunde() {
  const r = dui.runde;
  const p = profil();
  let lektionNeu = false;
  if (r.art === 'lektion' && r.lektion && !p.dojo.lektionen.includes(r.lektion.id)) {
    p.dojo.lektionen.push(r.lektion.id);
    p.xp += XP_LEKTION;
    r.xp += XP_LEKTION;
    lektionNeu = true;
  }
  app.speichern();
  const g = guertel();
  dui.ergebnis = { ...r, lektionNeu, guertel: g, aufgestiegen: g.ab > r.guertelVorher };
  dui.runde = null;
  app.ui.screen = 'dojoErgebnis';
  app.render();
}

function tastatur(e) {
  if (app?.ui.screen !== 'dojoAbfrage' || kaufOffen() || app.ui.dialog) return;
  const a = aktuelleAufgabe();
  if (!a) return;
  if (a.ergebnis && (e.key === 'Enter' || e.key === ' ')) {
    if (e.target?.tagName === 'INPUT') return; // Formular übernimmt
    e.preventDefault();
    aktionen.dojoNaechste();
    return;
  }
  if (e.target?.tagName === 'INPUT') return;
  const n = Number(e.key);
  if (!a.ergebnis && a.optionen && n >= 1 && n <= a.optionen.length) aktionen.dojoAntwort({ i: n - 1 });
}

// ---------- Aktionen ----------

const aktionen = {
  dojoLektion(d) {
    const l = LEKTIONEN.find((x) => x.id === d.id);
    if (!l) return;
    if (!lektionOffen(l)) return aktionen.dojoKauf();
    dui.lektion = l;
    dui.schritt = 0;
    dui.meldung = '';
    app.ui.screen = 'dojoLernen';
    app.render();
  },
  dojoSchritt(d) {
    const n = Number(d.n);
    if (!dui.lektion) return;
    dui.schritt = Math.max(0, Math.min(dui.lektion.karten.length - 1, dui.schritt + n));
    app.render();
  },
  dojoAbfrageStart() {
    const l = dui.lektion;
    if (!l) return;
    starteRunde('lektion', l.karten.filter((id) => !KARTEN[id].nurLernen), l);
  },
  dojoWiederholen() {
    const ids = faelligeKarten().slice(0, MAX_WIEDERHOLUNG);
    if (!ids.length) return;
    starteRunde('wiederholen', ids);
  },
  dojoSprich(d) {
    const k = d.id ? KARTEN[d.id] : aktuelleAufgabe()?.karte;
    if (k) sprich(k);
  },
  dojoAntwort(d) {
    const a = aktuelleAufgabe();
    if (!a || a.ergebnis || !a.optionen) return;
    a.gewaehlt = Number(d.i);
    werte(a, a.gewaehlt === a.loesung);
  },
  dojoPruefen() {
    const a = aktuelleAufgabe();
    if (!a || a.ergebnis || a.art !== 'tippen') return;
    a.gewaehlt = dui.eingabe.trim();
    if (!a.gewaehlt) return;
    werte(a, tippRichtig(a, a.gewaehlt));
    document.getElementById('dojo-weiter')?.focus();
  },
  dojoNaechste() {
    const r = dui.runde;
    const a = aktuelleAufgabe();
    if (!r || !a?.ergebnis) return;
    r.i++;
    dui.eingabe = '';
    if (r.i >= r.aufgaben.length) return beendeRunde();
    app.render();
    starteAufgabe();
  },
  async dojoAbbrechen() {
    if (!dui.runde || app.ui.dialog) return;
    const ok = await app.frage({ titel: 'Abfrage beenden?', text: 'Beantwortete Karten bleiben gespeichert.', ja: 'Beenden', nein: 'Weiterlernen', stimmung: 'panisch' });
    if (!ok || !dui.runde) return;
    dui.runde = null;
    app.ui.screen = 'dojo';
    app.render();
  },
  dojoWeiterLernen() {
    const l = dui.ergebnis?.lektion ? naechsteLektion(dui.ergebnis.lektion) : null;
    if (l) return aktionen.dojoLektion({ id: l.id });
    aktionen.dojoZurueck();
  },
  dojoZurueck() {
    dui.lektion = null;
    dui.runde = null;
    dui.ergebnis = null;
    dui.fehler = '';
    app.ui.screen = 'dojo';
    app.render();
  },
  dojoKauf() {
    dui.fehler = '';
    dui.meldung = '';
    app.ui.screen = 'dojoKauf';
    app.render();
  },
  async dojoKaufen(d) {
    if (dui.kauft || kaufOffen()) return;
    dui.kauft = true;
    dui.fehler = '';
    app.render();
    try {
      const ergebnis = await kaufen(d.angebot);
      if (ergebnis) {
        profil().dojo.frei = { ...ergebnis, seit: new Date().toISOString() };
        app.speichern();
        dui.meldung = ergebnis.art === 'einmal' ? 'Das Dojo gehört dir. Für immer.' : 'Abo aktiv. Willkommen im Dojo!';
        app.ui.screen = 'dojo';
      }
    } catch (fehler) {
      dui.fehler = 'Der Kauf hat nicht geklappt. Bitte versuch es noch einmal.';
      console.warn('Kauf fehlgeschlagen:', fehler);
    }
    dui.kauft = false;
    app.render();
  },
  async dojoWiederherstellen() {
    if (dui.kauft) return;
    dui.kauft = true;
    dui.fehler = '';
    app.render();
    const ergebnis = await kaeufeWiederherstellen();
    if (ergebnis) {
      profil().dojo.frei = { ...ergebnis, seit: new Date().toISOString() };
      app.speichern();
      dui.meldung = 'Kauf wiederhergestellt.';
      app.ui.screen = 'dojo';
    } else {
      dui.fehler = 'Kein früherer Kauf gefunden.';
    }
    dui.kauft = false;
    app.render();
  },
};

export const dojoAktionen = aktionen;

// ---------- Bildschirme ----------

const JP = (text) => `<span class="jp">${app.esc(text)}</span>`;

// Karte auf der Startseite
export function dojoKarteStart() {
  if (!DATEN) return '';
  const frei = dojoFrei();
  const g = guertel();
  const faellig = faelligeKarten().length;
  let text;
  if (!frei && !g.n && !Object.keys(profil().dojo.karten).length) text = 'Hiragana, Katakana und 150 Anime-Vokabeln. Probelektionen gratis.';
  else if (faellig) text = `${faellig} ${faellig === 1 ? 'Karte' : 'Karten'} zum Wiederholen fällig`;
  else text = `${g.name}er Gürtel · ${g.n} ${g.n === 1 ? 'Karte sitzt' : 'Karten sitzen'}`;
  return `<button class="karte dojokarte" data-aktion="nav" data-ziel="dojo">
    <img src="assets/stimmung/mentor.webp" alt="" class="maskottchen">
    <span class="text">
      <span class="label">Senpai Dojo</span>
      <span class="display">Japanisch lernen</span>
      <small>${app.esc(text)}</small>
    </span>
    <span class="pfeil ${frei ? '' : 'schloss'}">${frei ? app.ICON.weiter : app.ICON.schloss}</span>
  </button>`;
}

function kopf(titel, zurueckZiel = 'start', rechts = '') {
  return `<div class="kopfzeile">
    <button class="icon-knopf" data-aktion="${zurueckZiel === 'dojo' ? 'dojoZurueck' : 'nav'}" data-ziel="${zurueckZiel}" aria-label="Zurück">${app.ICON.zurueck}</button>
    <h1 class="display" style="margin:0;flex:1;font-size:20px;line-height:1.1">${app.esc(titel)}</h1>
    ${rechts}
  </div>`;
}

function dojoScreen() {
  const g = guertel();
  const meldung = dui.meldung;
  dui.meldung = ''; // nur einmal zeigen
  const faellig = faelligeKarten().length;
  const frei = dojoFrei();
  const bisNaechster = g.naechster ? (g.n - g.ab) / (g.naechster.ab - g.ab) : 1;
  return `<section class="screen mit-tabbar dojo">
    ${kopf('Senpai Dojo', 'start', guertelChip(g))}
    ${meldung ? `<p class="meldung">${app.esc(meldung)}</p>` : ''}

    <div class="karte guertel-karte">
      ${app.maskottchen(faellig ? 'kaempferisch' : 'mentor')}
      <div class="text">
        <span class="display">${g.n} ${g.n === 1 ? 'Karte sitzt' : 'Karten sitzen'}</span>
        <div class="balken"><span style="width:${Math.round(Math.min(1, bisNaechster) * 100)}%"></span></div>
        <small>${g.naechster ? `Noch ${g.naechster.ab - g.n} bis zum ${app.esc(g.naechster.name)}en Gürtel` : 'Schwarzer Gürtel. Du bist der Senpai.'}</small>
        ${frei ? `<span class="frei-zeile">${app.ICON.haken} ${app.esc(freiText())}</span>` : ''}
      </div>
    </div>

    ${faellig
      ? `<button class="knopf knopf-rot" data-aktion="dojoWiederholen">${app.ICON.nochmal} Wiederholen · ${faellig} fällig</button>`
      : `<p class="kleingedruckt" style="margin:0;text-align:center">${Object.keys(profil().dojo.karten).length ? 'Heute ist nichts zum Wiederholen fällig. Lern eine neue Lektion!' : 'Fang mit der ersten Lektion an. Fällige Karten erscheinen hier zum Wiederholen.'}</p>`}

    ${frei ? '' : `<div class="karte dojo-hinweis">
      <span class="label">Probe</span>
      <p>Reihe A und die ersten zehn Wörter sind gratis. Alles andere schaltest du mit Abo oder Einmalkauf frei.</p>
      <button class="knopf knopf-klein" data-aktion="dojoKauf">${app.ICON.schloss} Dojo freischalten</button>
    </div>`}

    ${DATEN.gruppen.map((gr) => `<div class="abschnitt">
      <div class="gruppe-kopf"><h2>${app.esc(gr.titel)}</h2><p>${app.esc(gr.text)}</p></div>
      <div class="lektionen">${gr.lektionen.map((l) => lektionZeile(LEKTIONEN.find((x) => x.id === l.id))).join('')}</div>
    </div>`).join('')}

    ${app.tabbar('start')}
  </section>`;
}

function lektionZeile(l) {
  const s = lektionStand(l);
  const offen = lektionOffen(l);
  const status = !offen ? 'gesperrt' : s.fertig ? 'fertig' : s.gelernt ? 'offen' : '';
  const statusInhalt = !offen ? app.ICON.schloss : s.fertig ? app.ICON.haken : app.esc(String(LEKTIONEN.indexOf(l) + 1));
  const vorschau = l.zeichen ? l.zeichen.slice(0, 5).map((z) => z[0]).join(' ') : `${l.woerter.length} Wörter`;
  return `<button class="lektion ${status}" data-aktion="dojoLektion" data-id="${l.id}" aria-label="${app.esc(l.titel)}${offen ? '' : ', gesperrt'}">
    <span class="status ${status}">${statusInhalt}</span>
    <span class="text">
      <b>${app.esc(l.titel)}</b>
      <small>${JP(vorschau)} · ${s.sitzt} / ${s.gesamt} ${s.gesamt === 1 ? 'sitzt' : 'sitzen'}</small>
      ${l.frei && !dojoFrei() ? '<span class="probe">Gratis</span>' : ''}
    </span>
    <span class="rechts">${offen ? app.ICON.weiter : ''}</span>
  </button>`;
}

function dojoLernenScreen() {
  const l = dui.lektion;
  if (!l) return dojoScreen();
  const k = KARTEN[l.karten[dui.schritt]];
  const letzte = dui.schritt === l.karten.length - 1;
  return `<section class="screen dojo">
    ${kopf(l.titel, 'dojo', `<span class="tag">${dui.schritt + 1} / ${l.karten.length}</span>`)}
    <div class="balken"><span style="width:${Math.round(((dui.schritt + 1) / l.karten.length) * 100)}%"></span></div>

    <div class="karte lernkarte">
      <span class="schrift">${app.esc(k.typ === 'kana' ? k.schrift : 'Vokabel')}</span>
      <span class="zeichen ${k.typ === 'kana' ? '' : 'wort'}" lang="ja">${app.esc(vorderseite(k))}</span>
      <span class="romaji">${app.esc(k.romaji)}</span>
      ${k.typ === 'vokabel' ? `<span class="bedeutung">${app.esc(k.de)}</span>` : ''}
      <p class="merk">${app.esc(k.typ === 'kana' ? k.merk : k.hinweis)}</p>
      ${kannSprechen() ? `<button class="knopf hoer-knopf" data-aktion="dojoSprich" data-id="${k.id}">${ICON_LAUT} Anhören</button>` : ''}
    </div>

    <div class="unten">
      <div class="zweier">
        <button class="knopf" data-aktion="dojoSchritt" data-n="-1" ${dui.schritt === 0 ? 'disabled' : ''}>${app.ICON.zurueck} Zurück</button>
        ${letzte
          ? `<button class="knopf knopf-rot" data-aktion="dojoAbfrageStart">Abfrage ${app.ICON.weiter}</button>`
          : `<button class="knopf knopf-rot" data-aktion="dojoSchritt" data-n="1">Weiter ${app.ICON.weiter}</button>`}
      </div>
      ${letzte ? '' : '<button class="leise-knopf" data-aktion="dojoAbfrageStart">Kenne ich schon, direkt zur Abfrage</button>'}
    </div>
  </section>`;
}

const AUFGABEN_TEXT = {
  lesen: { kana: 'Welche Silbe ist das?', vokabel: 'Was heißt das?' },
  schreiben: { kana: 'Welches Zeichen ist das?', vokabel: 'Wie schreibt man das?' },
  tippen: { kana: 'Tippe die Lesung', vokabel: 'Tippe die Lesung (Rōmaji)' },
  hoeren: { kana: 'Was hörst du?', vokabel: 'Was hörst du?' },
};

function dojoAbfrageScreen() {
  const r = dui.runde;
  const a = aktuelleAufgabe();
  if (!r || !a) return dojoScreen();
  const k = a.karte;
  const vorne = a.art === 'lesen' || a.art === 'tippen';
  const titel = r.art === 'lektion' ? r.lektion.titel : 'Wiederholen';
  return `<section class="screen dojo">
    <div class="kopfzeile">
      <button class="icon-knopf" data-aktion="dojoAbbrechen" aria-label="Abfrage beenden">${app.ICON.kreuz}</button>
      <div class="fortschritt">
        <span class="label">${app.esc(titel)} · ${r.i + 1} / ${r.aufgaben.length}</span>
        <div class="balken"><span style="width:${Math.round((r.i / r.aufgaben.length) * 100)}%"></span></div>
      </div>
      <span class="tag">${app.ICON.haken} ${r.richtig}</span>
    </div>

    <div class="karte dojo-frage">
      <span class="aufgabe">${app.esc(AUFGABEN_TEXT[a.art][k.typ])}</span>
      ${a.art === 'hoeren'
        ? `<button class="knopf hoer-knopf gross" data-aktion="dojoSprich" aria-label="Noch einmal anhören">${ICON_LAUT}</button>`
        : vorne
          ? `<span class="zeichen ${k.typ === 'kana' ? '' : 'wort'}" lang="ja">${app.esc(vorderseite(k))}</span>`
          : `<span class="text">${app.esc(rueckseite(k))}</span>`}
    </div>

    ${a.art === 'tippen' ? tippForm(a) : antworten(a)}

    <div class="unten">${a.ergebnis ? ergebnisBanner(a) : ''}</div>
  </section>`;
}

function antworten(a) {
  const k = a.karte;
  const japanisch = a.art === 'schreiben' || (a.art === 'hoeren' && k.typ === 'kana');
  const kurz = k.typ === 'kana' || japanisch;
  return `<div class="antworten dojo-antworten ${kurz ? 'gitter' : ''}">${a.optionen.map((o, i) => {
    let zustand = '';
    if (a.ergebnis) {
      if (i === a.loesung) zustand = 'richtig';
      else if (i === a.gewaehlt) zustand = 'falsch';
      else zustand = 'blass';
    }
    return `<button class="antwort ${zustand}" data-aktion="dojoAntwort" data-i="${i}" ${a.ergebnis ? 'disabled' : ''}>
      <span class="buchstabe">${i + 1}</span><span class="text ${japanisch ? 'jp' : ''}" ${japanisch ? 'lang="ja"' : ''}>${app.esc(o)}</span>
    </button>`;
  }).join('')}</div>`;
}

function tippForm(a) {
  return `<form class="formular tipp-form" data-aktion="dojoPruefen" autocomplete="off">
    <input id="dojo-eingabe" type="text" inputmode="latin" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="z. B. ka" value="${app.esc(dui.eingabe)}" ${a.ergebnis ? 'disabled' : ''} aria-label="Lesung eingeben">
    ${a.ergebnis ? '' : '<button class="knopf knopf-rot" type="submit">Prüfen</button>'}
  </form>`;
}

function ergebnisBanner(a) {
  const k = a.karte;
  const e = a.ergebnis;
  const loesung = k.typ === 'kana' ? `${k.zeichen} = ${k.romaji}` : `${k.ja} · ${k.romaji} · ${k.de}`;
  return `<div class="banner ${e.korrekt ? 'gut' : 'schlecht'}">
    <div class="text">
      <span class="display">${e.korrekt ? 'Richtig!' : 'Nicht ganz.'}</span>
      <span>${JP(loesung)}</span>
      ${!e.korrekt || a.art === 'tippen' ? `<p class="merk">${app.esc(k.typ === 'kana' ? k.merk : k.hinweis)}</p>` : ''}
    </div>
    <button class="knopf" id="dojo-weiter" data-aktion="dojoNaechste">Weiter</button>
  </div>`;
}

function dojoErgebnisScreen() {
  const e = dui.ergebnis;
  if (!e) return dojoScreen();
  const gesamt = e.richtig + e.falsch;
  const quote = gesamt ? e.richtig / gesamt : 0;
  const stimmung = e.aufgestiegen ? 'siegreich' : quote >= 0.9 ? 'stolz' : quote >= 0.6 ? 'jubelnd' : 'entschlossen';
  const naechste = e.lektion ? naechsteLektion(e.lektion) : null;
  const senpai = e.aufgestiegen
    ? `Neuer Gürtel: ${e.guertel.name}!`
    : e.lektionNeu ? 'Lektion geschafft. Morgen fragt dich der Senpai noch einmal ab.' : quote >= 0.9 ? 'Sauber. Das sitzt.' : 'Fehler sind Teil des Trainings. Die Karten kommen wieder.';
  return `<section class="screen dojo">
    <div class="karte dojo-ergebnis">
      ${app.maskottchen(stimmung)}
      <h2>${e.richtig} von ${gesamt} richtig</h2>
      <p>${app.esc(senpai)}</p>
      <span class="xp">+${e.xp} XP</span>
      ${e.aufgestiegen ? guertelChip(e.guertel) : ''}
    </div>
    <div class="unten">
      ${naechste ? `<button class="knopf knopf-rot" data-aktion="dojoWeiterLernen">Weiter: ${app.esc(naechste.titel)} ${app.ICON.weiter}</button>` : ''}
      <button class="knopf" data-aktion="dojoZurueck">Zurück zum Dojo</button>
    </div>
  </section>`;
}

function dojoKaufScreen() {
  return `<section class="screen dojo">
    ${kopf('Dojo freischalten', 'dojo')}
    <div class="karte kauf-karte">
      ${app.maskottchen('mentor')}
      <h2>Lern Japanisch mit dem Senpai</h2>
      <ul>
        <li>Alle Hiragana und Katakana mit Eselsbrücken</li>
        <li>150 Anime-Vokabeln in 15 Lektionen, es kommen laufend neue</li>
        <li>Wiederholung in wachsenden Abständen, damit es hängen bleibt</li>
        <li>Gürtel vom Weißen bis zum Schwarzen</li>
      </ul>
      ${dui.fehler ? `<p class="fehler">${app.esc(dui.fehler)}</p>` : ''}
      ${kaufMoeglich() ? '' : '<p class="meldung">Kaufen geht nur in der iPhone-App. In der Web-Version kannst du die kostenlosen Lektionen spielen.</p>'}
      ${ANGEBOTE.map((a) => `<button class="angebot ${a.id === 'einmal' ? 'empfohlen' : ''}" data-aktion="dojoKaufen" data-angebot="${a.id}" ${dui.kauft || !kaufMoeglich() ? 'disabled' : ''}>
        <span class="text"><b>${app.esc(a.name)}</b><small>${app.esc(a.text)}</small></span>
        <span class="preis"><b>${app.esc(a.preis)}</b><small>${app.esc(a.je)}</small></span>
      </button>`).join('')}
      <button class="leise-knopf" data-aktion="dojoWiederherstellen" ${dui.kauft ? 'disabled' : ''}>Käufe wiederherstellen</button>
      <p class="kleingedruckt" style="margin:0;text-align:center">Das Monatsabo kostet 2,99 € pro Monat, wird über deine Apple-ID abgerechnet und verlängert sich automatisch, wenn du es nicht spätestens 24 Stunden vor Ablauf kündigst. Kündigen kannst du jederzeit in den iOS-Einstellungen unter Abonnements. Der Einmalkauf gilt dauerhaft. Es gelten die <a href="nutzungsbedingungen.html#dojo" target="_blank" rel="noopener">Nutzungsbedingungen</a> und die <a href="datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a>.</p>
    </div>
  </section>`;
}

export const DOJO_SCREENS = {
  dojo: dojoScreen,
  dojoLernen: dojoLernenScreen,
  dojoAbfrage: dojoAbfrageScreen,
  dojoErgebnis: dojoErgebnisScreen,
  dojoKauf: dojoKaufScreen,
};
