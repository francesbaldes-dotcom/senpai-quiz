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
import * as online from './online.js';

const INTERVALLE = [0, 1, 3, 7, 14, 30]; // Tage bis zur nächsten Wiederholung je Fach
const SITZT_AB = 3; // ab diesem Fach zählt eine Karte als gelernt
const MAX_WIEDERHOLUNG = 20; // Karten pro Wiederholungsrunde
const XP_RICHTIG = 5;
const XP_LEKTION = 25; // beim ersten Abschluss einer Lektion
const HOEREN_ANTEIL = 0.3; // Anteil der Hör-Aufgaben, wenn eine japanische Stimme da ist
const BILD_ANTEIL = 0.25; // Anteil der Bild-Aufgaben bei Karten mit Bild
const ZIELE = [5, 10, 20]; // wählbares Tagesziel (Karten pro Tag)
const BLITZ_DAUER = 60; // Sekunden für „Paare finden“
const BLITZ_PAARE = 5; // Paare gleichzeitig auf dem Brett
const XP_PAAR = 2;

// Lernstufen = Leitner-Fächer 0–5 mit Namen (wie WaniKani: Apprentice … Burned)
export const STUFEN = [
  { name: 'Neuling', farbe: '#D9D4C7' },
  { name: 'Schüler', farbe: '#FFD23F' },
  { name: 'Geselle', farbe: '#FF8A3D' },
  { name: 'Meister', farbe: '#177A41' },
  { name: 'Erleuchtet', farbe: '#1F5FD1' },
  { name: 'Eingebrannt', farbe: '#141414' },
];

// Profil-Teil (profil.dojo). karten: { id: { f: Fach, bis: 'JJJJ-MM-TT' } }
export const DOJO_PROFIL = { frei: null, karten: {}, lektionen: [], tage: {}, ziel: 10, fehler: { datum: null, ids: [] }, blitz: 0, wochen: {}, ligaOffen: 0 };

let DATEN = null; // data/dojo.json
let KARTEN = {}; // id → Karte
let LEKTIONEN = []; // alle Lektionen in Reihenfolge, mit .gruppe und .karten (IDs)
let app = null; // Anbindung aus app.js

