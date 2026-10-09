// Senpai Quiz. Reines JavaScript ohne Build-Schritt.

import { belohnungsvideo, werbungOffen } from './werbung.js';
import * as online from './online.js';
import { speicherBereit, ladeProfil, speichereProfil } from './speicher.js';
import { kategorieIcon, abzeichenEmblem, rangEmblem, stationsKnoten, bossKnoten } from './grafik.js';
import { tagesquizBild, bossBild, kannBildTeilen } from './teilen-bild.js';
import { spielernameErlaubt, SPIELERNAME_VERBOTEN } from './spielername.js';
import { ladeDojo, dojoEinrichten, dojoAktionen, dojoKachelStart, DOJO_SCREENS } from './dojo.js';

const app = document.getElementById('app');

// ---------- Konstanten ----------

const FRAGEZEIT = 15;
const BLITZZEIT = 60;
const RUNDENLAENGE = 10;
const VERSION = '0.1.0';
const MELDE_GRUENDE = [
  ['antwort_falsch', 'Antwort ist falsch'],
  ['unklar', 'Frage ist unklar'],
  ['tippfehler', 'Tippfehler'],
];
const MELDE_TEXT_MAX = 200;

// Kleines Lexikon für die Startseite: japanische Wörter, die in der App vorkommen
const BEGRIFFE = [
  ['Senpai', 'Jemand mit mehr Erfahrung, zu dem man aufschaut, etwa in Schule oder Verein. Im Quiz dein Rang ab 2.000 XP.'],
  ['Kōhai', 'Das Gegenstück zum Senpai: der Jüngere, der noch lernt. Dein Rang ab 500 XP.'],
  ['Sensei', 'Lehrer oder Meister. Dein Rang ab 5.000 XP.'],
  ['Otaku', 'Jemand, der ganz in Anime, Manga oder Games aufgeht. Die schwerste Stufe im Quiz.'],
  ['Sugoi', '„Wow!“ oder „Stark!“. Das ruft das Maskottchen bei richtigen Antworten.'],
  ['Onigiri', 'Reisbällchen, oft in ein Nori-Blatt gewickelt. Unser Maskottchen ist eins.'],
  ['Anime', 'Japanische Zeichentrickserien und -filme.'],
  ['Manga', 'Japanische Comics, oft die Vorlage für einen Anime. Wer sie zeichnet, ist Mangaka.'],
  ['Shōnen', 'Serien für ein junges männliches Publikum: Kämpfe, Freundschaft, Abenteuer. Etwa One Piece oder Naruto.'],
  ['Shōjo', 'Serien für ein junges weibliches Publikum: Gefühle, Beziehungen, Alltag. Etwa Sailor Moon.'],
  ['Isekai', '„Andere Welt“: Die Hauptfigur landet in einer fremden Welt, oft mit Magie oder Spielregeln.'],
];

const STUFEN_WAHL = [
  { id: 'easy', label: 'Einsteiger', stufen: [1] },
  { id: 'fan', label: 'Fan', stufen: [1, 2] },
  { id: 'otaku', label: 'Otaku', stufen: [2, 3] },
];

// Hintergrund- und Textfarbe je Kategorie (IDs wie in data/fragen.json)
const FARBEN = {
  onepiece: ['#D7261E', '#FFFFFF'],
  dragonball: ['#FF8A3D', '#141414'],
  naruto: ['#F5B400', '#141414'],
  shonen: ['#1F5FD1', '#FFFFFF'],
  neu: ['#1C8C8C', '#FFFFFF'],
  isekai: ['#6B3FA0', '#FFFFFF'],
  klassiker: ['#141414', '#FFFFFF'],
  shojo: ['#FFB3CF', '#141414'],
  filme: ['#177A41', '#FFFFFF'],
  kultur: ['#8B5A2B', '#FFFFFF'],
};

const UNTERTITEL = {
  onepiece: 'Strohhutbande und Grand Line',
  dragonball: 'Son-Goku bis Daima',
  naruto: 'Konoha, Shippuden, Boruto',
  shonen: 'Conan, Pokémon, AoT und mehr',
  neu: 'Demon Slayer, JJK, Spy x Family\u00a0…',
  isekai: 'Andere Welten, Magie, Dungeons',
  klassiker: 'Death Note, Tokyo Ghoul, TV-Kult',
  shojo: 'Herzklopfen und Drama',
  filme: 'Ghibli, Shinkai, Kino-Hits',
  kultur: 'Mangaka, Begriffe, Japan',
};

// Frühere Kategorie-IDs, die in alten Duell-Runden noch vorkommen können
const ALTE_KATEGORIEN = { manga: 'Manga & Mangaka' };

function kategorieName(id) {
  return KATEGORIEN[id] ?? ALTE_KATEGORIEN[id] ?? id;
}

const RAENGE = [
  { name: 'Neuling', xp: 0 },
  { name: 'Kōhai', xp: 500 },
  { name: 'Senpai', xp: 2000 },
  { name: 'Sensei', xp: 5000 },
  { name: 'Legende', xp: 10000 },
];