// Zustand der Dojo-Bildschirme
const dui = {
  lektion: null, // Lektion auf den Lernkarten
  schritt: 0, // Index der Lernkarte
  runde: null, // laufende Abfrage
  blitz: null, // laufendes „Paare finden“
  ergebnis: null,
  zielErreicht: false, // Tagesziel in dieser Runde erreicht (für den Ergebnis-Bildschirm)
  liga: { stand: null, vorige: null, geladen: 0, laedt: false, fehler: '' }, // Wochenliga vom Server
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
        KARTEN[id] = { id, typ: 'vokabel', lektion, ja: w[0], romaji: w[1], de: w[2], hinweis: w[3], bild: w[4] ? `assets/dojo/${w[4]}.webp` : null };
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
  p.dojo.ziel ||= 10;
  p.dojo.fehler ||= { datum: null, ids: [] };
  p.dojo.blitz ||= 0;
  p.dojo.wochen ||= {}; // Dojo-Punkte je ISO-Woche, lokal
  p.dojo.ligaOffen ||= 0; // noch nicht an den Server gemeldete Punkte
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

// Tagesziel: gezählt werden beantwortete Karten und gefundene Paare
function heuteZahl() {
  return profil().dojo.tage[heute()] ?? 0;
}

function zaehleHeute(n = 1) {
  const p = profil();
  const vorher = heuteZahl();
  p.dojo.tage[heute()] = vorher + n;
  if (vorher < p.dojo.ziel && vorher + n >= p.dojo.ziel) {
    app.serie(); // Tagesziel erreicht → Serie läuft weiter wie beim Tagesquiz
    dui.zielErreicht = true;
  }
}

// Fehler des Tages (Duolingo „Fehler üben“): bleiben, bis sie in einer Fehler-Runde richtig waren
function fehlerHeute() {
  const f = profil().dojo.fehler;
  return f.datum === heute() ? f.ids.filter((id) => KARTEN[id] && lektionOffen(KARTEN[id].lektion)) : [];
}

function merkeFehler(id, korrekt, fehlerRunde) {
  const f = profil().dojo.fehler;
  if (f.datum !== heute()) {
    f.datum = heute();
    f.ids = [];
  }
  if (!korrekt && !f.ids.includes(id)) f.ids.push(id);
  if (korrekt && fehlerRunde) f.ids = f.ids.filter((x) => x !== id);
}

// Nächste sinnvolle Lektion: die erste offene, die noch nicht abgeschlossen ist
function empfohleneLektion() {
  return LEKTIONEN.find((l) => lektionOffen(l) && !lektionStand(l).fertig) ?? null;
}

// Anzahl Karten je Stufe in einer Lektion (für die Stufen-Leiste)
function stufenZaehler(l) {
  const z = STUFEN.map(() => 0);
  for (const id of l.karten) if (!KARTEN[id].nurLernen && fach(id) >= 0) z[fach(id)]++;
  return z;
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

const GUERTEL_BILD = { 'Weiß': 'weiss', 'Gelb': 'gelb', 'Orange': 'orange', 'Grün': 'gruen', 'Blau': 'blau', 'Braun': 'braun', 'Schwarz': 'schwarz' };

// Maskottchen im Karate-Anzug mit dem aktuellen Gürtel (assets/dojo/guertel-*.webp)
function guertelBild(g = guertel(), klasse = 'maskottchen') {
  return `<img class="${klasse}" src="assets/dojo/guertel-${GUERTEL_BILD[g.name] ?? 'weiss'}.webp" alt="">`;
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
  const k = KARTEN[id];
  const f = fach(id);
  const z = Math.random();
  if (kannSprechen() && f >= 1 && z < HOEREN_ANTEIL) return 'hoeren';
  if (k.bild && f >= 1 && z < HOEREN_ANTEIL + BILD_ANTEIL) return 'bild';
  if (f <= 1) return 'lesen';
  if (f === 2) return k.typ === 'vokabel' && Math.random() < 0.5 ? 'bauen' : 'schreiben';
  return k.typ === 'vokabel' && Math.random() < 0.3 ? 'bauen' : 'tippen';
}

// Kana-Kacheln für „Silben ordnen“: die Zeichen des Worts plus zwei Ablenker derselben Schrift
function kacheln(k) {
  const zeichen = Array.from(k.ja);
  const schrift = /[\u30A0-\u30FF]/.test(k.ja) ? 'k:' : 'h:';
  const pool = Object.values(KARTEN).filter((x) => x.typ === 'kana' && x.id.startsWith(schrift) && !x.nurLernen && !zeichen.includes(x.zeichen));
  const extra = mischen(pool).slice(0, 2).map((x) => x.zeichen);
  return mischen([...zeichen, ...extra]).map((z) => ({ z, benutzt: false }));
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
  if (art === 'bauen') {
    a.kacheln = kacheln(k);
    a.gebaut = []; // Indizes der angetippten Kacheln
  } else if (art !== 'tippen') {
    const andere = ablenker(k);
    const alle = mischen([k, ...andere]);
    a.optionen = alle.map((x) => (art === 'lesen' ? rueckseite(x) : art === 'schreiben' || art === 'bild' ? vorderseite(x) : k.typ === 'kana' ? vorderseite(x) : rueckseite(x)));
    a.loesung = alle.indexOf(k);
  }
  return a;
}

function starteRunde(art, ids, lektion = null) {
  const aufgaben = [];
  if (art === 'lektion') {
    // erst alle erkennen, dann alle schreiben
    mischen(ids).forEach((id) => aufgaben.push(baueAufgabe(id, 'lesen')));
    // zweiter Durchgang: Kana schreiben, Vokabeln abwechselnd zusammensetzen und schreiben, dazwischen Hören
    mischen(ids).forEach((id, i) => {
      const k = KARTEN[id];
      let art = k.typ === 'vokabel' && i % 2 === 0 ? 'bauen' : 'schreiben';
      if (kannSprechen() && Math.random() < HOEREN_ANTEIL) art = 'hoeren';
      aufgaben.push(baueAufgabe(id, art));
    });
  } else {
    ids.forEach((id) => aufgaben.push(baueAufgabe(id, aufgabenArt(id))));
  }
  dui.runde = { art, lektion, aufgaben, i: 0, richtig: 0, falsch: 0, xp: 0, gesehen: new Set(), guertelVorher: guertel().ab };
  dui.eingabe = '';
  dui.zielErreicht = false;
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
  // Streuung (wie Anki): ab Fach 2 ±15 %, damit nicht alle Karten einer Lektion am selben Tag fällig werden
  const tage = INTERVALLE[f];
  const streu = f >= 2 ? Math.round((Math.random() * 2 - 1) * tage * 0.15) : 0;
  karten[a.id] = { f, bis: tagPlus(tage + streu) };
  a.ergebnis = { korrekt, fachVorher: vorher, fach: f };
  merkeFehler(a.id, korrekt, r.art === 'fehler');
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
  zaehleHeute(1);
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
  ligaPunkte(r.xp);
  app.speichern();
  const g = guertel();
  dui.ergebnis = { ...r, lektionNeu, guertel: g, aufgestiegen: g.ab > r.guertelVorher, zielErreicht: dui.zielErreicht };
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
  if (!a.ergebnis && a.kacheln && e.key === 'Backspace') aktionen.dojoKachelZurueck();
}

// ---------- Wochenliga ----------

// ISO-Woche wie auf dem Server (liga_woche), z. B. 2026-W41
function isoWoche(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const tag = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - tag);
  const jahrStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const woche = Math.ceil(((t - jahrStart) / 86400000 + 1) / 7);
  return { jahr: t.getUTCFullYear(), woche, schluessel: `${t.getUTCFullYear()}-W${String(woche).padStart(2, '0')}` };
}

function wochenPunkte() {
  return profil().dojo.wochen[isoWoche().schluessel] ?? 0;
}

// Im Dojo verdiente XP als Liga-Punkte verbuchen und, wenn möglich, melden
function ligaPunkte(xp) {
  if (!xp) return;
  const p = profil();
  const w = isoWoche().schluessel;
  p.dojo.wochen[w] = (p.dojo.wochen[w] ?? 0) + xp;
  for (const k of Object.keys(p.dojo.wochen)) if (k !== w && k !== isoWoche(new Date(Date.now() - 7 * 86400000)).schluessel) delete p.dojo.wochen[k];
  p.dojo.ligaOffen += xp;
  ligaSenden();
}

let ligaSendet = false;

async function ligaSenden() {
  const p = profil();
  if (ligaSendet || !p.dojo.ligaOffen || !app.onlineProfil?.()) return;
  ligaSendet = true;
  const punkte = p.dojo.ligaOffen;
  try {
    await online.ligaMelden(punkte);
    p.dojo.ligaOffen = Math.max(0, p.dojo.ligaOffen - punkte);
    app.speichern();
    dui.liga.geladen = 0; // Stand ist veraltet
    if (app.ui.screen === 'dojo' && !dui.liga.laedt) setTimeout(ladeLiga, 0);
  } catch (fehler) {
    console.warn('Liga-Meldung fehlgeschlagen:', fehler.message);
  }
  ligaSendet = false;
}

async function ladeLiga() {
  const l = dui.liga;
  if (l.laedt || !app.onlineProfil?.()) return;
  l.laedt = true;
  l.fehler = '';
  try {
    await ligaSenden();
    const [stand, vorige] = await Promise.all([online.ligaStand(false), online.ligaStand(true)]);
    l.stand = stand;
    l.vorige = vorige;
    l.geladen = Date.now();
  } catch (fehler) {
    l.fehler = fehler.message;
  }
  l.laedt = false;
  if (app.ui.screen === 'dojo') app.render();
}

function ligaKarte() {
  const w = isoWoche();
  const konto = app.onlineProfil?.();
  const l = dui.liga;
  const meine = wochenPunkte();
  const kopf = `<div class="oben"><span class="label">Wochenliga · KW ${w.woche}</span><span class="stand">${meine} ${meine === 1 ? 'Punkt' : 'Punkte'}</span></div>`;
  if (konto === undefined) return `<div class="karte liga">${kopf}<small>Verbinde mit dem Server …</small></div>`;
  if (!konto) {
    return `<div class="karte liga">${kopf}
      <small>Dojo-Punkte sind die XP, die du hier verdienst. Mit einem Account trittst du jede Woche gegen deine Duell-Freunde an.</small>
      <button class="knopf knopf-klein" data-aktion="nav" data-ziel="duelle">${app.ICON.schwerter} Account anlegen</button>
    </div>`;
  }
  if (Date.now() - l.geladen > 60000 && !l.laedt) setTimeout(ladeLiga, 0);
  const stand = l.stand ?? [];
  const sieger = (l.vorige ?? []).filter((e) => e.punkte > 0)[0];
  return `<div class="karte liga">${kopf}
    ${l.fehler ? `<p class="fehler">${app.esc(l.fehler)}</p>` : ''}
    ${!l.stand ? '<small>Lade die Liga …</small>' : stand.length <= 1
      ? `<small>Du bist noch allein in deiner Liga. Fordere Freunde zum Duell heraus, dann seht ihr hier eure Wochenpunkte im Vergleich.</small>
         <button class="knopf knopf-klein" data-aktion="nav" data-ziel="duelle">${app.ICON.schwerter} Freunde finden</button>`
      : `<ol class="liga-liste">${stand.slice(0, 10).map((e, i) => `<li class="${e.ich ? 'ich' : ''} ${i === 0 && e.punkte > 0 ? 'spitze' : ''}">
          <span class="platz">${i + 1}</span><span class="name">${app.esc(e.spielername)}${e.ich ? ' <small>(du)</small>' : ''}</span><span class="punkte">${e.punkte}</span>
        </li>`).join('')}</ol>`}
    <small class="liga-fuss">Endet Sonntag um Mitternacht.${sieger ? ` Letzte Woche vorn: ${app.esc(sieger.spielername)} mit ${sieger.punkte} Punkten.` : ''}</small>
  </div>`;
}

// ---------- Paare finden (Blitz) ----------

let blitzUhr = null;

function blitzPool() {
  const offen = (id) => !KARTEN[id].nurLernen && lektionOffen(KARTEN[id].lektion);
  const gelernt = Object.keys(KARTEN).filter((id) => offen(id) && fach(id) >= 0);
  if (gelernt.length >= 10) return gelernt;
  const frei = LEKTIONEN.filter((l) => l.frei).flatMap((l) => l.karten).filter(offen);
  return [...new Set([...gelernt, ...frei])];
}

function starteBlitz() {
  const b = { warteschlange: mischen(blitzPool()), brett: [], links: [], rechts: [], wahlLinks: null, wahlRechts: null, falsch: null, punkte: 0, fehler: 0, ende: Date.now() + BLITZ_DAUER * 1000 };
  dui.blitz = b;
  dui.zielErreicht = false;
  blitzNachfuellen();
  app.ui.screen = 'dojoBlitz';
  app.render();
  clearInterval(blitzUhr);
  blitzUhr = setInterval(blitzTick, 200);
}

// Brett auf fünf Paare auffüllen; Karten mit gleicher Lesung oder Bedeutung nie gleichzeitig
function blitzNachfuellen() {
  const b = dui.blitz;
  let versuche = b.warteschlange.length;
  while (b.brett.length < BLITZ_PAARE && b.warteschlange.length && versuche-- > 0) {
    const id = b.warteschlange.shift();
    const k = KARTEN[id];
    if (b.brett.some((x) => rueckseite(KARTEN[x]) === rueckseite(k) || vorderseite(KARTEN[x]) === vorderseite(k))) {
      b.warteschlange.push(id);
      continue;
    }
    b.brett.push(id);
    b.links.push(id);
    b.rechts.splice(Math.floor(Math.random() * (b.rechts.length + 1)), 0, id);
  }
}

function blitzTick() {
  const b = dui.blitz;
  if (!b || app.ui.screen !== 'dojoBlitz') return clearInterval(blitzUhr);
  const rest = Math.max(0, b.ende - Date.now());
  const balken = document.getElementById('blitz-balken');
  const zeit = document.getElementById('blitz-zeit');
  if (balken) balken.style.width = `${(rest / (BLITZ_DAUER * 1000)) * 100}%`;
  if (zeit) zeit.textContent = `${Math.ceil(rest / 1000)} s`;
  if (rest <= 0) beendeBlitz();
}

function blitzWahl(seite, id) {
  const b = dui.blitz;
  if (!b || b.falsch) return;
  if (seite === 'links') b.wahlLinks = b.wahlLinks === id ? null : id;
  else b.wahlRechts = b.wahlRechts === id ? null : id;
  if (b.wahlLinks && b.wahlRechts) {
    if (b.wahlLinks === b.wahlRechts) {
      b.punkte++;
      b.brett = b.brett.filter((x) => x !== id);
      b.links = b.links.filter((x) => x !== id);
      b.rechts = b.rechts.filter((x) => x !== id);
      b.wahlLinks = b.wahlRechts = null;
      blitzNachfuellen();
      if (!b.brett.length) return beendeBlitz();
    } else {
      b.fehler++;
      b.falsch = { links: b.wahlLinks, rechts: b.wahlRechts };
      setTimeout(() => {
        if (dui.blitz !== b) return;
        b.falsch = null;
        b.wahlLinks = b.wahlRechts = null;
        app.render();
      }, 450);
    }
  }
  app.render();
}

function beendeBlitz() {
  clearInterval(blitzUhr);
  const b = dui.blitz;
  if (!b) return;
  const p = profil();
  const xp = b.punkte * XP_PAAR;
  p.xp += xp;
  const rekord = b.punkte > p.dojo.blitz;
  if (rekord) p.dojo.blitz = b.punkte;
  zaehleHeute(b.punkte);
  ligaPunkte(xp);
  app.speichern();
  dui.blitz = null;
  dui.ergebnis = { art: 'blitz', punkte: b.punkte, fehler: b.fehler, xp, rekord, richtig: b.punkte, falsch: b.fehler, zielErreicht: dui.zielErreicht, guertel: guertel(), aufgestiegen: false };
  app.ui.screen = 'dojoErgebnis';
  app.render();
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
  dojoFehler() {
    const ids = mischen(fehlerHeute()).slice(0, MAX_WIEDERHOLUNG);
    if (!ids.length) return;
    starteRunde('fehler', ids);
  },
  dojoBlitz() {
    if (blitzPool().length < 4) return;
    starteBlitz();
  },
  dojoBlitzWahl(d) {
    blitzWahl(d.seite, d.id);
  },
  async dojoBlitzAbbrechen() {
    if (!dui.blitz || app.ui.dialog) return;
    const ok = await app.frage({ titel: 'Blitz beenden?', text: 'Die bisher gefundenen Paare zählen.', ja: 'Beenden', nein: 'Weiterspielen', stimmung: 'panisch' });
    if (!ok || !dui.blitz) return;
    beendeBlitz();
  },
  dojoZiel(d) {
    const n = Number(d.ziel);
    if (!ZIELE.includes(n)) return;
    profil().dojo.ziel = n;
    app.speichern();
    app.render();
  },
  dojoKachel(d) {
    const a = aktuelleAufgabe();
    if (!a || a.ergebnis || !a.kacheln) return;
    const i = Number(d.i);
    const kachel = a.kacheln[i];
    if (!kachel || kachel.benutzt) return;
    kachel.benutzt = true;
    a.gebaut.push(i);
    const wort = a.gebaut.map((x) => a.kacheln[x].z).join('');
    if (Array.from(wort).length >= Array.from(a.karte.ja).length) {
      a.gewaehlt = wort;
      return werte(a, wort === a.karte.ja);
    }
    app.render();
  },
  dojoKachelZurueck() {
    const a = aktuelleAufgabe();
    if (!a || a.ergebnis || !a.gebaut?.length) return;
    a.kacheln[a.gebaut.pop()].benutzt = false;
    app.render();
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
    clearInterval(blitzUhr);
    dui.blitz = null;
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
  else if (heuteZahl() < profil().dojo.ziel) text = `Tagesziel: ${heuteZahl()} / ${profil().dojo.ziel}${empfohleneLektion() ? ` · weiter mit ${empfohleneLektion().titel}` : ''}`;
  else text = `Tagesziel geschafft · ${g.name}er Gürtel`;
  return `<button class="karte dojokarte" data-aktion="nav" data-ziel="dojo">
    ${guertelBild(g)}
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

function tageszielKarte() {
  const p = profil();
  const n = heuteZahl();
  const geschafft = n >= p.dojo.ziel;
  const streak = app.streak?.() ?? 0;
  return `<div class="karte tagesziel">
    <div class="oben">
      <span class="label">Tagesziel</span>
      <span class="stand">${geschafft ? `${app.ICON.haken} geschafft` : `${n} / ${p.dojo.ziel}`}${streak ? ` · ${app.ICON.flamme} ${streak} ${streak === 1 ? 'Tag' : 'Tage'}` : ''}</span>
    </div>
    <div class="balken"><span style="width:${Math.round(Math.min(1, n / p.dojo.ziel) * 100)}%"></span></div>
    <div class="unten-zeile">
      <small>${geschafft ? 'Deine Serie läuft weiter. Tagesquiz und Dojo zählen beide.' : `Noch ${p.dojo.ziel - n} ${p.dojo.ziel - n === 1 ? 'Karte' : 'Karten'}, dann läuft deine Serie weiter.`}</small>
      <div class="segmente klein" role="group" aria-label="Tagesziel wählen">${ZIELE.map((z) => `<button data-aktion="dojoZiel" data-ziel="${z}" aria-pressed="${z === p.dojo.ziel}">${z}</button>`).join('')}</div>
    </div>
  </div>`;
}

function dojoScreen() {
  const g = guertel();
  const fehler = fehlerHeute();
  const meldung = dui.meldung;
  dui.meldung = ''; // nur einmal zeigen
  const faellig = faelligeKarten().length;
  const frei = dojoFrei();
  const bisNaechster = g.naechster ? (g.n - g.ab) / (g.naechster.ab - g.ab) : 1;
  return `<section class="screen mit-tabbar dojo">
    ${kopf('Senpai Dojo', 'start', guertelChip(g))}
    ${meldung ? `<p class="meldung">${app.esc(meldung)}</p>` : ''}

    <div class="karte guertel-karte">
      ${guertelBild(g)}
      <div class="text">
        <span class="display">${g.n} ${g.n === 1 ? 'Karte sitzt' : 'Karten sitzen'}</span>
        <div class="balken"><span style="width:${Math.round(Math.min(1, bisNaechster) * 100)}%"></span></div>
        <small>${g.naechster ? `Noch ${g.naechster.ab - g.n} bis zum ${app.esc(g.naechster.name)}en Gürtel` : 'Schwarzer Gürtel. Du bist der Senpai.'}</small>
        ${frei ? `<span class="frei-zeile">${app.ICON.haken} ${app.esc(freiText())}</span>` : ''}
      </div>
    </div>

    ${tageszielKarte()}

    ${faellig
      ? `<button class="knopf knopf-rot" data-aktion="dojoWiederholen">${app.ICON.nochmal} Wiederholen · ${faellig} fällig</button>`
      : `<p class="kleingedruckt" style="margin:0;text-align:center">${Object.keys(profil().dojo.karten).length ? 'Heute ist nichts zum Wiederholen fällig. Lern eine neue Lektion!' : 'Fang mit der ersten Lektion an. Fällige Karten erscheinen hier zum Wiederholen.'}</p>`}
    <div class="modi">
      <button class="knopf" data-aktion="dojoBlitz" ${blitzPool().length < 4 ? 'disabled' : ''}>${app.ICON.blitz}<span><b>Paare finden</b><small>60 Sekunden${profil().dojo.blitz ? ` · Rekord ${profil().dojo.blitz}` : ''}</small></span></button>
      <button class="knopf" data-aktion="dojoFehler" ${fehler.length ? '' : 'disabled'}>${app.ICON.nochmal}<span><b>Fehler üben</b><small>${fehler.length ? `${fehler.length} von heute` : 'heute keine'}</small></span></button>
    </div>

    ${ligaKarte()}

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

function stufenLeiste(l) {
  const z = stufenZaehler(l);
  const gesamt = l.karten.filter((id) => !KARTEN[id].nurLernen).length;
  if (!z.some((n) => n)) return '';
  return `<span class="stufen-leiste" aria-hidden="true">${z.map((n, i) => (n ? `<span style="width:${(n / gesamt) * 100}%;background:${STUFEN[i].farbe}"></span>` : '')).join('')}</span>`;
}

function lektionZeile(l) {
  const s = lektionStand(l);
  const offen = lektionOffen(l);
  const empfohlen = empfohleneLektion() === l;
  const status = !offen ? 'gesperrt' : s.fertig ? 'fertig' : s.gelernt ? 'offen' : '';
  const statusInhalt = !offen ? app.ICON.schloss : s.fertig ? app.ICON.haken : app.esc(String(LEKTIONEN.indexOf(l) + 1));
  const vorschau = l.zeichen ? l.zeichen.slice(0, 5).map((z) => z[0]).join(' ') : `${l.woerter.length} Wörter`;
  return `<button class="lektion ${status}" data-aktion="dojoLektion" data-id="${l.id}" aria-label="${app.esc(l.titel)}${offen ? '' : ', gesperrt'}">
    <span class="status ${status}">${statusInhalt}</span>
    <span class="text">
      <b>${app.esc(l.titel)}</b>
      <small>${JP(vorschau)} · ${s.sitzt} / ${s.gesamt} ${s.gesamt === 1 ? 'sitzt' : 'sitzen'}</small>
      ${stufenLeiste(l)}
      ${empfohlen ? '<span class="probe empfohlen">Empfohlen</span>' : l.frei && !dojoFrei() ? '<span class="probe">Gratis</span>' : ''}
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
      ${app.maskottchen('lesend')}
      <span class="schrift">${app.esc(k.typ === 'kana' ? k.schrift : 'Vokabel')}${fach(k.id) >= 0 ? ` · <span class="stufe" style="--stufe:${STUFEN[fach(k.id)].farbe}">${app.esc(STUFEN[fach(k.id)].name)}</span>` : ''}</span>
      ${k.bild ? `<img class="vokabel-bild" src="${k.bild}" alt="">` : ''}
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
  bauen: { kana: 'Setze zusammen', vokabel: 'Setze das Wort zusammen' },
  bild: { kana: 'Was zeigt das Bild?', vokabel: 'Was zeigt das Bild?' },
};

function dojoAbfrageScreen() {
  const r = dui.runde;
  const a = aktuelleAufgabe();
  if (!r || !a) return dojoScreen();
  const k = a.karte;
  const vorne = a.art === 'lesen' || a.art === 'tippen';
  const titel = r.art === 'lektion' ? r.lektion.titel : r.art === 'fehler' ? 'Fehler üben' : 'Wiederholen';
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
        : a.art === 'bild'
          ? `<img class="vokabel-bild gross" src="${k.bild}" alt="">`
        : a.art === 'bauen'
          ? `<span class="text">${app.esc(k.de)}</span><span class="romaji-klein">${app.esc(k.romaji)}</span>`
        : vorne
          ? `<span class="zeichen ${k.typ === 'kana' ? '' : 'wort'}" lang="ja">${app.esc(vorderseite(k))}</span>`
          : `<span class="text">${app.esc(rueckseite(k))}</span>`}
    </div>

    ${a.art === 'tippen' ? tippForm(a) : a.art === 'bauen' ? kachelFeld(a) : antworten(a)}

    <div class="unten">${a.ergebnis ? ergebnisBanner(a) : ''}</div>
  </section>`;
}

function antworten(a) {
  const k = a.karte;
  const japanisch = a.art === 'schreiben' || a.art === 'bild' || (a.art === 'hoeren' && k.typ === 'kana');
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

function kachelFeld(a) {
  const laenge = Array.from(a.karte.ja).length;
  const gebaut = a.gebaut.map((i) => a.kacheln[i].z);
  const zustand = a.ergebnis ? (a.ergebnis.korrekt ? 'richtig' : 'falsch') : '';
  return `<div class="bauen">
    <div class="bau-feld ${zustand}" lang="ja" aria-live="polite">${Array.from({ length: laenge }, (_, i) => `<span class="platz ${gebaut[i] ? 'voll' : ''}">${app.esc(gebaut[i] ?? '')}</span>`).join('')}</div>
    <div class="kacheln">${a.kacheln.map((k, i) => `<button class="kachel" lang="ja" data-aktion="dojoKachel" data-i="${i}" ${k.benutzt || a.ergebnis ? 'disabled' : ''}>${app.esc(k.z)}</button>`).join('')}</div>
    ${a.ergebnis ? '' : `<button class="leise-knopf" data-aktion="dojoKachelZurueck" ${a.gebaut.length ? '' : 'disabled'}>Letzte Kachel zurück</button>`}
  </div>`;
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
      ${e.korrekt && e.fach !== e.fachVorher ? `<span class="stufen-wechsel">${e.fachVorher >= 0 ? `${app.esc(STUFEN[e.fachVorher].name)} → ` : ''}<b>${app.esc(STUFEN[e.fach].name)}</b></span>` : ''}
      ${!e.korrekt || a.art === 'tippen' ? `<p class="merk">${app.esc(k.typ === 'kana' ? k.merk : k.hinweis)}</p>` : ''}
    </div>
    <button class="knopf" id="dojo-weiter" data-aktion="dojoNaechste">Weiter</button>
  </div>`;
}

function dojoErgebnisScreen() {
  const e = dui.ergebnis;
  if (!e) return dojoScreen();
  if (e.art === 'blitz') {
    return `<section class="screen dojo">
      <div class="karte dojo-ergebnis">
        ${app.maskottchen(e.rekord && e.punkte > 0 ? 'feiernd' : e.punkte >= 10 ? 'daumenhoch' : 'verlegen')}
        <h2>${e.punkte} ${e.punkte === 1 ? 'Paar' : 'Paare'} in ${BLITZ_DAUER} Sekunden</h2>
        <p>${e.rekord && e.punkte > 0 ? 'Neuer Rekord!' : `${e.fehler} ${e.fehler === 1 ? 'Fehlgriff' : 'Fehlgriffe'}. Rekord: ${profil().dojo.blitz}`}</p>
        <span class="xp">+${e.xp} XP</span>
        ${e.zielErreicht ? `<p class="ziel-hinweis">${app.ICON.flamme} Tagesziel geschafft, deine Serie läuft weiter!</p>` : ''}
      </div>
      <div class="unten">
        <button class="knopf knopf-rot" data-aktion="dojoBlitz">${app.ICON.nochmal} Noch einmal</button>
        <button class="knopf" data-aktion="dojoZurueck">Zurück zum Dojo</button>
      </div>
    </section>`;
  }
  const gesamt = e.richtig + e.falsch;
  const quote = gesamt ? e.richtig / gesamt : 0;
  const stimmung = e.aufgestiegen ? 'konfetti' : quote >= 0.9 ? 'stolz' : quote >= 0.6 ? 'daumenhoch' : 'verlegen';
  const naechste = e.lektion ? naechsteLektion(e.lektion) : null;
  const senpai = e.aufgestiegen
    ? `Neuer Gürtel: ${e.guertel.name}!`
    : e.lektionNeu ? 'Lektion geschafft. Morgen fragt dich der Senpai noch einmal ab.' : quote >= 0.9 ? 'Sauber. Das sitzt.' : 'Fehler sind Teil des Trainings. Die Karten kommen wieder.';
  return `<section class="screen dojo">
    <div class="karte dojo-ergebnis">
      ${e.aufgestiegen ? guertelBild(e.guertel) : app.maskottchen(stimmung)}
      <h2>${e.richtig} von ${gesamt} richtig</h2>
      <p>${app.esc(senpai)}</p>
      <span class="xp">+${e.xp} XP</span>
      ${e.aufgestiegen ? guertelChip(e.guertel) : ''}
      ${e.zielErreicht ? `<p class="ziel-hinweis">${app.ICON.flamme} Tagesziel geschafft, deine Serie läuft weiter!</p>` : ''}
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

function dojoBlitzScreen() {
  const b = dui.blitz;
  if (!b) return dojoScreen();
  const knopf = (seite, id) => {
    const k = KARTEN[id];
    const text = seite === 'links' ? vorderseite(k) : rueckseite(k);
    const jp = seite === 'links';
    const gewaehlt = (seite === 'links' ? b.wahlLinks : b.wahlRechts) === id;
    const falsch = b.falsch && b.falsch[seite] === id;
    return `<button class="paar ${gewaehlt ? 'gewaehlt' : ''} ${falsch ? 'falsch' : ''} ${jp ? 'jp' : ''}" ${jp ? 'lang="ja"' : ''} data-aktion="dojoBlitzWahl" data-seite="${seite}" data-id="${app.esc(id)}" ${b.falsch ? 'disabled' : ''}>${app.esc(text)}</button>`;
  };
  return `<section class="screen dojo">
    <div class="kopfzeile">
      <button class="icon-knopf" data-aktion="dojoBlitzAbbrechen" aria-label="Blitz beenden">${app.ICON.kreuz}</button>
      <div class="fortschritt">
        <span class="label">Paare finden · <span id="blitz-zeit">${BLITZ_DAUER} s</span></span>
        <div class="balken"><span id="blitz-balken" style="width:100%"></span></div>
      </div>
      <span class="tag">${app.ICON.haken} ${b.punkte}</span>
    </div>
    <p class="kleingedruckt" style="margin:0;text-align:center">Tippe links ein Zeichen oder Wort und rechts die passende Lesung oder Bedeutung.</p>
    <div class="blitz-brett">
      <div class="spalte">${b.links.map((id) => knopf('links', id)).join('')}</div>
      <div class="spalte">${b.rechts.map((id) => knopf('rechts', id)).join('')}</div>
    </div>
  </section>`;
}

export const DOJO_SCREENS = {
  dojo: dojoScreen,
  dojoBlitz: dojoBlitzScreen,
  dojoLernen: dojoLernenScreen,
  dojoAbfrage: dojoAbfrageScreen,
  dojoErgebnis: dojoErgebnisScreen,
  dojoKauf: dojoKaufScreen,
};