const ICON = {
  regler: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/></svg>',
  play: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
  haken: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
  flamme: '<svg width="18" height="18" viewBox="0 0 24 24" fill="#D7261E" stroke="#141414" stroke-width="2" stroke-linejoin="round"><path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 2 1.3 3 2.5 3-1-3-.5-6 0-8z"/></svg>',
  herz: (voll) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="${voll ? '#D7261E' : 'none'}" stroke="#141414" stroke-width="2.2" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>`,
  herzRosa: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#FFB3CF" stroke="#141414" stroke-width="2.2" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  blitz: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD23F" stroke="#141414" stroke-width="2.2" stroke-linejoin="round"><path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z"/></svg>',
  haus: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/></svg>',
  diagramm: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>',
  video: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/></svg>',
  schwerter: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 17.5L21 6V3h-3L6.5 14.5M11 19l-6-6M8 16l-4 4M5 21l-2-2"/></svg>',
  lupe: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  teilen: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
  medaille: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="15" r="5"/><path d="M8 3l3 7M16 3l-3 7"/></svg>',
  schloss: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  zurueck: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  weiter: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  kreuz: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  uhr: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg>',
  nochmal: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5"/></svg>',
  minus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  // Tab-Leiste: Fahne (Heldenreise), Torii (Dojo), Kopf (Profil)
  fahne: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V3M6 4h12l-3 4.5 3 4.5H6"/></svg>',
  torii: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5.5c3-1.4 15-1.4 18 0M6 5v16M18 5v16M5 10.5h14M12 6v4.5"/></svg>',
  kopf: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4.2"/><path d="M4.5 20.5c.6-4.2 3.8-6.5 7.5-6.5s6.9 2.3 7.5 6.5"/></svg>',
};

const ABZEICHEN = [
  { id: 'erste', name: 'Erste Runde', text: 'Eine Runde zu Ende gespielt.', pruefe: () => true },
  { id: 'perfekt', name: 'Perfekt!', text: 'Alle Fragen einer Runde richtig beantwortet.', pruefe: (r, perfekt) => perfekt },
  { id: 'kette', name: 'Kettenreaktion', text: '5 richtige Antworten am Stück.', pruefe: (r) => r.besteCombo >= 5 },
  { id: 'blitzmerker', name: 'Blitzmerker', text: '5 richtige Antworten in unter 5 Sekunden in einer Runde.', pruefe: (r) => r.schnelle >= 5 },
  { id: 'otaku', name: 'Echter Otaku', text: 'Mindestens 8 richtige Antworten auf der Stufe Otaku.', pruefe: (r) => r.modus === 'klassisch' && r.opts.stufe === 'otaku' && r.richtig >= 8 },
  { id: 'ueberleben', name: 'Überlebenskünstler', text: '15 richtige Antworten im Survival-Modus.', pruefe: (r) => r.modus === 'survival' && r.richtig >= 15 },
  { id: 'schnellfeuer', name: 'Schnellfeuer', text: '10 richtige Antworten im Blitz-Modus.', pruefe: (r) => r.modus === 'blitz' && r.richtig >= 10 },
  { id: 'treue', name: 'Treue Seele', text: '7 Tage in Folge das Tagesquiz gespielt.', pruefe: () => profil.streak.tage >= 7 },
  { id: 'allrounder', name: 'Allrounder', text: 'In jeder Kategorie eine Runde gespielt.', pruefe: () => Object.keys(KATEGORIEN).every((k) => profil.gespielteKategorien.includes(k)) },
  { id: 'teilgeist', name: 'Teilgeist', text: 'Zum ersten Mal ein Ergebnis geteilt.', pruefe: () => false }, // wird beim Teilen vergeben
  { id: 'aufbruch', name: 'Aufbruch', text: 'Kapitel 1 der Heldenreise geschafft.', pruefe: () => reiseStand(1).kapitelFertig >= 1 },
  { id: 'schwellenhueter', name: 'Schwellenhüter', text: 'Den ersten Boss der Heldenreise besiegt.', pruefe: () => stationSterne('k01-boss', 1) > 0 },
  { id: 'heimkehr', name: 'Heimkehr', text: 'Die Heldenreise zu Ende gespielt.', pruefe: () => reiseStand(1).fertig },
  { id: 'sternenfaenger', name: 'Sternenfänger', text: 'Alle Sterne der Heldenreise gesammelt.', pruefe: () => reiseStand(1).sterne >= reiseStand(1).sterneMax },
  { id: 'pfadfinder', name: 'Pfadfinder', text: 'Alle fünf Geheimpfade der Heldenreise geschafft.', pruefe: () => GEHEIM.length > 0 && GEHEIM.every((g) => stationSterne(g.id, 1) > 0) },
  { id: 'zweitereise', name: 'Zweite Reise', text: 'Die Zweite Reise bis zum Ende gespielt.', pruefe: () => reiseStand(2).fertig },
  // Senpai Dojo: prüft und vergibt js/dojo.js nach jeder Dojo-Runde
  { id: 'hiragana', name: 'Hiragana-Held', text: 'Alle Hiragana-Lektionen im Dojo abgeschlossen.', pruefe: () => false },
  { id: 'katakana', name: 'Katakana-Kenner', text: 'Alle Katakana-Lektionen im Dojo abgeschlossen.', pruefe: () => false },
  { id: 'wortschatz', name: 'Wortschatz', text: '100 Vokabeln sitzen im Dojo.', pruefe: () => false },
  { id: 'guertel', name: 'Gürtelträger', text: 'Die erste Gürtelprüfung im Dojo bestanden.', pruefe: () => false },
  { id: 'shiritori', name: 'Kettenmeister', text: 'Eine Wortkette mit 10 Gliedern ohne Fehler.', pruefe: () => false },
  { id: 'fleiss', name: 'Fleißig', text: 'An 7 Tagen im Dojo gelernt.', pruefe: () => false },
];

// Abzeichen außerhalb einer Quizrunde vergeben (Dojo). Rückgabe: das Abzeichen, wenn es neu war, sonst null
function abzeichenVergeben(id) {
  const ab = ABZEICHEN.find((x) => x.id === id);
  if (!ab || profil.abzeichen.includes(id)) return null;
  profil.abzeichen.push(id);
  speichern();
  return ab;
}

// ---------- Daten & Zustand ----------

let FRAGEN = [];
let KATEGORIEN = {};
let SCHWIERIGKEIT = {};
let REISE = { akte: [], kapitel: [] }; // data/reise.json
let STATIONEN = []; // alle Stationen der Heldenreise in Spielreihenfolge, siehe baueStationen()
let GEHEIM = []; // Geheimpfade, eine Bonus-Station je Akt (nicht Teil des Hauptwegs)
const GEHEIM_ANTEIL = 0.8; // Anteil der Akt-Sterne, ab dem der Geheimpfad offen ist
const ZWEITE_REISE_LEBEN = 2; // Herzen pro Station in der Zweiten Reise

const PROFIL_START = {
  xp: 0,
  spiele: 0,
  beantwortet: 0,
  richtig: 0,
  kategorien: {},
  gesehen: [],
  abzeichen: [],
  highscore: { survival: 0, blitz: 0 },
  streak: { tage: 0, letzter: null },
  tagesquiz: null,
  gespielteKategorien: [],
  erstStart: null, // Datum des ersten Starts auf diesem Gerät (für die anonyme Zählung)
  // Heldenreise: beste Sterne je Station, z. B. { 'k01-s1': 3 }; Zweite Reise mit Suffix @2.
  // durchgang = zuletzt gewählte Reise (1 oder 2)
  reise: { sterne: {}, durchgang: 1 },
  // Senpai Dojo (Japanisch lernen): Freischaltung, Leitner-Fächer je Karte, fertige Lektionen; Startwerte in js/dojo.js
  dojo: null,
};

let profil = structuredClone(PROFIL_START); // wird in init() aus dem Speicher geladen

const ui = {
  screen: 'start',
  wahl: { stufe: 'fan', kategorie: 'mix' },
  station: null, // auf der Heldenreise-Karte angetippte Station (ID) für die Stationskarte
  durchgang: 1, // Heldenreise: 1 = Erste Reise, 2 = Zweite Reise (nach dem Ende freigeschaltet)
  runde: null,
  ergebnis: null,
  melden: null, // offener „Frage melden“-Dialog: { grund, text, fehler, sendet }
  begriffe: false, // Lexikon im Profil-Tab geöffnet
  profilTab: 'statistik', // Profil-Tab: 'statistik' oder 'abzeichen'
  dialog: null, // offene Rückfrage von frage(): { titel, text, ja, nein, gefaehrlich, stimmung, loese }
  hinweis: null, // Meldung nach dem Teilen: { text, fehler }
  online: {
    profil: undefined, // undefined = noch unbekannt, null = kein Account
    duelle: [],
    laedt: false,
    fehler: '',
    meldung: '',
    nameEingabe: '',
    suchText: '',
    codeEingabe: '',
    treffer: null,
    einladung: null,
    einladungProfil: null,
    duellId: null,
    linkZeigen: false,
  },
};

let timerId = null;

// ---------- Hilfsfunktionen ----------

function speichern() {
  speichereProfil(profil);
}

// Anonyme Zählung (Tabelle ereignisse): nur Art, Modus, Version und bei 'start' die Zahl
// der Tage seit dem ersten Start auf diesem Gerät. Keine Nutzer- oder Geräte-ID.
function ereignis(art, modus = null) {
  let tagNr = null;
  if (art === 'start') {
    if (!profil.erstStart) {
      profil.erstStart = heute();
      speichern();
    }
    tagNr = Math.min(30, Math.max(0, Math.round((new Date(heute()) - new Date(profil.erstStart)) / 86400000)));
  }
  online.ereignisMelden({ art, modus, tagNr, version: VERSION }).catch(() => {});
}

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function zahl(n) {
  return Number(n).toLocaleString('de-DE');
}

function mischen(liste, zufall = Math.random) {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

// Reproduzierbarer Zufall, damit das Tagesquiz für alle gleich ist.
function seededZufall(text) {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function datumText(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const heute = () => datumText(new Date());
const gestern = () => datumText(new Date(Date.now() - 86400000));
const vorgestern = () => datumText(new Date(Date.now() - 2 * 86400000));

// Datum 2026-10-09 → 09.10.2026
function datumDeutsch(iso) {
  const [j, m, t] = String(iso).split('-');
  return `${t}.${m}.${j}`;
}

// Adresse der App, z. B. für Einladungslinks und geteilte Ergebnisse
function appLink() {
  // In der Capacitor-App wäre location.origin „capacitor://localhost“; scripts/prepare-www.mjs setzt dort die Web-Adresse.
  if (window.SENPAI_APP_URL) return window.SENPAI_APP_URL;
  return `${location.origin}${location.pathname}`;
}

// Text mit Link über das Teilen-Menü des Geräts, sonst in die Zwischenablage.
// Wenn das Gerät Dateien teilen kann (iPhone), geht ein Bild mit.
// Ergebnis: 'geteilt', 'kopiert', 'abgebrochen' oder 'fehler'.
async function teilen(text, url, datei = null) {
  if (navigator.share) {
    try {
      const daten = { title: 'Senpai Quiz', text, url };
      if (kannBildTeilen(datei)) daten.files = [datei];
      await navigator.share(daten);
      return 'geteilt';
    } catch (fehler) {
      if (fehler.name === 'AbortError') return 'abgebrochen';
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return 'kopiert';
  } catch {
    return 'fehler';
  }
}

// Text zum Teilen des heutigen Tagesquiz-Ergebnisses
function tagesquizText() {
  const t = profil.tagesquiz;
  const kaestchen = (t.verlauf || []).map((ok) => (ok ? '🟩' : '🟥')).join('');
  const streak = aktuelleStreak();
  const stand = `${t.richtig}/${t.gesamt}${streak > 1 ? ` · 🔥 ${streak} Tage` : ''}`;
  return `Senpai Quiz · Tagesquiz ${datumDeutsch(t.datum)}\n${[kaestchen, stand].filter(Boolean).join('  ')}`;
}

// Serie genau einen Tag verpasst: per Video rettbar
function streakRettbar() {
  const { tage, letzter } = profil.streak;
  return tage >= 2 && letzter === vorgestern() && profil.tagesquiz?.datum !== heute();
}

// Serie um heute verlängern: Tagesquiz gespielt oder Tagesziel im Dojo erreicht
function serieHeute() {
  const s = profil.streak;
  if (s.letzter === heute()) return;
  s.tage = s.letzter === gestern() ? s.tage + 1 : 1;
  s.letzter = heute();
}

function aktuelleStreak() {
  const { tage, letzter } = profil.streak;
  return letzter === heute() || letzter === gestern() ? tage : 0;
}

function rang(xp) {
  const i = RAENGE.findLastIndex((r) => xp >= r.xp);
  const jetzt = RAENGE[i];
  const naechster = RAENGE[i + 1];
  return {
    name: jetzt.name,
    naechster: naechster?.name,
    von: jetzt.xp,
    bis: naechster?.xp,
    anteil: naechster ? (xp - jetzt.xp) / (naechster.xp - jetzt.xp) : 1,
  };
}

function prozent(anteil) {
  return `${Math.round(Math.max(0, Math.min(1, anteil)) * 1000) / 10}%`;
}

function comboFaktor(combo) {
  return combo >= 5 ? 3 : combo >= 3 ? 2 : 1;
}

// Startwert des Schätzreglers: zufällig, aber nie in der Nähe der Lösung.
function startwertSchaetzung(f) {
  const weitWeg = [];
  for (let wert = f.min; wert <= f.max; wert++) {
    if (Math.abs(wert - f.answer) > 5) weitWeg.push(wert);
  }
  return weitWeg.length ? weitWeg[Math.floor(Math.random() * weitWeg.length)] : f.min;
}

function antwortText(f) {
  if (f.type === 'estimate') return String(f.answer);
  if (f.type === 'order') return f.answers.join(' → ');
  return f.answers[f.correct];
}

// Was der Spieler bei der aktuellen Frage angetippt hat, als Text (für „Frage melden“)
function gewaehlteAntwort(a) {
  const f = a.frage;
  if (f.type === 'estimate') return String(a.schaetz);
  if (f.type === 'order') return a.reihenfolge.length ? a.reihenfolge.map((i) => a.optionen[i].text).join(' → ') : null;
  return a.gewaehlt === null ? null : a.optionen[a.gewaehlt]?.text ?? null;
}

// ---------- Fragen auswählen ----------

function poolFuer(kategorie, stufe) {
  const stufen = STUFEN_WAHL.find((s) => s.id === stufe).stufen;
  const inKategorie = FRAGEN.filter((f) => kategorie === 'mix' || f.category === kategorie);
  let passend = inKategorie.filter((f) => stufen.includes(f.difficulty));
  if (passend.length < RUNDENLAENGE) passend = inKategorie;
  const gesehen = new Set(profil.gesehen);
  const neu = mischen(passend.filter((f) => !gesehen.has(f.id)));
  const bekannt = mischen(passend.filter((f) => gesehen.has(f.id)));
  return [...neu, ...bekannt];
}

function tagesFragen() {
  const zufall = seededZufall(`senpai-${heute()}`);
  const schnell = FRAGEN.filter((f) => ['multiple_choice', 'emoji', 'true_false'].includes(f.type));
  const gemischt = mischen(schnell, zufall);
  const nachStufe = (s, n) => gemischt.filter((f) => f.difficulty === s).slice(0, n);
  return [...nachStufe(1, 2), ...nachStufe(2, 2), ...nachStufe(3, 1)];
}

// ---------- Heldenreise ----------

const ALLE_TYPEN = ['multiple_choice', 'true_false', 'emoji', 'who_am_i', 'estimate', 'order'];
const ALLE_JOKER = ['fifty', 'zeit', 'skip'];

// Aus data/reise.json eine flache Liste aller Stationen bauen. Jede Station kennt
// ihre Regeln (Kategorien, Stufen, Fragetypen, Joker, Fragenzahl, Zeit) komplett,
// die Werte erben vom Kapitel. Bosse sind Stationen mit boss: true.
function baueStationen() {
  STATIONEN = [];
  for (const k of REISE.kapitel) {
    const id = `k${String(k.nr).padStart(2, '0')}`;
    const basis = (s, boss) => ({
      kapitel: k,
      boss,
      titel: boss ? s.name : s.titel,
      bild: s.bild,
      auftritt: s.auftritt, // Boss: sein Satz auf der Stationskarte
      senpai: s.senpai, // Station: Satz des Senpai auf der Stationskarte
      nachBoss: s.nachBoss, // Boss: Satz des Senpai nach dem Sieg
      kategorien: s.kategorien ?? k.kategorien ?? [],
      schwierigkeit: s.schwierigkeit ?? k.schwierigkeit ?? [1, 2, 3],
      typen: s.typen ?? k.typen ?? ALLE_TYPEN,
      joker: boss ? [] : (s.joker ?? k.joker ?? ALLE_JOKER),
      pflicht: s.pflicht ?? [],
      fragen: s.fragen ?? (boss ? 7 : 5),
      zeit: s.zeit ?? FRAGEZEIT,
    });
    k.stationen.forEach((s, i) => STATIONEN.push({ id: `${id}-s${i + 1}`, nr: `${k.nr}.${i + 1}`, ...basis(s, false) }));
    STATIONEN.push({ id: `${id}-boss`, nr: `${k.nr}.Boss`, ...basis(k.boss, true) });
  }
  // Geheimpfade: eine Kategorie pur auf Stufe 3, mit allen Jokern
  GEHEIM = REISE.akte.filter((a) => a.geheim).map((a) => ({
    id: `a${a.nr}-geheim`,
    nr: `Akt ${a.nr}`,
    geheim: true,
    boss: false,
    akt: a,
    titel: a.geheim.titel,
    senpai: a.geheim.senpai,
    kategorien: [a.geheim.kategorie],
    schwierigkeit: [3],
    typen: ALLE_TYPEN,
    joker: ALLE_JOKER,
    pflicht: [],
    fragen: a.geheim.fragen ?? 5,
    zeit: FRAGEZEIT,
  }));
}

function station(id) {
  return STATIONEN.find((s) => s.id === id) ?? GEHEIM.find((s) => s.id === id);
}

// Schlüssel im Profil: Erste Reise ohne, Zweite Reise mit Suffix
function sterneSchluessel(id, durchgang) {
  return durchgang === 2 ? `${id}@2` : id;
}

function stationSterne(id, durchgang = ui.durchgang) {
  return profil.reise.sterne[sterneSchluessel(id, durchgang)] ?? 0;
}

// Herzen und damit höchste Sternzahl je Station in dieser Reise
function maxSterne(durchgang = ui.durchgang) {
  return durchgang === 2 ? ZWEITE_REISE_LEBEN : 3;
}

// Wo der Spieler steht: die nächste offene Station, Summen und ob alles geschafft ist
function reiseStand(durchgang = ui.durchgang) {
  const index = STATIONEN.findIndex((s) => stationSterne(s.id, durchgang) === 0);
  const naechste = index >= 0 ? STATIONEN[index] : null;
  const sterne = STATIONEN.reduce((summe, s) => summe + stationSterne(s.id, durchgang), 0);
  const letzteBossKapitel = STATIONEN.filter((s) => s.boss && stationSterne(s.id, durchgang) > 0).length;
  return {
    durchgang,
    naechste,
    geschafft: index >= 0 ? index : STATIONEN.length,
    sterne,
    sterneMax: STATIONEN.length * maxSterne(durchgang),
    geheimSterne: GEHEIM.reduce((summe, g) => summe + stationSterne(g.id, durchgang), 0),
    kapitelFertig: letzteBossKapitel,
    fertig: STATIONEN.length > 0 && !naechste,
  };
}

// Sterne eines Akts (Hauptweg) und die Schwelle für seinen Geheimpfad
function aktSterne(akt, durchgang = ui.durchgang) {
  const stationen = STATIONEN.filter((s) => s.kapitel.akt === akt.nr);
  const sterne = stationen.reduce((summe, s) => summe + stationSterne(s.id, durchgang), 0);
  return { sterne, max: stationen.length * maxSterne(durchgang), schwelle: Math.ceil(stationen.length * maxSterne(durchgang) * GEHEIM_ANTEIL) };
}

// Die Zweite Reise steht offen, sobald die erste zu Ende gespielt ist
function zweiteReiseOffen() {
  return reiseStand(1).fertig;
}

// Titel am Spielernamen: „Reisender“ ab Akt III (nach Boss 4), „Heimkehrer“ nach dem Ende
function reiseTitel() {
  const stand = reiseStand(1);
  if (stand.fertig) return 'Heimkehrer';
  if (stand.kapitelFertig >= 4) return 'Reisender';
  return null;
}

// Text zum Teilen eines Boss-Siegs bzw. des Endes der Reise
function bossText(s) {
  const stand = reiseStand();
  const kopf = stand.fertig && s === STATIONEN[STATIONEN.length - 1]
    ? `Heldenreise geschafft! Boss „${s.titel}“ besiegt 🏆`
    : `Boss „${s.titel}“ besiegt · Kapitel ${s.kapitel.nr}: ${s.kapitel.titel}`;
  return `Senpai Quiz · Heldenreise\n${kopf}\n⭐ ${stand.sterne} / ${stand.sterneMax} Sterne`;
}

// 'offen' (bestanden), 'aktuell' (als Nächstes dran bzw. Geheimpfad freigeschaltet) oder 'gesperrt'
function stationZustand(s, durchgang = ui.durchgang) {
  if (stationSterne(s.id, durchgang) > 0) return 'offen';
  if (s.geheim) {
    const a = aktSterne(s.akt, durchgang);
    return a.sterne >= a.schwelle ? 'aktuell' : 'gesperrt';
  }
  return reiseStand(durchgang).naechste?.id === s.id ? 'aktuell' : 'gesperrt';
}

// Stufen einer Station in der gewählten Reise: die Zweite Reise spielt alles auf Fan und Otaku
function stationStufen(s, durchgang) {
  if (durchgang === 2 && !s.geheim) return s.schwierigkeit.includes(3) && s.schwierigkeit.length === 1 ? [3] : [2, 3];
  return s.schwierigkeit;
}

// Fragen für einen Versuch: Regeln der Station anwenden, Ungesehene bevorzugen,
// Pflicht-Typen (Bosse) zuerst einbauen. Rest des Pools dient dem Joker „Weiter“.
function stationFragen(s, durchgang = 1) {
  const gesehen = new Set(profil.gesehen);
  const stufen = stationStufen(s, durchgang);
  let pool = FRAGEN.filter((f) => (!s.kategorien.length || s.kategorien.includes(f.category))
    && stufen.includes(f.difficulty) && s.typen.includes(f.type));
  if (pool.length < s.fragen) pool = FRAGEN.filter((f) => stufen.includes(f.difficulty));
  const sortiert = [...mischen(pool.filter((f) => !gesehen.has(f.id))), ...mischen(pool.filter((f) => gesehen.has(f.id)))];
  const gewaehlt = [];
  for (const typ of s.pflicht) {
    const f = sortiert.find((x) => x.type === typ && !gewaehlt.includes(x));
    if (f) gewaehlt.push(f);
  }
  for (const f of sortiert) {
    if (gewaehlt.length >= s.fragen) break;
    if (!gewaehlt.includes(f)) gewaehlt.push(f);
  }
  const reserve = sortiert.filter((f) => !gewaehlt.includes(f));
  return { fragen: mischen(gewaehlt), reserve };
}

// ---------- Rundenablauf ----------

function neueRunde(modus, opts = {}) {
  let fragen = [];
  let reserve = [];
  let fragezeit = FRAGEZEIT;
  let maxLeben = 3;
  if (modus === 'reise') {
    const s = station(opts.stationId);
    const durchgang = s.geheim ? ui.durchgang : (opts.durchgang ?? ui.durchgang);
    ({ fragen, reserve } = stationFragen(s, durchgang));
    fragezeit = s.zeit;
    maxLeben = maxSterne(durchgang);
    opts = { ...opts, station: s, durchgang };
  } else if (modus === 'klassisch') {
    const pool = poolFuer(opts.kategorie, opts.stufe);
    fragen = pool.slice(0, RUNDENLAENGE).sort((a, b) => a.difficulty - b.difficulty);
    reserve = pool.slice(RUNDENLAENGE);
  } else if (modus === 'tages') {
    fragen = tagesFragen();
  } else if (modus === 'survival') {
    fragen = mischen(FRAGEN).sort((a, b) => a.difficulty - b.difficulty);
  } else if (modus === 'blitz') {
    fragen = mischen(FRAGEN.filter((f) => ['multiple_choice', 'emoji', 'true_false'].includes(f.type)));
  } else if (modus === 'duell') {
    fragen = opts.fragenIds.map((id) => FRAGEN.find((f) => f.id === id)).filter(Boolean);
  }
  ui.hinweis = null;
  ui.runde = {
    modus,
    opts,
    fragen,
    reserve,
    fragezeit,
    index: 0,
    punkte: 0,
    combo: 0,
    besteCombo: 0,
    richtig: 0,
    beantwortet: 0,
    schnelle: 0,
    leben: maxLeben,
    maxLeben,
    zeiten: [],
    verlauf: [],
    joker: { fifty: false, zeit: false, skip: false },
    nachgefuellt: { fifty: false, zeit: false, skip: false },
    zweiteChance: false,
    blitzEnde: modus === 'blitz' ? Date.now() + BLITZZEIT * 1000 : null,
  };
  starteFrage();
  ui.screen = 'frage';
  render();
}

function starteFrage() {
  const r = ui.runde;
  const f = r.fragen[r.index];
  let optionen = [];
  if (f.type === 'true_false') {
    optionen = ['Wahr', 'Falsch'].map((text) => ({ text, richtig: text === f.answers[f.correct] }));
  } else if (f.type === 'order') {
    optionen = mischen(f.answers.map((text, pos) => ({ text, pos })));
  } else if (f.type !== 'estimate') {
    optionen = mischen(f.answers.map((text, i) => ({ text, richtig: i === f.correct })));
  }
  r.aktuell = {
    frage: f,
    optionen,
    entfernt: [],
    reihenfolge: [],
    schaetz: f.type === 'estimate' ? startwertSchaetzung(f) : 0,
    gewaehlt: null,
    ergebnis: null,
    hinweise: 1,
    start: Date.now(),
    dauer: r.fragezeit,
    ende: r.blitzEnde ? null : Date.now() + r.fragezeit * 1000,
  };
  starteTimer();
}

// Survival und Heldenreise spielen mit Herzen: Jeder Fehler kostet eins.
function mitLeben(r) {
  return r.modus === 'survival' || r.modus === 'reise';
}

function starteTimer() {
  stoppeTimer();
  timerId = setInterval(tick, 100);
}

function stoppeTimer() {
  clearInterval(timerId);
  timerId = null;
}

function zeigeZeit(anteil, restMs) {
  const balken = document.getElementById('zeitbalken');
  const label = document.getElementById('zeitlabel');
  const timer = document.getElementById('timer');
  if (!balken) return;
  balken.style.width = prozent(anteil);
  label.textContent = `${Math.ceil(restMs / 1000)} s`;
  timer.classList.toggle('knapp', restMs <= 5000);
  const figur = document.getElementById('figur-bild');
  const a = ui.runde?.aktuell;
  if (figur && a) {
    const ziel = `assets/stimmung/${frageStimmung(a, restMs)}.webp`;
    if (!figur.getAttribute('src').endsWith(ziel)) figur.setAttribute('src', ziel);
  }
}

function tick() {
  const r = ui.runde;
  if (!r || ui.screen !== 'frage') return stoppeTimer();
  const jetzt = Date.now();
  if (r.modus === 'blitz') {
    const rest = Math.max(0, r.blitzEnde - jetzt);
    zeigeZeit(rest / (BLITZZEIT * 1000), rest);
    if (rest <= 0) beendeRunde();
    return;
  }
  const a = r.aktuell;
  if (a.ergebnis) return;
  const rest = Math.max(0, a.ende - jetzt);
  zeigeZeit(rest / (a.dauer * 1000), rest);
  if (rest <= 0) return auswerten(false, { zeitAus: true });
  if (a.frage.type === 'who_am_i') {
    const sichtbar = Math.min(a.frage.hints.length, 1 + Math.floor((jetzt - a.start) / 5000));
    if (sichtbar > a.hinweise) {
      a.hinweise = sichtbar;
      render();
    }
  }
}

function auswerten(korrekt, info = {}) {
  const r = ui.runde;
  const a = r.aktuell;
  if (!r || a.ergebnis) return;
  const f = a.frage;
  const jetzt = Date.now();
  const zeit = (jetzt - a.start) / 1000;
  r.beantwortet++;
  r.zeiten.push(zeit);

  let punkte = 0;
  let faktor = 1;
  if (korrekt) {
    r.combo++;
    r.besteCombo = Math.max(r.besteCombo, r.combo);
    r.richtig++;
    faktor = comboFaktor(r.combo);
    const restSek = a.ende ? Math.max(0, (a.ende - jetzt) / 1000) : 0;
    const bonus = r.modus === 'blitz' ? 0 : Math.min(75, Math.round(restSek * 5));
    const hinweisBonus = f.type === 'who_am_i' ? (f.hints.length - a.hinweise) * 25 : 0;
    punkte = Math.round((100 + bonus + hinweisBonus) * faktor * (info.halb ? 0.5 : 1));
    if (zeit < 5) r.schnelle++;
  } else {
    r.combo = 0;
    if (mitLeben(r)) r.leben--;
  }
  r.punkte += punkte;
  r.verlauf.push(korrekt);
  a.restMs = a.ende ? Math.max(0, a.ende - jetzt) : 0;
  a.ergebnis = { korrekt, punkte, faktor, ...info };

  const k = (profil.kategorien[f.category] ||= { richtig: 0, beantwortet: 0 });
  k.beantwortet++;
  profil.beantwortet++;
  if (korrekt) {
    k.richtig++;
    profil.richtig++;
  }
  if (!profil.gesehen.includes(f.id)) profil.gesehen.push(f.id);
  speichern();

  if (r.modus !== 'blitz') stoppeTimer();
  render();

  if (r.modus === 'blitz') {
    setTimeout(() => {
      if (ui.runde === r && r.aktuell === a) weiter();
    }, korrekt ? 450 : 1100);
  }
}

function weiter() {
  const r = ui.runde;
  if (!r) return;
  ui.melden = null;
  if (mitLeben(r) && r.leben <= 0) return beendeRunde();
  if (r.modus === 'blitz' && Date.now() >= r.blitzEnde) return beendeRunde();
  r.index++;
  if (r.index >= r.fragen.length) return beendeRunde();
  starteFrage();
  render();
}

function beendeRunde() {
  stoppeTimer();
  ui.melden = null;
  const r = ui.runde;
  if (!r) return;
  if (r.modus === 'duell') return duellRundeFertig(r);
  const feste = r.modus === 'klassisch' || r.modus === 'tages' || r.modus === 'reise';
  // Heldenreise: Nach dem dritten Fehler endet die Station vorzeitig, gezählt wird, was gespielt wurde
  const gesamt = feste && r.modus !== 'reise' ? r.fragen.length : r.beantwortet;
  const perfekt = feste && r.richtig === r.fragen.length;
  const xpVorher = profil.xp;
  let xp = Math.round(r.punkte / 10) + (perfekt ? 50 : 0);

  // Heldenreise: bestanden, solange ein Herz übrig ist; Sterne = übrige Herzen
  let reise = null;
  if (r.modus === 'reise') {
    const s = r.opts.station;
    const durchgang = r.opts.durchgang;
    const bestanden = r.leben > 0;
    const sterne = bestanden ? r.leben : 0;
    const vorher = stationSterne(s.id, durchgang);
    const erstmals = bestanden && vorher === 0;
    const titelVorher = reiseTitel();
    if (erstmals) xp += s.boss ? 150 : s.geheim ? 100 : 50;
    if (sterne > vorher) profil.reise.sterne[sterneSchluessel(s.id, durchgang)] = sterne;
    const titelNachher = reiseTitel();
    reise = { station: s, durchgang, bestanden, sterne, vorher, erstmals, stand: null, neuerTitel: titelNachher !== titelVorher ? titelNachher : null };
  }
  profil.xp += xp;
  profil.spiele++;
  ereignis('runde', r.modus);

  let neuerRekord = false;
  if ((r.modus === 'survival' || r.modus === 'blitz') && r.richtig > profil.highscore[r.modus]) {
    profil.highscore[r.modus] = r.richtig;
    neuerRekord = r.richtig > 0;
  }
  if (r.modus === 'tages') {
    serieHeute();
    profil.tagesquiz = { datum: heute(), richtig: r.richtig, gesamt, verlauf: [...r.verlauf], punkte: r.punkte };
  }
  if (r.modus === 'klassisch' && r.opts.kategorie !== 'mix' && !profil.gespielteKategorien.includes(r.opts.kategorie)) {
    profil.gespielteKategorien.push(r.opts.kategorie);
  }

  const neueAbzeichen = ABZEICHEN.filter((ab) => !profil.abzeichen.includes(ab.id) && ab.pruefe(r, perfekt));
  profil.abzeichen.push(...neueAbzeichen.map((ab) => ab.id));
  speichern();
  if (reise) reise.stand = reiseStand(reise.durchgang);

  const schnitt = r.zeiten.length ? r.zeiten.reduce((s, z) => s + z, 0) / r.zeiten.length : 0;
  ui.ergebnis = {
    modus: r.modus,
    opts: r.opts,
    reise,
    richtig: r.richtig,
    gesamt,
    punkte: r.punkte,
    besteCombo: r.besteCombo,
    schnitt,
    xp,
    xpVorher,
    perfekt,
    neuerRekord,
    rangVorher: rang(xpVorher).name,
    neueAbzeichen,
  };
  ui.runde = null;
  ui.screen = 'ergebnis';
  render();
  zeigeXpBalken();
}

function zeigeXpBalken() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const neu = document.getElementById('xp-neu');
    if (neu) neu.style.width = neu.dataset.ziel;
  }));
}

// Uhr der laufenden Frage anhalten, solange ein Werbevideo läuft
async function mitPausierterUhr(aufgabe) {
  const r = ui.runde;
  const a = r?.aktuell;
  const laeuft = !!(a && !a.ergebnis && a.ende && timerId);
  const pauseBeginn = Date.now();
  if (laeuft) stoppeTimer();
  try {
    return await aufgabe();
  } finally {
    if (laeuft && ui.runde === r && r.aktuell === a && !a.ergebnis) {
      const pause = Date.now() - pauseBeginn;
      a.ende += pause;
      a.start += pause;
      starteTimer();
    }
  }
}

// Rückfrage als eigener Dialog statt der Browser-Rückfrage. Löst mit true (Ja)
// oder false (Nein, Escape, Tipp auf den Hintergrund) auf. Ein laufender
// Fragen-Timer läuft währenddessen weiter, das ist gewollt.
function frage({ titel, text = '', ja = 'Ja', nein = 'Abbrechen', gefaehrlich = false, stimmung = 'nachdenklich' }) {
  if (ui.dialog) return Promise.resolve(false);
  return new Promise((loese) => {
    ui.dialog = { titel, text, ja, nein, gefaehrlich, stimmung, loese };
    render();
  });
}

function schliesseDialog(antwort) {
  const d = ui.dialog;
  if (!d) return;
  ui.dialog = null;
  render();
  d.loese(antwort);
}

// ---------- Aktionen ----------

const aktionen = {
  nav(d) {
    ui.screen = d.ziel;
    if (d.ziel === 'statistik' || d.ziel === 'abzeichen') {
      ui.profilTab = d.ziel;
      ui.screen = 'profil';
    }
    ui.begriffe = false;
    ui.station = null;
    ui.hinweis = null;
    ui.online.fehler = '';
    ui.online.meldung = '';
    ui.online.linkZeigen = false;
    render();
    if (d.ziel === 'duelle' && ui.online.profil) ladeDuelle(true);
  },
  profilTab(d) {
    ui.profilTab = d.tab;
    render();
  },
  tagesquiz() {
    if (profil.tagesquiz?.datum === heute()) return;
    neueRunde('tages');
  },
  modus(d) {
    neueRunde(d.modus);
  },
  // Heldenreise: Station auf der Karte antippen → Stationskarte
  station(d) {
    const s = station(d.id);
    if (!s || ui.dialog) return;
    ui.station = s.id;
    render();
    document.getElementById('station-dialog')?.focus();
  },
  stationSchliessen() {
    if (!ui.station) return;
    const id = ui.station;
    ui.station = null;
    render();
    document.querySelector(`[data-aktion="station"][data-id="${id}"]`)?.focus();
  },
  stationHintergrund(d, e) {
    if (e.target.classList.contains('dialog-hintergrund')) aktionen.stationSchliessen();
  },
  stationLos() {
    const s = station(ui.station);
    if (!s || stationZustand(s) === 'gesperrt') return;
    ui.station = null;
    neueRunde('reise', { stationId: s.id });
  },
  // Erste oder Zweite Reise auf der Karte wählen
  durchgang(d) {
    const n = Number(d.durchgang);
    if (n === 2 && !zweiteReiseOffen()) return;
    ui.durchgang = n;
    ui.station = null;
    profil.reise.durchgang = n;
    speichern();
    render();
    const ziel = reiseStand().naechste;
    document.getElementById(`st-${ziel?.id}`)?.scrollIntoView({ block: 'center' });
  },
  // Vom Ergebnis zur nächsten Station der Reise
  reiseWeiter() {
    const naechste = reiseStand().naechste;
    if (!naechste) return aktionen.nav({ ziel: 'reise' });
    neueRunde('reise', { stationId: naechste.id });
  },
  stufe(d) {
    ui.wahl.stufe = d.stufe;
    render();
  },
  kategorie(d) {
    ui.wahl.kategorie = d.kategorie;
    render();
  },
  los() {
    neueRunde('klassisch', { ...ui.wahl });
  },
  melden() {
    const a = ui.runde?.aktuell;
    if (!a?.ergebnis || a.gemeldet || ui.melden) return;
    ui.melden = { grund: null, text: '', fehler: '', sendet: false };
    render();
    document.getElementById('melde-dialog')?.focus();
  },
  meldeGrund(d) {
    if (!ui.melden || ui.melden.sendet) return;
    ui.melden.grund = d.grund;
    ui.melden.fehler = '';
    render();
  },
  meldeAbbrechen() {
    if (ui.melden?.sendet) return;
    ui.melden = null;
    render();
  },
  async meldeSenden() {
    const m = ui.melden;
    const r = ui.runde;
    const a = r?.aktuell;
    if (!m || m.sendet || !a?.ergebnis) return;
    if (!m.grund) {
      m.fehler = 'Bitte wähle aus, was nicht stimmt.';
      return render();
    }
    m.sendet = true;
    m.fehler = '';
    render();
    try {
      await online.frageMelden({
        frageId: a.frage.id,
        grund: m.grund,
        text: m.text.trim().slice(0, MELDE_TEXT_MAX),
        antwort: gewaehlteAntwort(a),
        alsRichtig: a.ergebnis.korrekt,
        modus: r.modus,
        version: VERSION,
      });
      if (ui.melden !== m) return;
      a.gemeldet = true;
      ui.melden = null;
    } catch (fehler) {
      if (ui.melden !== m) return;
      m.sendet = false;
      m.fehler = 'Konnte nicht gesendet werden';
      console.warn('Meldung fehlgeschlagen:', fehler.message);
    }
    render();
  },
  dialogJa() {
    schliesseDialog(true);
  },
  dialogNein() {
    schliesseDialog(false);
  },
  dialogHintergrund(d, e) {
    // nur ein Tipp neben die Karte schließt den Dialog
    if (e.target.classList.contains('dialog-hintergrund')) schliesseDialog(false);
  },
  begriffe() {
    if (ui.begriffe || ui.dialog) return;
    ui.begriffe = true;
    render();
    document.getElementById('begriffe-dialog')?.focus();
  },
  begriffeSchliessen() {
    if (!ui.begriffe) return;
    ui.begriffe = false;
    render();
    document.querySelector('[data-aktion="begriffe"]')?.focus();
  },
  begriffeHintergrund(d, e) {
    if (e.target.classList.contains('dialog-hintergrund')) aktionen.begriffeSchliessen();
  },
  async abbrechen() {
    const r = ui.runde;
    if (!r || ui.dialog) return;
    if (r.modus === 'duell') {
      const ok = await frage({ titel: 'Runde abbrechen?', text: 'Fragen ohne Antwort zählen als falsch.', ja: 'Abbrechen', nein: 'Weiterspielen', stimmung: 'panisch' });
      if (!ok || ui.runde !== r) return;
      return duellRundeFertig(r);
    }
    const ok = await frage({ titel: 'Runde beenden?', text: 'Der Fortschritt dieser Runde geht verloren.', ja: 'Beenden', nein: 'Weiterspielen', stimmung: 'panisch' });
    if (!ok || ui.runde !== r) return;
    stoppeTimer();
    ui.melden = null;
    ui.runde = null;
    ui.screen = 'start';
    render();
  },
  antwort(d) {
    const a = ui.runde?.aktuell;
    if (!a || a.ergebnis) return;
    const option = a.optionen[Number(d.i)];
    if (a.entfernt.includes(option.text)) return;
    a.gewaehlt = Number(d.i);
    auswerten(option.richtig);
  },
  ordnen(d) {
    const a = ui.runde?.aktuell;
    if (!a || a.ergebnis) return;
    const i = Number(d.i);
    const stelle = a.reihenfolge.indexOf(i);
    if (stelle >= 0) a.reihenfolge.splice(stelle);
    else a.reihenfolge.push(i);
    if (a.reihenfolge.length === a.optionen.length) {
      auswerten(a.reihenfolge.every((idx, n) => a.optionen[idx].pos === n));
    } else {
      render();
    }
  },
  schaetzSchritt(d) {
    const a = ui.runde?.aktuell;
    if (!a || a.ergebnis) return;
    const f = a.frage;
    a.schaetz = Math.max(f.min, Math.min(f.max, a.schaetz + Number(d.schritt)));
    render();
  },
  schaetzen() {
    const a = ui.runde?.aktuell;
    if (!a || a.ergebnis) return;
    const abstand = Math.abs(a.schaetz - a.frage.answer);
    if (abstand === 0) auswerten(true, { volltreffer: true });
    else if (abstand <= (a.frage.tolerance ?? 2)) auswerten(true, { halb: true, knapp: true });
    else auswerten(false);
  },
  joker(d) {
    const r = ui.runde;
    const a = r?.aktuell;
    if (!a || a.ergebnis || r.joker[d.joker]) return;
    if (d.joker === 'fifty') {
      const falsche = mischen(a.optionen.filter((o) => !o.richtig)).slice(0, 2);
      a.entfernt = falsche.map((o) => o.text);
    } else if (d.joker === 'zeit') {
      a.ende += 10000;
      a.dauer += 10;
    } else if (d.joker === 'skip') {
      if (r.reserve.length) r.fragen[r.index] = r.reserve.shift();
      else r.fragen.splice(r.index, 1);
      r.joker.skip = true;
      if (r.index >= r.fragen.length) return beendeRunde();
      starteFrage();
      return render();
    }
    r.joker[d.joker] = true;
    render();
  },
  weiter() {
    weiter();
  },
  nochmal() {
    const e = ui.ergebnis;
    if (e.modus === 'tages') return aktionen.nav({ ziel: 'start' });
    neueRunde(e.modus, e.opts);
  },
  async jokerVideo(d) {
    const r = ui.runde;
    if (!r || !r.joker[d.joker] || r.nachgefuellt[d.joker]) return;
    const namen = { fifty: '50:50', zeit: '+10 s', skip: 'Weiter' };
    const ok = await mitPausierterUhr(() => belohnungsvideo(`Joker „${namen[d.joker]}“ zurück`));
    if (!ok || ui.runde !== r) return;
    r.joker[d.joker] = false;
    r.nachgefuellt[d.joker] = true;
    render();
  },
  async zweiteChance() {
    const r = ui.runde;
    if (!r || r.zweiteChance || r.leben > 0 || !zweiteChanceMoeglich(r)) return;
    const ok = await belohnungsvideo('1 Leben, du spielst weiter');
    if (!ok || ui.runde !== r) return;
    r.leben = 1;
    r.zweiteChance = true;
    weiter();
  },
  async xpVerdoppeln() {
    const e = ui.ergebnis;
    if (!e || e.verdoppelt) return;
    const ok = await belohnungsvideo(`+${zahl(e.xp)} XP extra`);
    if (!ok || ui.ergebnis !== e) return;
    profil.xp += e.xp;
    e.xp *= 2;
    e.verdoppelt = true;
    speichern();
    render();
    zeigeXpBalken();
  },
  async streakRetten() {
    if (!streakRettbar()) return;
    const ok = await belohnungsvideo(`Deine Serie von ${profil.streak.tage} Tagen bleibt erhalten`);
    if (!ok || !streakRettbar()) return;
    profil.streak.letzter = gestern();
    speichern();
    render();
  },
  async ergebnisTeilen() {
    const t = profil.tagesquiz;
    if (!t) return;
    const datei = await tagesquizBild({
      datum: datumDeutsch(t.datum),
      verlauf: t.verlauf || [],
      richtig: t.richtig,
      gesamt: t.gesamt,
      streak: aktuelleStreak(),
      link: appLink().replace(/^https?:\/\//, ''),
    });
    nachTeilen(await teilen(tagesquizText(), appLink(), datei));
  },
  // Heldenreise: Boss-Sieg teilen (Ergebnis-Bildschirm)
  async bossTeilen() {
    const s = ui.ergebnis?.reise?.station;
    if (!s?.boss) return;
    const stand = reiseStand();
    const datei = await bossBild({
      boss: s.titel,
      bild: s.bild,
      kapitelNr: s.kapitel.nr,
      kapitelTitel: s.kapitel.titel,
      sterne: stand.sterne,
      sterneMax: stand.sterneMax,
      heimkehr: stand.fertig && s === STATIONEN[STATIONEN.length - 1],
      link: appLink().replace(/^https?:\/\//, ''),
    });
    nachTeilen(await teilen(bossText(s), appLink(), datei));
  },
  async zuruecksetzen() {
    const ok = await frage({ titel: 'Fortschritt zurücksetzen?', text: 'Alle Punkte, Statistiken und Abzeichen werden gelöscht.', ja: 'Löschen', gefaehrlich: true });
    if (!ok) return;
    profil = structuredClone(PROFIL_START);
    speichern();
    render();
  },
};

// Aktionen des Senpai Dojo (js/dojo.js), alle mit Vorsilbe „dojo“
Object.assign(aktionen, dojoAktionen);

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-aktion]');
  if (!el || el.disabled) return;
  // Formulare lösen ihre Aktion nur über submit aus. Sonst würde schon ein Tipp
  // ins Eingabefeld die Aktion starten, neu rendern und auf dem iPhone die
  // Tastatur verhindern.
  if (el.tagName === 'FORM') return;
  aktionen[el.dataset.aktion]?.(el.dataset, e);
});

app.addEventListener('submit', (e) => {
  e.preventDefault();
  const formular = e.target.closest('form[data-aktion]');
  if (formular) aktionen[formular.dataset.aktion]?.(formular.dataset);
});

const EINGABEFELDER = { 'name-eingabe': 'nameEingabe', 'such-eingabe': 'suchText', 'code-eingabe': 'codeEingabe' };

app.addEventListener('input', (e) => {
  if (EINGABEFELDER[e.target.id]) {
    ui.online[EINGABEFELDER[e.target.id]] = e.target.value;
    return;
  }
  if (e.target.id === 'melde-text') {
    if (!ui.melden) return;
    ui.melden.text = e.target.value.slice(0, MELDE_TEXT_MAX);
    const zaehler = document.getElementById('melde-zaehler');
    if (zaehler) zaehler.textContent = `${ui.melden.text.length} / ${MELDE_TEXT_MAX}`;
    return;
  }
  if (e.target.id !== 'schaetzregler') return;
  const a = ui.runde?.aktuell;
  if (!a) return;
  a.schaetz = Number(e.target.value);
  document.getElementById('schaetzwert').textContent = a.schaetz;
});

document.addEventListener('keydown', (e) => {
  if (werbungOffen()) return;
  if (ui.dialog) {
    if (e.key === 'Escape') {
      e.preventDefault();
      aktionen.dialogNein();
    }
    return;
  }
  if (ui.begriffe) {
    if (e.key === 'Escape') aktionen.begriffeSchliessen();
    return;
  }
  if (ui.station) {
    if (e.key === 'Escape') aktionen.stationSchliessen();
    return;
  }
  if (ui.screen !== 'frage' || !ui.runde) return;
  if (ui.melden) {
    if (e.key === 'Escape') aktionen.meldeAbbrechen();
    return;
  }
  const a = ui.runde.aktuell;
  if (a.ergebnis && (e.key === 'Enter' || e.key === ' ')) {
    if (ui.runde.modus !== 'blitz') {
      e.preventDefault();
      weiter();
    }
    return;
  }
  const n = Number(e.key);
  if (!a.ergebnis && n >= 1 && n <= a.optionen.length) {
    if (a.frage.type === 'order') aktionen.ordnen({ i: n - 1 });
    else aktionen.antwort({ i: n - 1 });
  }
});

// ---------- Bausteine ----------

function tabbar(aktiv) {
  // [Tab-ID, Beschriftung, Icon, Zielbildschirm]
  const tabs = [
    ['start', 'Start', ICON.haus, 'start'],
    ['reise', 'Reise', ICON.fahne, 'reise'],
    ['dojo', 'Dojo', ICON.torii, 'dojo'],
    ['duelle', 'Duelle', ICON.schwerter, 'duelle'],
    ['profil', 'Profil', ICON.kopf, 'profil'],
  ];
  return `<nav class="tabbar" aria-label="Hauptmenü">${tabs.map(([id, name, icon, ziel]) => `
    <button class="tab" data-aktion="nav" data-ziel="${ziel}" ${id === aktiv ? 'aria-current="page"' : ''}>${icon}${name}</button>`).join('')}
  </nav>`;
}

// Diese fünf wechseln mitten in einer Frage (Timer, richtig, falsch) und dürfen nicht flackern
const STIMMUNGEN_FRAGE = ['entschlossen', 'jubelnd', 'traurig', 'panisch', 'nachdenklich'];
const STIMMUNGEN = ['entschlossen', 'jubelnd', 'traurig', 'panisch', 'nachdenklich', 'stolz', 'erledigt', 'schlafend', 'mentor', 'kaempferisch', 'siegreich', 'winkend', 'daumenhoch', 'lesend', 'ueberrascht', 'verlegen', 'herausfordernd', 'feiernd', 'konfetti', 'cool'];

function maskottchen(stimmung = 'entschlossen', id = '') {
  return `<img class="maskottchen" ${id ? `id="${id}"` : ''} src="assets/stimmung/${stimmung}.webp" alt="">`;
}

// Stimmung des Maskottchens während einer Frage
function frageStimmung(a, restMs) {
  if (a.ergebnis) return a.ergebnis.korrekt ? (restMs >= 10000 ? 'daumenhoch' : 'jubelnd') : 'traurig';
  if (restMs <= 5000) return 'panisch';
  if (['who_am_i', 'estimate', 'order'].includes(a.frage.type)) return 'nachdenklich';
  return 'entschlossen';
}

const STREAK_MEILENSTEINE = [3, 7, 14, 30, 50, 100];

function ergebnisStimmung(e, aufgestiegen) {
  if (e.reise) {
    if (!e.reise.bestanden) return 'erledigt';
    if (e.reise.station.boss && e.reise.station === STATIONEN[STATIONEN.length - 1]) return 'konfetti';
    if (e.reise.station.boss) return 'siegreich';
    if (aufgestiegen) return 'konfetti';
    return e.reise.sterne === maxSterne() ? 'stolz' : 'jubelnd';
  }
  if (aufgestiegen) return 'konfetti';
  const rekord = e.neuerRekord && e.richtig >= 10;
  if (e.modus === 'survival') return rekord ? 'feiernd' : 'erledigt';
  if (e.modus === 'blitz') return rekord ? 'feiernd' : e.richtig >= 5 ? 'daumenhoch' : 'erledigt';
  if (e.modus === 'tages' && STREAK_MEILENSTEINE.includes(aktuelleStreak())) return 'feiernd';
  if (e.perfekt) return e.opts?.stufe === 'otaku' ? 'cool' : 'stolz';
  if (e.neueAbzeichen?.length) return 'ueberrascht';
  const quote = e.gesamt ? e.richtig / e.gesamt : 0;
  if (quote >= 0.7) return 'jubelnd';
  if (quote >= 0.4) return 'verlegen';
  return 'traurig';
}

// ---------- Bildschirme ----------

function startScreen() {
  const rg = rang(profil.xp);
  const erledigt = profil.tagesquiz?.datum === heute();
  const streak = aktuelleStreak();
  return `<section class="screen mit-tabbar start">
    <div class="held karte">
      <div class="speedlines"></div>
      <div class="logo"><span class="senpai">SENPAI</span><span class="quiz">QUIZ</span></div>
      <span class="fragen-zahl">${zahl(FRAGEN.length)} verschiedene Fragen</span>
      ${maskottchen(erledigt ? 'daumenhoch' : 'entschlossen')}
      <button class="sprechblase" data-aktion="nav" data-ziel="profil" aria-label="Zum Profil">${erledigt ? 'Gut gemacht!' : 'Bereit, Senpai?'}<small>${esc(rg.name)}${reiseTitel() ? ` · ${esc(reiseTitel())}` : ''} · ${zahl(profil.xp)} XP</small></button>
    </div>

    <div class="tageskarte karte">
      <div class="text">
        <span class="label">Tagesquiz</span>
        <span class="display">${erledigt ? `Heute: ${profil.tagesquiz.richtig} / ${profil.tagesquiz.gesamt} richtig` : '5 Fragen, für alle gleich'}</span>
        ${streakRettbar()
          ? `<span class="streak">${ICON.flamme} Deine Serie von ${profil.streak.tage} Tagen ist gerissen!</span>
             <button class="knopf knopf-video knopf-klein" data-aktion="streakRetten" aria-label="Video ansehen und Serie retten">${ICON.video} Serie retten</button>`
          : `<span class="streak">${ICON.flamme} ${streak === 1 ? '1 Tag' : `${streak} Tage`} in Folge${erledigt ? ' · morgen geht’s weiter' : ''}</span>`}
        ${erledigt ? `<button class="knopf knopf-klein" data-aktion="ergebnisTeilen">${ICON.teilen} Teilen</button>` : ''}
      </div>
      ${erledigt
        ? `<img class="tages-schlaf" src="assets/stimmung/schlafend.webp" alt="Tagesquiz erledigt">`
        : `<button class="rund-knopf" data-aktion="tagesquiz" aria-label="Tagesquiz starten">${ICON.play}</button>`}
    </div>
    ${hinweisBlock()}

    <div class="fortschritt-zeile">
      ${reiseKachelStart()}
      ${dojoKachelStart()}
    </div>

    <button class="knopf knopf-rot" data-aktion="nav" data-ziel="kategorie">${ICON.play} Klassisch spielen</button>

    <div class="modi">
      <button class="knopf" data-aktion="modus" data-modus="survival">${ICON.herzRosa}<span><b>Survival</b><small>3 Leben${profil.highscore.survival ? ` · Rekord ${profil.highscore.survival}` : ''}</small></span></button>
      <button class="knopf" data-aktion="modus" data-modus="blitz">${ICON.blitz}<span><b>Blitz</b><small>60 Sekunden${profil.highscore.blitz ? ` · Rekord ${profil.highscore.blitz}` : ''}</small></span></button>
    </div>

    ${tabbar('start')}
  </section>`;
}

function begriffeDialog() {
  if (!ui.begriffe) return '';
  return `<div class="dialog-hintergrund" data-aktion="begriffeHintergrund">
    <div class="karte dialog dialog-begriffe" id="begriffe-dialog" role="dialog" aria-modal="true" aria-labelledby="begriffe-titel" tabindex="-1">
      <div class="dialog-kopf">
        ${maskottchen('lesend')}
        <h2 id="begriffe-titel">Kleines Anime-Lexikon</h2>
      </div>
      <dl class="begriffe">${BEGRIFFE.map(([wort, text]) => `<div><dt>${esc(wort)}</dt><dd>${esc(text)}</dd></div>`).join('')}</dl>
      <button class="knopf knopf-rot" data-aktion="begriffeSchliessen">Alles klar</button>
    </div>
  </div>`;
}

function kategorieScreen() {
  const { stufe, kategorie } = ui.wahl;
  const katName = kategorie === 'mix' ? 'Gemischt' : KATEGORIEN[kategorie];
  const stufeName = STUFEN_WAHL.find((s) => s.id === stufe).label;
  const kachel = (id, name, unter, bg, fg, breit = false) => `
    <button class="knopf kat ${breit ? 'breit' : ''}" style="background:${bg};color:${fg}" data-aktion="kategorie" data-kategorie="${id}" aria-pressed="${kategorie === id}">
      ${kategorieIcon(id, breit ? 36 : 30)}
      ${breit ? `<span class="kat-text"><b>${esc(name)}</b><small>${esc(unter)}</small></span>` : `<b>${esc(name)}</b><small>${esc(unter)}</small>`}
      ${kategorie === id ? `<span class="haken">${ICON.haken}</span>` : ''}
    </button>`;
  return `<section class="screen">
    <div class="kopfzeile">
      <button class="icon-knopf" data-aktion="nav" data-ziel="start" aria-label="Zurück zum Start">${ICON.zurueck}</button>
      <h1>Kategorie wählen</h1>
    </div>

    <div style="display:flex;flex-direction:column;gap:8px">
      <span class="label">Schwierigkeit</span>
      <div class="segmente" role="group" aria-label="Schwierigkeit">
        ${STUFEN_WAHL.map((s) => `<button data-aktion="stufe" data-stufe="${s.id}" aria-pressed="${s.id === stufe}">${s.label}</button>`).join('')}
      </div>
    </div>

    ${kachel('mix', 'Gemischt', 'Von allem etwas', '#FFD23F', '#141414', true)}

    <div class="kat-gitter">
      ${Object.entries(KATEGORIEN).map(([id, name]) => kachel(id, name, UNTERTITEL[id], ...FARBEN[id])).join('')}
    </div>

    <div class="fusszeile">
      <span class="hinweis">${esc(katName)} · ${stufeName} · ${RUNDENLAENGE} Fragen · ${FRAGEZEIT} s pro Frage</span>
      <button class="knopf knopf-rot" data-aktion="los">Los geht’s!</button>
    </div>
  </section>`;
}

function herzen(r) {
  const max = r.maxLeben ?? 3;
  return `<div class="leben" aria-label="${r.leben} von ${max} Herzen übrig">${Array.from({ length: max }, (_, i) => ICON.herz(i < r.leben)).join('')}</div>`;
}

function frageKopf(r) {
  let fortschritt;
  if (r.modus === 'survival') {
    fortschritt = `<b>Frage ${r.index + 1}</b>${herzen(r)}`;
  } else if (r.modus === 'reise') {
    const s = r.opts.station;
    const name = s.boss || s.geheim ? esc(s.titel) : `Station ${s.nr}`;
    fortschritt = `<b>${name} · Frage ${r.index + 1} von ${r.fragen.length}</b>${herzen(r)}`;
  } else if (r.modus === 'blitz') {
    fortschritt = `<b>Blitz · ${r.richtig} richtig</b>`;
  } else {
    const dots = r.fragen.map((_, i) => {
      const klasse = i < r.verlauf.length ? (r.verlauf[i] ? 'richtig' : 'falsch') : i === r.index ? 'jetzt' : '';
      return `<span class="${klasse}"></span>`;
    }).join('');
    const titel = r.modus === 'tages' ? 'Tagesquiz' : r.modus === 'duell' ? 'Duell · Frage' : 'Frage';
    fortschritt = `<b>${titel} ${r.index + 1} von ${r.fragen.length}</b><div class="punkte-dots">${dots}</div>`;
  }
  return `<div class="kopfzeile">
    <button class="icon-knopf" data-aktion="abbrechen" aria-label="Runde beenden">${ICON.kreuz}</button>
    <div class="fortschritt">${fortschritt}</div>
    <div class="punktestand"><small>Punkte</small><b>${zahl(r.punkte)}</b></div>
  </div>`;
}

function frageText(f, a) {
  if (f.type === 'who_am_i') {
    const sichtbar = a.ergebnis ? f.hints.length : a.hinweise;
    return `<p>${esc(f.question)}</p><ol class="hinweise">${f.hints.map((h, i) => (i < sichtbar
      ? `<li>${esc(h)}</li>`
      : `<li class="verdeckt">Hinweis ${i + 1} kommt gleich …</li>`)).join('')}</ol>`;
  }
  if (f.type === 'emoji') {
    const teile = f.question.match(/^(.*?\?)\s*(.+)$/);
    if (teile) return `<p>${esc(teile[1])}<span class="emoji">${esc(teile[2])}</span></p>`;
  }
  return `<p>${esc(f.question)}</p>`;
}

function antwortenBlock(a) {
  const f = a.frage;
  const fertig = !!a.ergebnis;

  if (f.type === 'estimate') {
    if (fertig) {
      return `<div class="karte loesung"><span class="label">Auflösung</span>
        <span class="display" style="font-size:22px">Richtig: ${f.answer}</span>
        <span style="font-weight:700">Dein Tipp: ${a.schaetz}</span></div>`;
    }
    return `<div class="karte schaetzen">
      <span class="wert" id="schaetzwert">${a.schaetz}</span>
      <div class="regler">
        <button class="icon-knopf" data-aktion="schaetzSchritt" data-schritt="-1" aria-label="Eins weniger">${ICON.minus}</button>
        <input id="schaetzregler" type="range" min="${f.min}" max="${f.max}" step="1" value="${a.schaetz}" aria-label="Jahr wählen">
        <button class="icon-knopf" data-aktion="schaetzSchritt" data-schritt="1" aria-label="Eins mehr">${ICON.plus}</button>
      </div>
      <div class="grenzen"><span>${f.min}</span><span>${f.max}</span></div>
      <button class="knopf knopf-rot" data-aktion="schaetzen">Tipp abgeben</button>
    </div>`;
  }

  if (f.type === 'order') {
    if (fertig) {
      const jahre = f.years || [];
      return `<div class="karte loesung"><span class="label">Richtige Reihenfolge</span>
        <ol>${f.answers.map((t, i) => `<li>${esc(t)}${jahre[i] ? ` (${jahre[i]})` : ''}</li>`).join('')}</ol></div>`;
    }
    return `<p style="margin:0;font-size:13px;font-weight:700">Tippe die Titel der Reihe nach an. Nochmal tippen nimmt die Auswahl zurück.</p>
      <div class="antworten">${a.optionen.map((o, i) => {
        const platz = a.reihenfolge.indexOf(i);
        return `<button class="knopf antwort ${platz >= 0 ? 'gewaehlt' : ''}" data-aktion="ordnen" data-i="${i}">
          <span class="buchstabe">${platz >= 0 ? platz + 1 : '·'}</span><span class="text">${esc(o.text)}</span></button>`;
      }).join('')}</div>`;
  }

  const klassen = (o, i) => {
    if (fertig) {
      if (o.richtig) return 'richtig';
      if (i === a.gewaehlt) return 'falsch';
      return 'blass';
    }
    return a.entfernt.includes(o.text) ? 'weg' : '';
  };

  if (f.type === 'true_false') {
    return `<div class="wahrfalsch">${a.optionen.map((o, i) => `
      <button class="knopf antwort ${klassen(o, i)}" data-aktion="antwort" data-i="${i}" ${fertig ? 'disabled' : ''}>
        <span class="text">${esc(o.text)}</span></button>`).join('')}</div>`;
  }

  return `<div class="antworten">${a.optionen.map((o, i) => {
    const weg = !fertig && a.entfernt.includes(o.text);
    return `<button class="knopf antwort ${klassen(o, i)}" data-aktion="antwort" data-i="${i}" ${fertig || weg ? 'disabled' : ''}>
      <span class="buchstabe">${'ABCD'[i]}</span><span class="text">${esc(o.text)}</span></button>`;
  }).join('')}</div>`;
}

function unterBlock(r) {
  const a = r.aktuell;
  const f = a.frage;
  if (!a.ergebnis) {
    if (r.modus !== 'klassisch' && r.modus !== 'survival' && r.modus !== 'reise') return '';
    const fiftyMoeglich = ['multiple_choice', 'emoji', 'who_am_i'].includes(f.type);
    // Auf der Heldenreise gibt es Joker erst, wenn die Station sie erlaubt; Bosse haben keine
    const erlaubt = r.modus === 'reise' ? r.opts.station.joker : ALLE_JOKER;
    if (!erlaubt.length) return '';
    const joker = [
      ['fifty', '50:50', 'zwei weg', !fiftyMoeglich || a.entfernt.length > 0],
      ['zeit', '+10 s', 'mehr Zeit', false],
      ['skip', 'Weiter', 'überspringen', false],
    ].filter(([id]) => erlaubt.includes(id));
    return `<span class="label">Joker</span>
      <div class="joker-leiste">${joker.map(([id, name, info, gesperrt]) => {
        const benutzt = r.joker[id];
        if (benutzt && !r.nachgefuellt[id] && !gesperrt) {
          return `<button class="knopf joker joker-video" data-aktion="jokerVideo" data-joker="${id}" aria-label="Video ansehen, Joker ${name} zurückholen">
          <b>${name}</b><small>${ICON.video} Video</small></button>`;
        }
        return `<button class="knopf joker" data-aktion="joker" data-joker="${id}" ${benutzt || gesperrt ? 'disabled' : ''}>
          <b>${name}</b><small>${benutzt ? 'benutzt' : info}</small></button>`;
      }).join('')}</div>`;
  }

  const e = a.ergebnis;
  let titel;
  let text;
  if (e.korrekt) {
    titel = e.volltreffer ? 'VOLLTREFFER!' : e.knapp ? 'KNAPP DRAN!' : 'RICHTIG!';
    text = `+${zahl(e.punkte)} Punkte${e.faktor > 1 ? ` · Combo ×${e.faktor}` : ''}`;
  } else {
    titel = e.zeitAus ? 'ZEIT ABGELAUFEN' : 'LEIDER FALSCH';
    text = f.type === 'order' || f.type === 'estimate' ? 'Die Lösung steht oben.' : `Richtig: ${antwortText(f)}`;
  }
  if (mitLeben(r) && !e.korrekt) {
    const wort = r.modus === 'reise' ? (r.leben === 1 ? 'Herz' : 'Herzen') : 'Leben';
    text += r.leben > 0 ? ` · noch ${r.leben} ${wort}` : ` · ${r.modus === 'reise' ? 'keine Herzen' : 'keine Leben'} mehr`;
  }
  const letzte = mitLeben(r) ? r.leben <= 0 || r.index >= r.fragen.length - 1 : r.index >= r.fragen.length - 1;
  const knopf = r.modus === 'blitz' ? '' : `<button class="knopf" data-aktion="weiter">${letzte ? 'Ergebnis' : 'Weiter'} ${ICON.weiter}</button>`;
  let melden = '';
  if (r.modus !== 'blitz') {
    melden = a.gemeldet
      ? '<span class="melde-dank">Danke! Wir prüfen das.</span>'
      : '<button class="melde-link" data-aktion="melden">Frage melden</button>';
  }
  const zweiteChance = r.leben <= 0 && !r.zweiteChance && zweiteChanceMoeglich(r);
  return `<div class="karte banner ${e.korrekt ? 'gut' : 'schlecht'}" role="status">
    <div class="text"><span class="display">${titel}</span><small>${esc(text)}</small>${melden}</div>${knopf}
  </div>
  ${zweiteChance ? `<button class="knopf knopf-video" data-aktion="zweiteChance">${ICON.video} Video ansehen: mit 1 ${r.modus === 'reise' ? 'Herz' : 'Leben'} weiterspielen</button>` : ''}`;
}

// Zweite Chance per Video: im Survival immer, auf der Heldenreise nicht beim Endboss
function zweiteChanceMoeglich(r) {
  if (r.modus === 'survival') return true;
  if (r.modus !== 'reise') return false;
  const s = r.opts.station;
  return !(s.boss && s === STATIONEN[STATIONEN.length - 1]);
}

function meldeDialog() {
  const m = ui.melden;
  if (!m) return '';
  return `<div class="dialog-hintergrund">
    <div class="karte dialog" id="melde-dialog" role="dialog" aria-modal="true" aria-labelledby="melde-titel" tabindex="-1">
      <h2 id="melde-titel">Was stimmt nicht?</h2>
      <div class="gruende">${MELDE_GRUENDE.map(([id, name]) => `
        <button class="knopf grund ${m.grund === id ? 'gewaehlt' : ''}" data-aktion="meldeGrund" data-grund="${id}" aria-pressed="${m.grund === id}" ${m.sendet ? 'disabled' : ''}>${name}</button>`).join('')}
      </div>
      <label class="melde-feld">
        <span>Kurze Erklärung <small>(optional)</small></span>
        <textarea id="melde-text" maxlength="${MELDE_TEXT_MAX}" rows="3" placeholder="z. B. Die Folge heißt anders …" ${m.sendet ? 'disabled' : ''}>${esc(m.text)}</textarea>
        <small class="zaehler" id="melde-zaehler">${m.text.length} / ${MELDE_TEXT_MAX}</small>
      </label>
      ${m.fehler ? `<p class="fehler" role="alert">${esc(m.fehler)}</p>` : ''}
      <div class="zweier">
        <button class="knopf" data-aktion="meldeAbbrechen" ${m.sendet ? 'disabled' : ''}>Abbrechen</button>
        <button class="knopf knopf-rot" data-aktion="meldeSenden" ${m.sendet ? 'disabled' : ''}>${m.sendet ? 'Sendet …' : 'Senden'}</button>
      </div>
    </div>
  </div>`;
}

function frageDialog() {
  const d = ui.dialog;
  if (!d) return '';
  return `<div class="dialog-hintergrund" data-aktion="dialogHintergrund">
    <div class="karte dialog dialog-frage" role="dialog" aria-modal="true" aria-labelledby="dialog-titel" ${d.text ? 'aria-describedby="dialog-text"' : ''}>
      <div class="dialog-kopf">
        ${maskottchen(d.stimmung)}
        <h2 id="dialog-titel">${esc(d.titel)}</h2>
      </div>
      ${d.text ? `<p id="dialog-text">${esc(d.text)}</p>` : ''}
      <div class="zweier">
        <button class="knopf" id="dialog-nein" data-aktion="dialogNein">${esc(d.nein)}</button>
        <button class="knopf ${d.gefaehrlich ? 'knopf-rot' : ''}" data-aktion="dialogJa">${esc(d.ja)}</button>
      </div>
    </div>
  </div>`;
}

function frageScreen() {
  const r = ui.runde;
  const a = r.aktuell;
  const f = a.frage;
  const [bg, fg] = FARBEN[f.category];
  const naechsterFaktor = comboFaktor(r.combo + 1);
  const restMs = r.modus === 'blitz' ? Math.max(0, r.blitzEnde - Date.now()) : a.ergebnis ? a.restMs : Math.max(0, a.ende - Date.now());
  const anteil = r.modus === 'blitz' ? restMs / (BLITZZEIT * 1000) : restMs / (a.dauer * 1000);
  const reaktion = a.ergebnis
    ? `<span class="reaktion ${a.ergebnis.korrekt ? '' : 'traurig'}">${a.ergebnis.korrekt ? 'Sugoi!' : 'Schade!'}</span>`
    : '';
  return `<section class="screen">
    ${frageKopf(r)}
    <div class="timer ${restMs <= 5000 ? 'knapp' : ''}" id="timer">
      ${ICON.uhr}
      <div class="balken"><span id="zeitbalken" style="width:${prozent(anteil)}"></span></div>
      <b id="zeitlabel">${Math.ceil(restMs / 1000)} s</b>
    </div>
    <div class="tags">
      <span class="tag" style="background:${bg};color:${fg}">${kategorieIcon(f.category, 16)}${esc(KATEGORIEN[f.category])} · ${esc(SCHWIERIGKEIT[f.difficulty])}</span>
      ${!a.ergebnis && naechsterFaktor > 1 ? `<span class="combo">Combo ×${naechsterFaktor}</span>` : ''}
    </div>
    <div class="frage-zeile">
      <div class="figur">${reaktion}${maskottchen(frageStimmung(a, restMs), 'figur-bild')}</div>
      <div class="karte blase">${frageText(f, a)}</div>
    </div>
    ${antwortenBlock(a)}
    <div class="unten">${unterBlock(r)}</div>
  </section>`;
}

// Sternenreihe für Stationskarte und Ergebnis
function sterneReihe(n, groesse = 28, max = 3) {
  return `<span class="sterne" aria-label="${n} von ${max} Sternen">${Array.from({ length: max }, (_, i) => `<svg width="${groesse}" height="${groesse}" viewBox="-9 -9 18 18" class="${i < n ? 'voll' : ''}"><path d="M0-7l2.1 4.5 4.9.5-3.7 3.3 1 4.9L0 3.8l-4.3 2.4 1-4.9-3.7-3.3 4.9-.5z"/></svg>`).join('')}</span>`;
}

function ergebnisScreen() {
  const e = ui.ergebnis;
  let titel = e.modus === 'survival' ? 'GAME OVER' : e.modus === 'blitz' ? 'ZEIT UM!' : e.perfekt ? 'PERFEKT!' : 'RUNDE GESCHAFFT!';
  let wertung = e.modus === 'survival' || e.modus === 'blitz' ? `${e.richtig} richtig` : `${e.richtig} / ${e.gesamt} richtig`;
  // Höchste Sternzahl der Reise, auch unten im Fuß gebraucht
  const max = e.reise ? maxSterne(e.reise.durchgang) : 3;
  if (e.reise) {
    const s = e.reise.station;
    const ende = e.reise.bestanden && e.reise.stand.fertig && s === STATIONEN[STATIONEN.length - 1];
    if (!e.reise.bestanden) titel = s.boss ? 'BOSS GEWINNT' : 'GESCHEITERT';
    else if (ende) titel = e.reise.durchgang === 2 ? 'ZWEITE HEIMKEHR!' : 'HEIMKEHR!';
    else if (s.boss) titel = 'BOSS BESIEGT!';
    else if (s.geheim) titel = 'GEHEIMPFAD GESCHAFFT!';
    else titel = e.reise.sterne === max ? 'PERFEKT!' : 'STATION GESCHAFFT!';
    wertung = e.reise.bestanden ? sterneReihe(e.reise.sterne, 28, max) : `${e.richtig} / ${e.gesamt} richtig`;
  }
  // Senpai-Zitat nach einem Boss-Sieg
  const zitat = e.reise?.bestanden && e.reise.station.boss && e.reise.station.nachBoss
    ? `<div class="karte senpai-zitat">${maskottchen('mentor')}<p>${esc(e.reise.station.nachBoss)}</p></div>`
    : '';
  const vorher = rang(e.xpVorher);
  const nachher = rang(e.xpVorher + e.xp);
  const aufgestiegen = nachher.name !== vorher.name;
  // Balken: alter Stand rot, neu gewonnene XP gelb (innerhalb des aktuellen Rangs)
  const altAnteil = aufgestiegen ? 0 : vorher.anteil;
  const neuAnteil = Math.max(0, nachher.anteil - altAnteil);
  const nochText = nachher.bis ? `noch ${zahl(nachher.bis - (e.xpVorher + e.xp))} XP bis ${nachher.naechster}` : 'Höchster Rang erreicht';
  const zweiterKnopf = e.modus === 'klassisch'
    ? '<button class="knopf" data-aktion="nav" data-ziel="kategorie">Andere Kategorie</button>'
    : '<button class="knopf" data-aktion="nav" data-ziel="statistik">Statistik</button>';
  // Heldenreise: eigener Fuß mit Weg zur nächsten Station bzw. zur Karte
  let fuss;
  if (e.reise) {
    const s = e.reise.station;
    const naechste = e.reise.stand.naechste;
    const zurKarte = '<button class="knopf" data-aktion="nav" data-ziel="reise">Zur Karte</button>';
    const teilenKnopf = s.boss && e.reise.bestanden ? `<button class="knopf" data-aktion="bossTeilen">${ICON.teilen} Teilen</button>` : '';
    if (!e.reise.bestanden) {
      fuss = `<button class="knopf knopf-rot" data-aktion="nochmal">${ICON.nochmal} Noch einmal</button><div class="zweier">${zurKarte}<button class="knopf" data-aktion="nav" data-ziel="start">Zum Start</button></div>`;
    } else if (s.geheim) {
      fuss = `<button class="knopf knopf-rot" data-aktion="nav" data-ziel="reise">Zur Karte</button><div class="zweier"><button class="knopf" data-aktion="nochmal">${ICON.nochmal} Noch einmal</button><button class="knopf" data-aktion="nav" data-ziel="start">Zum Start</button></div>`;
    } else if (e.reise.stand.fertig) {
      fuss = `<button class="knopf knopf-rot" data-aktion="nav" data-ziel="reise">Zur Karte</button><div class="zweier">${teilenKnopf || `<button class="knopf" data-aktion="nochmal">${ICON.nochmal} Noch einmal</button>`}<button class="knopf" data-aktion="nav" data-ziel="start">Zum Start</button></div>`;
    } else {
      const text = naechste.boss ? `Weiter: ${esc(naechste.titel)}` : `Weiter: Station ${naechste.nr}`;
      const zweiter = teilenKnopf || (e.reise.sterne < max ? `<button class="knopf" data-aktion="nochmal">${ICON.nochmal} Noch einmal</button>` : '<button class="knopf" data-aktion="nav" data-ziel="start">Zum Start</button>');
      fuss = `<button class="knopf knopf-rot" data-aktion="reiseWeiter">${text} ${ICON.weiter}</button><div class="zweier">${zurKarte}${zweiter}</div>`;
    }
  }
  return `<section class="screen">
    <div class="ergebnis-held karte">
      <div class="speedlines"></div>
      <div class="titel"><span>${titel}</span></div>
      ${maskottchen(ergebnisStimmung(e, aufgestiegen))}
      <div class="wertung"><span>${wertung}</span></div>
    </div>

    <div class="kennzahlen">
      <div class="kennzahl"><b>${zahl(e.punkte)}</b><small>Punkte</small></div>
      <div class="kennzahl"><b>×${comboFaktor(e.besteCombo)}</b><small>Beste Combo</small></div>
      <div class="kennzahl"><b>${e.schnitt.toLocaleString('de-DE', { maximumFractionDigits: 1 })} s</b><small>Ø Antwortzeit</small></div>
    </div>

    <div class="karte xp-karte">
      <div class="oben"><span class="display">+${zahl(e.xp)} XP${e.verdoppelt ? ' ×2' : ''}</span><small>${nochText}</small></div>
      <div class="balken"><span style="width:${prozent(altAnteil)}"></span><span class="neu" id="xp-neu" data-ziel="${prozent(neuAnteil)}"></span></div>
      <div class="unter"><span>${esc(nachher.name)}</span><span>${esc(nachher.naechster || '')}</span></div>
    </div>

    ${zitat}
    ${aufgestiegen ? `<div class="erfolg">${rangEmblem(nachher.name, 46)}<span><span class="label">Neuer Rang</span><b>${esc(nachher.name)}</b><small>Du bist aufgestiegen!</small></span></div>` : ''}
    ${e.reise?.neuerTitel ? `<div class="erfolg"><span class="medaille">${ICON.medaille}</span><span><span class="label">Neuer Titel</span><b>${esc(e.reise.neuerTitel)}</b><small>Steht ab jetzt neben deinem Rang.</small></span></div>` : ''}
    ${e.neuerRekord ? `<div class="erfolg"><span class="medaille">${ICON.blitz}</span><span><span class="label">Neuer Rekord</span><b>${e.richtig} richtige Antworten</b><small>${e.modus === 'survival' ? 'Survival' : 'Blitz'}</small></span></div>` : ''}
    ${e.neueAbzeichen.map((ab) => `<div class="erfolg">${abzeichenEmblem(ab.id, 46)}<span><span class="label">Neues Abzeichen</span><b>${esc(ab.name)}</b><small>${esc(ab.text)}</small></span></div>`).join('')}

    <div class="fusszeile">
      ${!e.verdoppelt && e.xp > 0 ? `<button class="knopf knopf-video" data-aktion="xpVerdoppeln">${ICON.video} Video ansehen: XP verdoppeln</button>` : ''}
      ${hinweisBlock()}
      ${fuss ?? `${e.modus === 'tages'
        ? `<button class="knopf knopf-rot" data-aktion="ergebnisTeilen">${ICON.teilen} Ergebnis teilen</button>`
        : `<button class="knopf knopf-rot" data-aktion="nochmal">${ICON.nochmal} Nochmal</button>`}
      <div class="zweier">
        ${zweiterKnopf}
        <button class="knopf" data-aktion="nav" data-ziel="start">Zum Start</button>
      </div>`}
    </div>
  </section>`;
}

// ---------- Heldenreise: Karte und Stationskarte ----------

// Schmale Kachel auf der Startseite (führt zum Reise-Tab)
function reiseKachelStart() {
  const stand = reiseStand();
  const n = stand.naechste;
  const zweite = stand.durchgang === 2;
  let text;
  if (stand.fertig) text = zweite ? 'Beide Reisen geschafft' : 'Reise geschafft';
  else text = `weiter bei ${n.boss ? `${n.kapitel.nr}.Boss` : n.nr}`;
  return `<button class="fortschritt-kachel reise" data-aktion="nav" data-ziel="reise">
    <span class="symbol">${ICON.fahne}</span>
    <span><b>${zweite ? 'Zweite Reise' : 'Heldenreise'}</b><small>${esc(text)}</small></span>
  </button>`;
}

function geheimKnoten(g) {
  const zustand = stationZustand(g);
  const a = aktSterne(g.akt);
  const label = zustand === 'gesperrt' ? `Geheimpfad, offen ab ${a.schwelle} Sternen in Akt ${g.akt.nr}` : `Geheimpfad: ${esc(g.titel)}`;
  return `<div class="pfad geheim-pfad"><button class="station mitte geheim ${zustand}" data-aktion="station" data-id="${g.id}" id="st-${g.id}" aria-label="${label}">
    ${stationsKnoten(stationSterne(g.id), zustand, 64)}<span class="schild">${zustand === 'gesperrt' ? `Geheimpfad · ${a.sterne} / ${a.schwelle} ★` : esc(g.titel)}</span></button></div>`;
}

function reiseScreen() {
  const stand = reiseStand();
  const max = maxSterne();
  let html = '';
  let nr = 0;
  for (const akt of REISE.akte) {
    html += `<div class="akt-karte karte" style="background-image:url('${akt.bild}')"><span class="label">Akt ${akt.nr}</span><b>${esc(akt.name)}</b>${akt.einleitung ? `<small>${esc(akt.einleitung)}</small>` : ''}</div>`;
    for (const k of REISE.kapitel.filter((x) => x.akt === akt.nr)) {
      const stationen = STATIONEN.filter((s) => s.kapitel === k);
      const sterne = stationen.reduce((summe, s) => summe + stationSterne(s.id), 0);
      html += `<div class="kapitel-kopf"><span class="label">Kapitel ${k.nr} · ${esc(k.stufe)}</span><b>${esc(k.titel)}</b><small>${sterne} / ${stationen.length * max} Sterne</small></div>`;
      html += `<div class="pfad">${stationen.map((s) => {
        const zustand = stationZustand(s);
        const seite = s.boss ? 'mitte' : nr++ % 2 ? 'rechts' : 'links';
        const knoten = s.boss ? bossKnoten(zustand, 80) : stationsKnoten(stationSterne(s.id), zustand, 64, max);
        return `<button class="station ${seite} ${zustand} ${s.boss ? 'boss' : ''}" data-aktion="station" data-id="${s.id}" id="st-${s.id}" aria-label="${s.boss ? `Boss: ${esc(s.titel)}` : `Station ${s.nr}: ${esc(s.titel)}`}${zustand === 'gesperrt' ? ', gesperrt' : ''}">
          ${knoten}<span class="schild">${s.boss ? esc(s.titel) : s.nr}</span></button>`;
      }).join('')}</div>`;
    }
    const g = GEHEIM.find((x) => x.akt === akt);
    if (g) html += geheimKnoten(g);
  }
  const wahl = zweiteReiseOffen()
    ? `<div class="segmente" role="group" aria-label="Reise wählen">
        <button data-aktion="durchgang" data-durchgang="1" aria-pressed="${ui.durchgang === 1}">Erste Reise</button>
        <button data-aktion="durchgang" data-durchgang="2" aria-pressed="${ui.durchgang === 2}">Zweite Reise</button>
      </div>${ui.durchgang === 2 ? '<p class="reise-hinweis">Alle Stationen auf Fan und Otaku, nur zwei Herzen. Eigene Sterne, Geheimpfade bleiben auf Otaku.</p>' : ''}`
    : '';
  return `<section class="screen reise mit-tabbar">
    <div class="kopfzeile">
      <h1>${ui.durchgang === 2 ? 'Zweite Reise' : 'Heldenreise'}</h1>
      <span class="sterne-stand">${sterneReihe(1, 18, 1)} ${stand.sterne} / ${stand.sterneMax}</span>
    </div>
    ${wahl}
    ${html}
    ${stationDialog()}
    ${tabbar('reise')}
  </section>`;
}

function stationDialog() {
  const s = station(ui.station);
  if (!s) return '';
  const zustand = stationZustand(s);
  const sterne = stationSterne(s.id);
  const kategorien = s.kategorien.length ? s.kategorien : Object.keys(KATEGORIEN);
  const stufen = stationStufen(s, ui.durchgang).map((d) => SCHWIERIGKEIT[d]).join(', ');
  const gesperrtText = () => {
    if (s.geheim) {
      const a = aktSterne(s.akt);
      return `Ein versteckter Weg. Er öffnet sich mit ${a.schwelle} Sternen in Akt ${s.akt.nr}, du hast ${a.sterne}.`;
    }
    const i = STATIONEN.indexOf(s);
    const davor = STATIONEN[i - 1];
    return davor ? `Erst ${davor.boss ? davor.titel : `Station ${davor.nr}`} bestehen.` : '';
  };
  let text;
  if (zustand === 'gesperrt') text = gesperrtText();
  else if (s.boss) text = s.auftritt;
  else text = s.senpai ?? '';
  const jokerNamen = { fifty: '50:50', zeit: '+10 s', skip: 'Weiter' };
  const herzenZahl = s.geheim ? 3 : maxSterne();
  const regeln = `${s.fragen} Fragen · ${herzenZahl} Herzen${s.zeit !== FRAGEZEIT ? ` · ${s.zeit} s pro Frage` : ''} · ${s.boss ? 'keine Joker' : s.joker.length ? `Joker: ${s.joker.map((j) => jokerNamen[j]).join(', ')}` : 'noch keine Joker'}`;
  return `<div class="dialog-hintergrund" data-aktion="stationHintergrund">
    <div class="karte dialog dialog-station ${s.boss ? 'boss' : ''}" id="station-dialog" role="dialog" aria-modal="true" aria-labelledby="station-titel" tabindex="-1">
      <div class="dialog-kopf">
        ${s.boss ? `<img class="maskottchen boss-bild" src="${s.bild}" alt="">` : maskottchen(zustand === 'gesperrt' ? 'schlafend' : 'mentor')}
        <div>
          <span class="label">${s.geheim ? `Geheimpfad · Akt ${s.akt.nr}` : s.boss ? `Boss · Kapitel ${s.kapitel.nr}` : `Station ${s.nr} · ${esc(s.kapitel.titel)}`}</span>
          <h2 id="station-titel">${esc(s.titel)}</h2>
        </div>
      </div>
      ${zustand !== 'gesperrt' ? sterneReihe(sterne, 32, s.geheim ? 3 : maxSterne()) : ''}
      ${text ? `<p>${esc(text)}</p>` : ''}
      ${zustand !== 'gesperrt' ? `<small class="regeln">${esc(regeln)}</small>` : ''}
      <div class="kat-reihe">${kategorien.length === Object.keys(KATEGORIEN).length ? '<span>Alle Kategorien</span>' : kategorien.map((k) => `<span>${kategorieIcon(k, 18)}${esc(KATEGORIEN[k])}</span>`).join('')}<span class="stufe">${esc(stufen)}</span></div>
      ${zustand === 'gesperrt'
        ? `<button class="knopf" data-aktion="stationSchliessen">${ICON.schloss} Noch gesperrt</button>`
        : `<button class="knopf knopf-rot" data-aktion="stationLos">${ICON.play} ${sterne ? 'Noch einmal' : s.boss ? 'Kampf!' : 'Los'}</button>`}
    </div>
  </div>`;
}

function statistikInhalt() {
  const quote = profil.beantwortet ? Math.round((profil.richtig / profil.beantwortet) * 100) : 0;
  const zeilen = Object.entries(KATEGORIEN).map(([id, name]) => {
    const k = profil.kategorien[id] || { richtig: 0, beantwortet: 0 };
    const anteil = k.beantwortet ? k.richtig / k.beantwortet : 0;
    return `<div class="statistik-zeile">
      <div><span>${kategorieIcon(id, 22)}${esc(name)}</span><small>${k.beantwortet ? `${Math.round(anteil * 100)} % · ${k.richtig}/${k.beantwortet}` : 'noch nicht gespielt'}</small></div>
      <div class="balken"><span style="width:${prozent(anteil)};background:${FARBEN[id][0]}"></span></div>
    </div>`;
  }).join('');
  return `<div class="kennzahlen">
      <div class="kennzahl"><b>${zahl(profil.spiele)}</b><small>Runden</small></div>
      <div class="kennzahl"><b>${quote} %</b><small>Trefferquote</small></div>
      <div class="kennzahl"><b>${aktuelleStreak()}</b><small>${aktuelleStreak() === 1 ? 'Tag' : 'Tage'} in Folge</small></div>
    </div>
    <div class="kennzahlen">
      <div class="kennzahl"><b>${zahl(profil.beantwortet)}</b><small>Antworten</small></div>
      <div class="kennzahl"><b>${profil.highscore.survival}</b><small>Rekord Survival</small></div>
      <div class="kennzahl"><b>${profil.highscore.blitz}</b><small>Rekord Blitz</small></div>
    </div>
    <div class="karte statistik-liste">
      <span class="label">Nach Kategorie</span>
      ${zeilen}
    </div>
    <p style="margin:0;font-size:13px;font-weight:700;text-align:center">${profil.gesehen.length} von ${FRAGEN.length} Fragen schon gesehen</p>
    <button class="leise-knopf" data-aktion="zuruecksetzen">Fortschritt zurücksetzen</button>`;
}

function abzeichenInhalt() {
  const anzahl = profil.abzeichen.length;
  return `<p style="margin:0;font-weight:700">${anzahl} von ${ABZEICHEN.length} freigeschaltet</p>
    <div class="abzeichen-gitter">
      ${ABZEICHEN.map((ab) => {
        const offen = profil.abzeichen.includes(ab.id);
        return `<div class="karte abzeichen ${offen ? '' : 'gesperrt'}">
          ${abzeichenEmblem(ab.id, 46)}
          <b>${esc(ab.name)}</b><small>${esc(ab.text)}</small>
        </div>`;
      }).join('')}
    </div>`;
}

// Profil-Tab: Rang, dann Statistik oder Abzeichen per Segment-Umschaltung
function profilScreen() {
  const rg = rang(profil.xp);
  const tab = ui.profilTab === 'abzeichen' ? 'abzeichen' : 'statistik';
  return `<section class="screen mit-tabbar">
    <div class="kopfzeile"><h1>Profil</h1><button class="icon-knopf" style="margin-left:auto" data-aktion="nav" data-ziel="info" aria-label="Info">${ICON.regler}</button></div>
    <div class="rangzeile">
      ${rangEmblem(rg.name, 40)}
      <div class="rang">
        <div><span class="display">Rang: ${esc(rg.name)}${reiseTitel() ? ` <span class="titel-chip">${esc(reiseTitel())}</span>` : ''}</span><small>${rg.bis ? `${zahl(profil.xp)} / ${zahl(rg.bis)} XP` : `${zahl(profil.xp)} XP`}</small></div>
        <div class="balken"><span style="width:${prozent(rg.anteil)}"></span></div>
      </div>
    </div>
    <div class="segmente profil-segmente" role="group" aria-label="Profil-Bereich">
      <button data-aktion="profilTab" data-tab="statistik" aria-pressed="${tab === 'statistik'}">Statistik</button>
      <button data-aktion="profilTab" data-tab="abzeichen" aria-pressed="${tab === 'abzeichen'}">Abzeichen</button>
    </div>
    <button class="leise-knopf begriffe-link" data-aktion="begriffe">Was heißt eigentlich „Senpai“?</button>
    ${tab === 'abzeichen' ? abzeichenInhalt() : statistikInhalt()}
    ${begriffeDialog()}
    ${tabbar('profil')}
  </section>`;
}

function infoScreen() {
  return `<section class="screen">
    <div class="kopfzeile">
      <button class="icon-knopf" data-aktion="nav" data-ziel="profil" aria-label="Zurück zum Profil">${ICON.zurueck}</button>
      <h1>Über Senpai Quiz</h1>
    </div>
    <div class="karte info-text">
      <p><b>Senpai Quiz ist ein inoffizielles Fan-Quiz.</b> Es steht in keiner Verbindung zu den Rechteinhabern der genannten Serien, Filme und Manga. Alle Namen und Marken gehören ihren jeweiligen Eigentümern.</p>
      <p>Alle Fragen sind selbst geschrieben. Die App enthält keine Bilder, Musik oder Ausschnitte aus Anime oder Manga.</p>
      <p>Dein Fortschritt im Einzelspiel wird nur auf diesem Gerät gespeichert. Für Duelle gegen Freunde legst du einen Account an.</p>
      <p style="font-size:13px;font-weight:700">Version ${VERSION} · ${zahl(FRAGEN.length)} Fragen</p>
    </div>
    ${kontoBereich()}
    <div class="karte info-text">
      <p><b>Rechtliches</b></p>
      <p class="rechts-links">
        <a href="impressum.html" target="_blank" rel="noopener">Impressum</a>
        <a href="datenschutz.html" target="_blank" rel="noopener">Datenschutz</a>
        <a href="nutzungsbedingungen.html" target="_blank" rel="noopener">Nutzungsbedingungen</a>
      </p>
      <p class="kleingedruckt">Kontakt: <a href="mailto:francesbaldes+senpai@gmail.com">francesbaldes+senpai@gmail.com</a></p>
    </div>
  </section>`;
}

// ---------- Online: Account und Duelle ----------

const ONLINE_SCREENS = ['duelle', 'duell', 'duellKategorie'];
let pollId = null;

function ichId() {
  return ui.online.profil?.id;
}

function zeichneOnlineNeu() {
  const tippt = document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
  if (ONLINE_SCREENS.includes(ui.screen) && !tippt) render();
}

function steuerePolling() {
  const aktiv = ['duelle', 'duell'].includes(ui.screen) && !!ui.online.profil;
  if (aktiv && !pollId) {
    pollId = setInterval(() => {
      if (document.visibilityState === 'visible') ladeDuelle(true);
    }, 15000);
  } else if (!aktiv && pollId) {
    clearInterval(pollId);
    pollId = null;
  }
}

async function ladeOnlineProfil() {
  ui.online.fehler = '';
  try {
    ui.online.profil = await online.meinProfil();
  } catch (fehler) {
    ui.online.profil = undefined;
    ui.online.fehler = fehler.message;
  }
  if (ui.online.profil && ui.online.einladung) return zeigeEinladung();
  if (ui.online.profil) await ladeDuelle(true);
  if (ui.online.einladung && ui.online.profil === null) {
    ui.screen = 'duelle';
    return render();
  }
  if (ONLINE_SCREENS.includes(ui.screen) || ui.screen === 'info') render();
}

async function ladeDuelle(leise = false) {
  if (!ui.online.profil) return;
  if (!leise) {
    ui.online.laedt = true;
    zeichneOnlineNeu();
  }
  try {
    const duelle = await online.meineDuelle();
    const geaendert = JSON.stringify(duelle) !== JSON.stringify(ui.online.duelle);
    ui.online.duelle = duelle;
    if (!leise || geaendert) {
      ui.online.laedt = false;
      zeichneOnlineNeu();
    }
  } catch (fehler) {
    if (!leise) ui.online.fehler = fehler.message;
  } finally {
    if (ui.online.laedt) {
      ui.online.laedt = false;
      zeichneOnlineNeu();
    }
  }
}

async function zeigeEinladung() {
  const code = ui.online.einladung;
  try {
    const gegner = await online.profilPerCode(code);
    if (!gegner) {
      ui.online.einladung = null;
      ui.online.fehler = `Zum Einladungscode ${code} wurde kein Spieler gefunden.`;
      ui.screen = 'duelle';
    } else if (gegner.id === ichId()) {
      ui.online.einladung = null;
      ui.online.meldung = 'Das ist dein eigener Einladungslink. Schick ihn an deine Freunde!';
      ui.screen = 'duelle';
    } else {
      ui.online.einladungProfil = gegner;
      ui.screen = 'einladung';
    }
  } catch (fehler) {
    ui.online.fehler = fehler.message;
    ui.screen = 'duelle';
  }
  render();
  ladeDuelle(true);
}

// Was ein Spieler von einem Duell sehen darf: Die Ergebnisse des Gegners für eine Runde
// erscheinen erst, wenn man selbst gespielt hat (wie bei Quizduell).
function duellSicht(d) {
  const ich = ichId();
  const binErster = d.spieler1 === ich;
  const gegnerId = binErster ? d.spieler2 : d.spieler1;
  const gegnerName = (binErster ? d.s2 : d.s1)?.spielername ?? 'Unbekannt';
  const runden = [...(d.duell_runden || [])].sort((a, b) => a.nr - b.nr);
  let meine = 0;
  let seine = 0;
  const zeilen = [1, 2, 3, 4, 5, 6].map((nr) => {
    const runde = runden.find((x) => x.nr === nr);
    const mein = runde?.duell_antworten?.find((x) => x.spieler === ich)?.ergebnisse ?? null;
    const sein = runde?.duell_antworten?.find((x) => x.spieler === gegnerId)?.ergebnisse ?? null;
    const seinSichtbar = !!mein || d.status !== 'laeuft';
    if (mein) meine += mein.filter(Boolean).length;
    if (sein && seinSichtbar) seine += sein.filter(Boolean).length;
    return { nr, kategorie: runde?.kategorie, mein, sein: seinSichtbar ? sein : null, verdeckt: !!sein && !seinSichtbar };
  });
  const amZug = d.status === 'laeuft' && d.am_zug === ich;
  const aktuelleRunde = runden.find((x) => x.nr === d.runde);
  let phase = 'ende';
  if (d.status === 'laeuft') phase = !amZug ? 'warten' : aktuelleRunde ? 'spielen' : 'waehlen';
  let ausgang = null;
  if (d.status !== 'laeuft') ausgang = d.gewinner === ich ? 'sieg' : d.gewinner ? 'niederlage' : 'unentschieden';
  return { d, gegnerId, gegnerName, zeilen, meine, seine, phase, aktuelleRunde, ausgang };
}

function duellStatusText(s) {
  const n = `Runde ${s.d.runde} von 6`;
  if (s.phase === 'waehlen') return `Du wählst die Kategorie · ${n}`;
  if (s.phase === 'spielen') return `Du bist dran · ${n}`;
  if (s.phase === 'warten') return `${s.gegnerName} ist dran · ${n}`;
  const aufgegeben = s.d.status === 'aufgegeben'
    ? (s.d.aufgegeben_von === ichId() ? ' · du hast aufgegeben' : ` · ${s.gegnerName} hat aufgegeben`)
    : '';
  return { sieg: 'Gewonnen!', niederlage: 'Verloren', unentschieden: 'Unentschieden' }[s.ausgang] + aufgegeben;
}

function duellStimmung(s) {
  if (s.phase === 'warten') return 'schlafend';
  if (s.phase !== 'ende') return 'entschlossen';
  return { sieg: 'feiernd', niederlage: 'traurig', unentschieden: 'verlegen' }[s.ausgang];
}

async function duellRundeFertig(r) {
  stoppeTimer();
  const ergebnisse = [0, 1, 2].map((i) => r.verlauf[i] === true);
  const xp = Math.round(r.punkte / 10);
  profil.xp += xp;
  profil.spiele++;
  ereignis('runde', r.modus);
  speichern();
  ui.runde = null;
  ui.online.duellId = r.opts.duellId;
  ui.online.fehler = '';
  ui.online.meldung = '';
  ui.screen = 'duell';
  ui.online.laedt = true;
  render();
  try {
    await online.rundeAbschliessen(r.opts.duellId, ergebnisse);
    ui.online.meldung = `${r.richtig} von 3 richtig · +${zahl(xp)} XP`;
  } catch (fehler) {
    ui.online.fehler = `Dein Ergebnis konnte nicht gespeichert werden: ${fehler.message}`;
  }
  await ladeDuelle();
}

async function oeffneDuell(id) {
  ui.online.duellId = id;
  ui.online.fehler = '';
  ui.online.meldung = '';
  ui.screen = 'duell';
  await ladeDuelle();
}

Object.assign(aktionen, {
  async accountErstellen() {
    const o = ui.online;
    const name = o.nameEingabe.trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(name)) {
      o.fehler = 'Der Spielername braucht 3 bis 20 Zeichen: Buchstaben, Zahlen oder _';
      return render();
    }
    if (!spielernameErlaubt(name)) {
      o.fehler = SPIELERNAME_VERBOTEN;
      return render();
    }
    o.laedt = true;
    o.fehler = '';
    render();
    try {
      o.profil = await online.accountAnlegen(name);
      o.laedt = false;
      if (o.einladung) return zeigeEinladung();
      o.meldung = `Willkommen, ${o.profil.spielername}! Fordere jetzt einen Freund heraus.`;
      render();
      ladeDuelle(true);
    } catch (fehler) {
      o.laedt = false;
      o.fehler = fehler.message;
      render();
    }
  },
  onlineNeu() {
    ui.online.fehler = '';
    render();
    ladeOnlineProfil();
  },
  aktualisieren() {
    ui.online.meldung = '';
    ui.online.fehler = '';
    ladeDuelle();
  },
  async suchen() {
    const o = ui.online;
    const text = o.suchText.trim();
    o.fehler = '';
    if (text.length < 2) {
      o.fehler = 'Gib mindestens 2 Zeichen ein.';
      return render();
    }
    try {
      o.treffer = (await online.spielerSuchen(text)).filter((p) => p.id !== ichId());
    } catch (fehler) {
      o.fehler = fehler.message;
    }
    render();
  },
  codeEinloesen() {
    const code = ui.online.codeEingabe.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      ui.online.fehler = 'Ein Einladungscode hat 6 Zeichen.';
      return render();
    }
    ui.online.fehler = '';
    ui.online.einladung = code;
    zeigeEinladung();
  },
  async herausfordern(d) {
    ui.online.fehler = '';
    try {
      const id = await online.herausfordern(d.id);
      await oeffneDuell(id);
    } catch (fehler) {
      // Läuft schon ein Duell gegen diesen Spieler, dorthin wechseln; dafür die Liste
      // frisch holen, sonst fehlt ein Duell, das der Gegner gerade erst angefangen hat.
      await ladeDuelle(true);
      const laufend = ui.online.duelle.find((x) => x.status === 'laeuft' && [x.spieler1, x.spieler2].includes(d.id));
      if (laufend) return oeffneDuell(laufend.id);
      ui.online.fehler = fehler.message;
      render();
    }
  },
  duellOeffnen(d) {
    oeffneDuell(d.id);
  },
  async kategorieNehmen(d) {
    const id = ui.online.duellId;
    try {
      const fragenIds = await online.rundeStarten(id, d.kategorie);
      neueRunde('duell', { duellId: id, fragenIds });
    } catch (fehler) {
      ui.online.fehler = fehler.message;
      ui.screen = 'duell';
      render();
      ladeDuelle(true);
    }
  },
  rundeSpielen() {
    const d = ui.online.duelle.find((x) => x.id === ui.online.duellId);
    const runde = d && duellSicht(d).aktuelleRunde;
    if (runde) neueRunde('duell', { duellId: d.id, fragenIds: runde.fragen });
  },
  async aufgeben() {
    const duellId = ui.online.duellId;
    const ok = await frage({ titel: 'Duell aufgeben?', text: 'Dein Gegner gewinnt dann.', ja: 'Aufgeben', gefaehrlich: true, stimmung: 'traurig' });
    if (!ok || ui.online.duellId !== duellId) return;
    ui.online.meldung = '';
    try {
      await online.aufgeben(duellId);
    } catch (fehler) {
      ui.online.fehler = fehler.message;
    }
    ladeDuelle();
  },
  async einladen() {
    const p = ui.online.profil;
    const link = `${appLink()}?einladung=${p.einladungscode}`;
    const text = `Fordere mich in Senpai Quiz zu einem Anime-Duell heraus! Mein Spielername: ${p.spielername}`;
    const ergebnis = await teilen(text, link);
    if (ergebnis === 'geteilt' || ergebnis === 'abgebrochen') return;
    if (ergebnis === 'kopiert') ui.online.meldung = 'Einladungslink kopiert. Schick ihn per WhatsApp oder Nachricht.';
    else ui.online.linkZeigen = true;
    render();
  },
  async einladungAnnehmen() {
    const gegner = ui.online.einladungProfil;
    ui.online.einladung = null;
    ui.online.einladungProfil = null;
    await aktionen.herausfordern({ id: gegner.id });
  },
  einladungSpaeter() {
    ui.online.einladung = null;
    ui.online.einladungProfil = null;
    aktionen.nav({ ziel: 'duelle' });
  },
  async kontoLoeschen() {
    const ok = await frage({ titel: 'Account löschen?', text: 'Dein Spielername und alle deine Duelle werden endgültig gelöscht.', ja: 'Löschen', gefaehrlich: true, stimmung: 'traurig' });
    if (!ok || !ui.online.profil) return;
    try {
      await online.kontoLoeschen();
      ui.online.profil = null;
      ui.online.duelle = [];
      ui.online.meldung = 'Dein Account wurde gelöscht.';
    } catch (fehler) {
      ui.online.fehler = fehler.message;
    }
    render();
  },
});

// Nach dem Teilen: Hinweis anzeigen und beim ersten Mal das Abzeichen „Teilgeist“ vergeben
function nachTeilen(ergebnis) {
  if (ergebnis === 'abgebrochen') return;
  ui.hinweis = null;
  if (ergebnis === 'fehler') {
    ui.hinweis = { text: 'Teilen ist auf diesem Gerät leider nicht möglich.', fehler: true };
    return render();
  }
  let text = ergebnis === 'kopiert' ? 'Ergebnis kopiert' : '';
  if (!profil.abzeichen.includes('teilgeist')) {
    const ab = ABZEICHEN.find((x) => x.id === 'teilgeist');
    profil.abzeichen.push(ab.id);
    speichern();
    if (ui.screen === 'ergebnis' && ui.ergebnis) ui.ergebnis.neueAbzeichen = [...ui.ergebnis.neueAbzeichen, ab];
    else text += `${text ? ' · ' : ''}Neues Abzeichen: ${ab.name}`;
  }
  if (text) ui.hinweis = { text };
  render();
}

// Meldung nach dem Teilen (Start- und Ergebnis-Bildschirm)
function hinweisBlock() {
  const h = ui.hinweis;
  if (!h) return '';
  return `<p class="${h.fehler ? 'fehler' : 'meldung'}" role="${h.fehler ? 'alert' : 'status'}">${esc(h.text)}</p>`;
}

function hinweise() {
  const o = ui.online;
  return `${o.fehler ? `<p class="fehler" role="alert">${esc(o.fehler)}</p>` : ''}${o.meldung ? `<p class="meldung" role="status">${esc(o.meldung)}</p>` : ''}`;
}

function accountScreen() {
  const o = ui.online;
  return `<section class="screen mit-tabbar">
    <div class="kopfzeile"><h1>Duelle</h1></div>
    <div class="karte konto-karte">
      ${maskottchen(o.einladung ? 'herausfordernd' : 'winkend')}
      <h2>${o.einladung ? 'Du wurdest herausgefordert!' : 'Spiel gegen deine Freunde'}</h2>
      <p>${o.einladung ? 'Erstelle zuerst deinen Account, dann geht’s los.' : 'Wie bei Quizduell: 6 Runden mit je 3 Fragen. Ihr spielt abwechselnd, wann es euch passt.'}</p>
      <form class="formular" data-aktion="accountErstellen">
        <label for="name-eingabe">Dein Spielername</label>
        <input id="name-eingabe" maxlength="20" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="z. B. ramen_fan_99" value="${esc(o.nameEingabe)}">
        <small>3 bis 20 Zeichen: Buchstaben, Zahlen oder _. Andere Spieler sehen diesen Namen.</small>
        ${hinweise()}
        <button class="knopf knopf-rot" type="submit" ${o.laedt ? 'disabled' : ''}>${o.laedt ? 'Einen Moment …' : 'Account erstellen'}</button>
      </form>
      <p class="kleingedruckt">Wir brauchen keine E-Mail-Adresse. Dein Account ist an dieses Gerät gebunden: Wenn du die App löschst, ist er weg.</p>
      <p class="kleingedruckt">Mit „Account erstellen“ akzeptierst du die <a href="nutzungsbedingungen.html" target="_blank" rel="noopener">Nutzungsbedingungen</a>. Was wir speichern, steht in der <a href="datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a>.</p>
    </div>
    ${tabbar('duelle')}
  </section>`;
}

function duellZeile(d) {
  const s = duellSicht(d);
  const dran = s.phase === 'waehlen' || s.phase === 'spielen';
  return `<button class="karte duell-zeile ${dran ? 'dran' : ''}" data-aktion="duellOeffnen" data-id="${d.id}">
    <span><b>${esc(s.gegnerName)}</b><small>${esc(duellStatusText(s))}</small></span>
    <span class="stand display">${s.meine} : ${s.seine}</span>
  </button>`;
}

function duelleScreen() {
  const o = ui.online;
  if (o.profil === undefined) {
    return `<section class="screen mit-tabbar">
      <div class="kopfzeile"><h1>Duelle</h1></div>
      ${o.fehler
        ? `${hinweise()}<button class="knopf" data-aktion="onlineNeu">${ICON.nochmal} Nochmal versuchen</button>`
        : '<p class="leer">Verbinde mit dem Server …</p>'}
      ${tabbar('duelle')}
    </section>`;
  }
  if (!o.profil) return accountScreen();

  const sichten = o.duelle.map((d) => ({ d, s: duellSicht(d) }));
  const dran = sichten.filter(({ s }) => s.phase === 'waehlen' || s.phase === 'spielen');
  const warten = sichten.filter(({ s }) => s.phase === 'warten');
  const ende = sichten.filter(({ s }) => s.phase === 'ende').slice(0, 10);
  const abschnitt = (titel, liste) => (liste.length
    ? `<div class="abschnitt"><span class="label">${titel}</span>${liste.map(({ d }) => duellZeile(d)).join('')}</div>`
    : '');
  const link = `${appLink()}?einladung=${o.profil.einladungscode}`;

  return `<section class="screen mit-tabbar">
    <div class="kopfzeile">
      <h1 style="flex:1">Duelle</h1>
      <button class="icon-knopf" data-aktion="aktualisieren" aria-label="Aktualisieren">${ICON.nochmal}</button>
    </div>
    <div class="karte profil-karte">
      <div><span class="label">Dein Spielername</span><b class="display">${esc(o.profil.spielername)}</b></div>
      <div style="text-align:right"><span class="label">Einladungscode</span><b class="code">${esc(o.profil.einladungscode)}</b></div>
    </div>
    <div class="zweier">
      <button class="knopf" data-aktion="nav" data-ziel="suche">${ICON.lupe} Spieler suchen</button>
      <button class="knopf" data-aktion="einladen">${ICON.teilen} Freund einladen</button>
    </div>
    ${o.linkZeigen ? `<div class="karte formular link-feld"><label for="einladungslink">Kopiere diesen Link und schick ihn deinem Freund:</label><input id="einladungslink" readonly value="${esc(link)}" onfocus="this.select()"></div>` : ''}
    ${hinweise()}
    ${abschnitt('Du bist dran', dran)}
    ${abschnitt('Warten auf Gegner', warten)}
    ${abschnitt('Beendet', ende)}
    ${!o.duelle.length ? `<div class="karte leer">${maskottchen('nachdenklich')}<span>${o.laedt ? 'Lade Duelle …' : 'Noch keine Duelle. Fordere einen Freund heraus!'}</span></div>` : ''}
    ${tabbar('duelle')}
  </section>`;
}

function sucheScreen() {
  const o = ui.online;
  const treffer = o.treffer === null ? '' : o.treffer.length
    ? `<div class="abschnitt">${o.treffer.map((p) => `
        <div class="karte duell-zeile">
          <b>${esc(p.spielername)}</b>
          <button class="knopf knopf-klein" data-aktion="herausfordern" data-id="${p.id}">${ICON.schwerter} Herausfordern</button>
        </div>`).join('')}</div>`
    : '<p class="leer">Niemand gefunden. Stimmt der Spielername?</p>';
  return `<section class="screen">
    <div class="kopfzeile">
      <button class="icon-knopf" data-aktion="nav" data-ziel="duelle" aria-label="Zurück zu den Duellen">${ICON.zurueck}</button>
      <h1>Spieler suchen</h1>
    </div>
    <form class="karte formular" data-aktion="suchen">
      <label for="such-eingabe">Spielername</label>
      <div class="such-zeile">
        <input id="such-eingabe" maxlength="20" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" value="${esc(o.suchText)}">
        <button class="knopf" type="submit" aria-label="Suchen">${ICON.lupe}</button>
      </div>
    </form>
    ${hinweise()}
    ${treffer}
    <form class="karte formular" data-aktion="codeEinloesen">
      <label for="code-eingabe">Oder Einladungscode eingeben</label>
      <div class="such-zeile">
        <input id="code-eingabe" maxlength="6" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" placeholder="ABC123" value="${esc(o.codeEingabe)}">
        <button class="knopf" type="submit">Los</button>
      </div>
    </form>
  </section>`;
}

function punktReihe(ergebnisse, verdeckt) {
  if (verdeckt) return '<span class="punkt verdeckt">?</span>'.repeat(3);
  if (!ergebnisse) return '<span class="punkt"></span>'.repeat(3);
  return ergebnisse.map((ok) => `<span class="punkt ${ok ? 'ja' : 'nein'}" aria-label="${ok ? 'richtig' : 'falsch'}"></span>`).join('');
}

function duellScreen() {
  const o = ui.online;
  const d = o.duelle.find((x) => x.id === o.duellId);
  const zurueck = `<button class="icon-knopf" data-aktion="nav" data-ziel="duelle" aria-label="Zurück zu den Duellen">${ICON.zurueck}</button>`;
  if (!d) {
    return `<section class="screen"><div class="kopfzeile">${zurueck}<h1>Duell</h1></div>
      ${hinweise()}<p class="leer">${o.laedt ? 'Lade Duell …' : 'Duell nicht gefunden.'}</p></section>`;
  }
  const s = duellSicht(d);
  let aktion = '';
  if (s.phase === 'waehlen') aktion = `<button class="knopf knopf-rot" data-aktion="nav" data-ziel="duellKategorie">Kategorie wählen</button>`;
  if (s.phase === 'spielen') aktion = `<button class="knopf knopf-rot" data-aktion="rundeSpielen">${ICON.play} Runde ${d.runde} spielen</button>`;
  if (s.phase === 'warten') aktion = `<button class="knopf" data-aktion="aktualisieren">${ICON.nochmal} Aktualisieren</button>`;
  if (s.phase === 'ende') aktion = `<button class="knopf knopf-rot" data-aktion="herausfordern" data-id="${s.gegnerId}">${ICON.schwerter} Revanche</button>`;

  return `<section class="screen">
    <div class="kopfzeile">${zurueck}<h1>Duell</h1></div>
    <div class="karte duell-kopf">
      <div class="seite"><span class="label">Du</span><b>${esc(o.profil.spielername)}</b></div>
      <div class="mitte">${maskottchen(duellStimmung(s))}<span class="display stand-gross">${s.meine} : ${s.seine}</span></div>
      <div class="seite rechts"><span class="label">Gegner</span><b>${esc(s.gegnerName)}</b></div>
    </div>
    <p class="status-text">${esc(duellStatusText(s))}</p>
    ${hinweise()}
    <div class="karte runden">
      ${s.zeilen.map((z) => `<div class="runden-zeile ${z.nr === d.runde && d.status === 'laeuft' ? 'aktiv' : ''}">
        <span class="punkte-reihe">${punktReihe(z.mein)}</span>
        <span class="runden-kat">${z.kategorie ? `${kategorieIcon(z.kategorie, 16)}${esc(kategorieName(z.kategorie))}` : `Runde ${z.nr}`}</span>
        <span class="punkte-reihe">${punktReihe(z.sein, z.verdeckt)}</span>
      </div>`).join('')}
    </div>
    <div class="fusszeile">
      ${o.laedt ? '<p class="leer">Speichere …</p>' : aktion}
      ${d.status === 'laeuft' ? '<button class="leise-knopf" data-aktion="aufgeben">Aufgeben</button>' : ''}
    </div>
  </section>`;
}

function duellKategorieScreen() {
  const o = ui.online;
  const d = o.duelle.find((x) => x.id === o.duellId);
  if (!d) return duellScreen();
  const s = duellSicht(d);
  return `<section class="screen">
    <div class="kopfzeile">
      <button class="icon-knopf" data-aktion="nav" data-ziel="duell" aria-label="Zurück zum Duell">${ICON.zurueck}</button>
      <h1>Kategorie wählen</h1>
    </div>
    <p style="margin:0;font-weight:700;line-height:1.45">Runde ${d.runde} von 6. Du spielst zuerst, danach bekommt ${esc(s.gegnerName)} dieselben drei Fragen.</p>
    ${hinweise()}
    <div class="abschnitt">
      ${d.kategorie_optionen.map((k) => `
        <button class="knopf kat breit" style="background:${(FARBEN[k] ?? FARBEN.kultur)[0]};color:${(FARBEN[k] ?? FARBEN.kultur)[1]}" data-aktion="kategorieNehmen" data-kategorie="${k}">
          ${kategorieIcon(k, 36)}
          <span class="kat-text"><b>${esc(kategorieName(k))}</b><small>${esc(UNTERTITEL[k] ?? '')}</small></span>
        </button>`).join('')}
    </div>
  </section>`;
}

function einladungScreen() {
  const gegner = ui.online.einladungProfil;
  if (!gegner) return duelleScreen();
  return `<section class="screen">
    <div class="karte konto-karte">
      ${maskottchen('herausfordernd')}
      <h2>${esc(gegner.spielername)} fordert dich heraus!</h2>
      <p>6 Runden mit je 3 Fragen. Wer am Ende mehr richtig hat, gewinnt.</p>
      ${hinweise()}
      <button class="knopf knopf-rot" data-aktion="einladungAnnehmen">${ICON.schwerter} Duell starten</button>
      <button class="leise-knopf" data-aktion="einladungSpaeter">Später</button>
    </div>
  </section>`;
}

function kontoBereich() {
  const p = ui.online.profil;
  if (!p) return ui.online.meldung ? hinweise() : '';
  return `<div class="karte info-text">
    <p><b>Dein Account: ${esc(p.spielername)}</b></p>
    <p>Für Duelle speichern wir auf einem Server in Frankfurt (Supabase): deinen Spielernamen, eine zufällige Nutzer-ID, deinen Einladungscode und deine Duelle. Keine E-Mail-Adresse, kein echter Name.</p>
    ${hinweise()}
    <button class="knopf" data-aktion="kontoLoeschen">Account löschen</button>
  </div>`;
}

const SCREENS = {
  start: startScreen,
  reise: reiseScreen,
  kategorie: kategorieScreen,
  frage: frageScreen,
  ergebnis: ergebnisScreen,
  profil: profilScreen,
  // Alte Bildschirm-IDs: Weiterleitung auf den Profil-Tab
  statistik: () => { ui.profilTab = 'statistik'; ui.screen = 'profil'; return profilScreen(); },
  abzeichen: () => { ui.profilTab = 'abzeichen'; ui.screen = 'profil'; return profilScreen(); },
  info: infoScreen,
  duelle: duelleScreen,
  suche: sucheScreen,
  duell: duellScreen,
  duellKategorie: duellKategorieScreen,
  einladung: einladungScreen,
  ...DOJO_SCREENS,
};

let letzterScreen = null;

function render() {
  // Dialoge liegen als Overlay über dem Bildschirm
  app.innerHTML = SCREENS[ui.screen]() + meldeDialog() + frageDialog();
  if (ui.screen !== letzterScreen) {
    window.scrollTo(0, 0);
    letzterScreen = ui.screen;
    // Karte der Heldenreise: zur nächsten offenen Station rollen
    if (ui.screen === 'reise') {
      const ziel = reiseStand().naechste;
      const el = ziel && document.getElementById(`st-${ziel.id}`);
      if (el) el.scrollIntoView({ block: 'center' });
    }
  }
  if (ui.dialog) {
    const karte = app.querySelector('.dialog-frage');
    if (!karte.contains(document.activeElement)) document.getElementById('dialog-nein').focus();
  }
  steuerePolling();
}

// ---------- Start ----------

// Statistik der früheren Kategorie „manga“ in „kultur“ überführen (Umstellung auf zehn Kategorien)
function uebernimmAlteKategorien() {
  const alt = profil.kategorien.manga;
  if (!alt) return;
  const ziel = (profil.kategorien.kultur ||= { richtig: 0, beantwortet: 0 });
  ziel.richtig += alt.richtig;
  ziel.beantwortet += alt.beantwortet;
  delete profil.kategorien.manga;
  profil.gespielteKategorien = profil.gespielteKategorien.map((k) => (k === 'manga' ? 'kultur' : k));
  speichern();
}

async function init() {
  try {
    const [antwort, reiseAntwort] = await Promise.all([fetch('data/fragen.json'), fetch('data/reise.json'), speicherBereit(), ladeDojo()]);
    const daten = await antwort.json();
    FRAGEN = daten.fragen;
    KATEGORIEN = daten.kategorien;
    SCHWIERIGKEIT = daten.schwierigkeiten;
    REISE = await reiseAntwort.json();
    baueStationen();
    profil = ladeProfil(PROFIL_START);
    profil.reise ||= { sterne: {}, durchgang: 1 };
    ui.durchgang = profil.reise.durchgang === 2 && zweiteReiseOffen() ? 2 : 1;
    uebernimmAlteKategorien();
    dojoEinrichten({ profil: () => profil, speichern, render, esc, maskottchen, tabbar, frage, ICON, ui, onlineProfil: () => ui.online.profil, serie: serieHeute, streak: aktuelleStreak, abzeichen: abzeichenVergeben, abzeichenEmblem });
    // Nur die Stimmungen vorladen, die während einer Frage wechseln; der Rest lädt bei Bedarf
    STIMMUNGEN_FRAGE.forEach((s) => { new Image().src = `assets/stimmung/${s}.webp`; });
    ereignis('start');
    // Einladungslink? (…?einladung=CODE)
    const parameter = new URLSearchParams(location.search);
    if (parameter.get('einladung')) {
      ui.online.einladung = parameter.get('einladung');
      history.replaceState(null, '', location.pathname);
    }
    render();
    ladeOnlineProfil();
  } catch (fehler) {
    app.innerHTML = '<p class="laden">Die Fragen konnten nicht geladen werden.</p>';
    console.error(fehler);
  }
}

init();
