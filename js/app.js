// Senpai Quiz – Prototyp. Reines JavaScript ohne Build-Schritt.

import * as online from './online.js';

const app = document.getElementById('app');

// ---------- Konstanten ----------

const FRAGEZEIT = 15;
const BLITZZEIT = 60;
const RUNDENLAENGE = 10;
const SPEICHER = 'senpai-quiz-v1';
const VERSION = '0.1.0';
const MELDE_GRUENDE = [
  ['antwort_falsch', 'Antwort ist falsch'],
  ['unklar', 'Frage ist unklar'],
  ['tippfehler', 'Tippfehler'],
];
const MELDE_TEXT_MAX = 200;

const STUFEN_WAHL = [
  { id: 'easy', label: 'Einsteiger', stufen: [1] },
  { id: 'fan', label: 'Fan', stufen: [1, 2] },
  { id: 'otaku', label: 'Otaku', stufen: [2, 3] },
];

const FARBEN = {
  shonen: ['#D7261E', '#FFFFFF'],
  shojo: ['#FFB3CF', '#141414'],
  filme: ['#1F5FD1', '#FFFFFF'],
  manga: ['#141414', '#FFFFFF'],
  neu: ['#FF8A3D', '#141414'],
  kultur: ['#177A41', '#FFFFFF'],
};

const UNTERTITEL = {
  shonen: 'Kämpfe, Freundschaft, große Ziele',
  shojo: 'Herzklopfen und Drama',
  filme: 'Kino-Anime und ihre Macher',
  manga: 'Zeichner, Verlage, Bände',
  neu: 'Alles ab 2015',
  kultur: 'Senpai, Bentō, Kotatsu\u00a0…',
};

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
];

// ---------- Daten & Zustand ----------

let FRAGEN = [];
let KATEGORIEN = {};
let SCHWIERIGKEIT = {};

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
};

let profil = ladeProfil();

const ui = {
  screen: 'start',
  wahl: { stufe: 'fan', kategorie: 'mix' },
  runde: null,
  ergebnis: null,
  melden: null, // offener „Frage melden“-Dialog: { grund, text, fehler, sendet }
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

function ladeProfil() {
  const start = structuredClone(PROFIL_START);
  try {
    const gespeichert = JSON.parse(localStorage.getItem(SPEICHER));
    return gespeichert ? { ...start, ...gespeichert } : start;
  } catch {
    return start;
  }
}

function speichern() {
  try {
    localStorage.setItem(SPEICHER, JSON.stringify(profil));
  } catch {
    // Speichern nicht möglich (z. B. privates Fenster) – Spiel läuft trotzdem.
  }
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

// ---------- Rundenablauf ----------

function neueRunde(modus, opts = {}) {
  let fragen = [];
  let reserve = [];
  if (modus === 'klassisch') {
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
  ui.runde = {
    modus,
    opts,
    fragen,
    reserve,
    index: 0,
    punkte: 0,
    combo: 0,
    besteCombo: 0,
    richtig: 0,
    beantwortet: 0,
    schnelle: 0,
    leben: 3,
    zeiten: [],
    verlauf: [],
    joker: { fifty: false, zeit: false, skip: false },
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
    dauer: FRAGEZEIT,
    ende: r.blitzEnde ? null : Date.now() + FRAGEZEIT * 1000,
  };
  starteTimer();
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
    if (r.modus === 'survival') r.leben--;
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
  if (r.modus === 'survival' && r.leben <= 0) return beendeRunde();
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
  const feste = r.modus === 'klassisch' || r.modus === 'tages';
  const gesamt = feste ? r.fragen.length : r.beantwortet;
  const perfekt = feste && r.richtig === r.fragen.length;
  const xpVorher = profil.xp;
  const xp = Math.round(r.punkte / 10) + (perfekt ? 50 : 0);
  profil.xp += xp;
  profil.spiele++;

  let neuerRekord = false;
  if ((r.modus === 'survival' || r.modus === 'blitz') && r.richtig > profil.highscore[r.modus]) {
    profil.highscore[r.modus] = r.richtig;
    neuerRekord = r.richtig > 0;
  }
  if (r.modus === 'tages') {
    const s = profil.streak;
    if (s.letzter !== heute()) {
      s.tage = s.letzter === gestern() ? s.tage + 1 : 1;
      s.letzter = heute();
    }
    profil.tagesquiz = { datum: heute(), richtig: r.richtig, gesamt };
  }
  if (r.modus === 'klassisch' && r.opts.kategorie !== 'mix' && !profil.gespielteKategorien.includes(r.opts.kategorie)) {
    profil.gespielteKategorien.push(r.opts.kategorie);
  }

  const neueAbzeichen = ABZEICHEN.filter((ab) => !profil.abzeichen.includes(ab.id) && ab.pruefe(r, perfekt));
  profil.abzeichen.push(...neueAbzeichen.map((ab) => ab.id));
  speichern();

  const schnitt = r.zeiten.length ? r.zeiten.reduce((s, z) => s + z, 0) / r.zeiten.length : 0;
  ui.ergebnis = {
    modus: r.modus,
    opts: r.opts,
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
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const neu = document.getElementById('xp-neu');
    if (neu) neu.style.width = neu.dataset.ziel;
  }));
}

// ---------- Aktionen ----------

const aktionen = {
  nav(d) {
    ui.screen = d.ziel;
    ui.online.fehler = '';
    ui.online.meldung = '';
    ui.online.linkZeigen = false;
    render();
    if (d.ziel === 'duelle' && ui.online.profil) ladeDuelle(true);
  },
  tagesquiz() {
    if (profil.tagesquiz?.datum === heute()) return;
    neueRunde('tages');
  },
  modus(d) {
    neueRunde(d.modus);
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
  abbrechen() {
    if (ui.runde?.modus === 'duell') {
      if (!confirm('Runde abbrechen? Fragen ohne Antwort zählen als falsch.')) return;
      return duellRundeFertig(ui.runde);
    }
    if (!confirm('Runde wirklich beenden? Der Fortschritt dieser Runde geht verloren.')) return;
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
  zuruecksetzen() {
    if (!confirm('Wirklich alle Punkte, Statistiken und Abzeichen löschen?')) return;
    profil = structuredClone(PROFIL_START);
    speichern();
    render();
  },
};

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-aktion]');
  if (!el || el.disabled) return;
  aktionen[el.dataset.aktion]?.(el.dataset);
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
  const tabs = [
    ['start', 'Start', ICON.haus],
    ['duelle', 'Duelle', ICON.schwerter],
    ['statistik', 'Statistik', ICON.diagramm],
    ['abzeichen', 'Abzeichen', ICON.medaille],
  ];
  return `<nav class="tabbar" aria-label="Hauptmenü">${tabs.map(([id, name, icon]) => `
    <button class="tab" data-aktion="nav" data-ziel="${id}" ${id === aktiv ? 'aria-current="page"' : ''}>${icon}${name}</button>`).join('')}
  </nav>`;
}

const STIMMUNGEN = ['entschlossen', 'jubelnd', 'traurig', 'panisch', 'nachdenklich', 'stolz', 'erledigt', 'schlafend'];

function maskottchen(stimmung = 'entschlossen', id = '') {
  return `<img class="maskottchen" ${id ? `id="${id}"` : ''} src="assets/stimmung/${stimmung}.webp" alt="">`;
}

// Stimmung des Maskottchens während einer Frage
function frageStimmung(a, restMs) {
  if (a.ergebnis) return a.ergebnis.korrekt ? 'jubelnd' : 'traurig';
  if (restMs <= 5000) return 'panisch';
  if (['who_am_i', 'estimate', 'order'].includes(a.frage.type)) return 'nachdenklich';
  return 'entschlossen';
}

function ergebnisStimmung(e, aufgestiegen) {
  const rekord = e.neuerRekord && e.richtig >= 10;
  if (e.modus === 'survival') return rekord ? 'stolz' : 'erledigt';
  if (e.modus === 'blitz') return rekord ? 'stolz' : e.richtig >= 5 ? 'jubelnd' : 'erledigt';
  if (e.perfekt || aufgestiegen) return 'stolz';
  const quote = e.gesamt ? e.richtig / e.gesamt : 0;
  if (quote >= 0.7) return 'jubelnd';
  if (quote >= 0.4) return 'entschlossen';
  return 'traurig';
}

// ---------- Bildschirme ----------

function startScreen() {
  const rg = rang(profil.xp);
  const erledigt = profil.tagesquiz?.datum === heute();
  const streak = aktuelleStreak();
  return `<section class="screen mit-tabbar">
    <div class="rangzeile">
      <div class="rang">
        <div><span class="display">Rang: ${esc(rg.name)}</span><small>${rg.bis ? `${zahl(profil.xp)} / ${zahl(rg.bis)} XP` : `${zahl(profil.xp)} XP`}</small></div>
        <div class="balken"><span style="width:${prozent(rg.anteil)}"></span></div>
      </div>
      <button class="icon-knopf" data-aktion="nav" data-ziel="info" aria-label="Info">${ICON.regler}</button>
    </div>

    <div class="held karte">
      <div class="speedlines"></div>
      <div class="logo"><span class="senpai">SENPAI</span><span class="quiz">QUIZ</span></div>
      ${maskottchen()}
      <div class="sprechblase">${erledigt ? 'Gut gemacht!' : 'Bereit, Senpai?'}</div>
    </div>

    <div class="tageskarte karte">
      <div class="text">
        <span class="label">Tagesquiz</span>
        <span class="display">${erledigt ? `Heute: ${profil.tagesquiz.richtig} / ${profil.tagesquiz.gesamt} richtig` : '5 Fragen, für alle gleich'}</span>
        <span class="streak">${ICON.flamme} ${streak === 1 ? '1 Tag' : `${streak} Tage`} in Folge${erledigt ? ' · morgen geht’s weiter' : ''}</span>
      </div>
      ${erledigt
        ? `<img class="tages-schlaf" src="assets/stimmung/schlafend.webp" alt="Tagesquiz erledigt">`
        : `<button class="rund-knopf" data-aktion="tagesquiz" aria-label="Tagesquiz starten">${ICON.play}</button>`}
    </div>

    <button class="knopf knopf-rot" data-aktion="nav" data-ziel="kategorie">${ICON.play} Klassisch spielen</button>

    <div class="modi">
      <button class="knopf" data-aktion="modus" data-modus="survival">${ICON.herzRosa}<span><b>Survival</b><small>3 Leben${profil.highscore.survival ? ` · Rekord ${profil.highscore.survival}` : ''}</small></span></button>
      <button class="knopf" data-aktion="modus" data-modus="blitz">${ICON.blitz}<span><b>Blitz</b><small>60 Sekunden${profil.highscore.blitz ? ` · Rekord ${profil.highscore.blitz}` : ''}</small></span></button>
    </div>

    ${tabbar('start')}
  </section>`;
}

function kategorieScreen() {
  const { stufe, kategorie } = ui.wahl;
  const katName = kategorie === 'mix' ? 'Gemischt' : KATEGORIEN[kategorie];
  const stufeName = STUFEN_WAHL.find((s) => s.id === stufe).label;
  const kachel = (id, name, unter, bg, fg, breit = false) => `
    <button class="knopf kat ${breit ? 'breit' : ''}" style="background:${bg};color:${fg}" data-aktion="kategorie" data-kategorie="${id}" aria-pressed="${kategorie === id}">
      ${breit ? `<span style="display:flex;flex-direction:column;gap:2px"><b>${esc(name)}</b><small>${esc(unter)}</small></span>` : `<b>${esc(name)}</b><small>${esc(unter)}</small>`}
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

function frageKopf(r) {
  let fortschritt;
  if (r.modus === 'survival') {
    fortschritt = `<b>Frage ${r.index + 1}</b><div class="leben" aria-label="${r.leben} Leben übrig">${[0, 1, 2].map((i) => ICON.herz(i < r.leben)).join('')}</div>`;
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
    if (r.modus !== 'klassisch' && r.modus !== 'survival') return '';
    const fiftyMoeglich = ['multiple_choice', 'emoji', 'who_am_i'].includes(f.type);
    const joker = [
      ['fifty', '50:50', 'zwei weg', !fiftyMoeglich],
      ['zeit', '+10 s', 'mehr Zeit', false],
      ['skip', 'Weiter', 'überspringen', false],
    ];
    return `<span class="label">Joker</span>
      <div class="joker-leiste">${joker.map(([id, name, info, gesperrt]) => {
        const benutzt = r.joker[id];
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
  if (r.modus === 'survival' && !e.korrekt) text += r.leben > 0 ? ` · noch ${r.leben} ${r.leben === 1 ? 'Leben' : 'Leben'}` : ' · keine Leben mehr';
  const letzte = r.modus === 'survival' ? r.leben <= 0 || r.index >= r.fragen.length - 1 : r.index >= r.fragen.length - 1;
  const knopf = r.modus === 'blitz' ? '' : `<button class="knopf" data-aktion="weiter">${letzte ? 'Ergebnis' : 'Weiter'} ${ICON.weiter}</button>`;
  let melden = '';
  if (r.modus !== 'blitz') {
    melden = a.gemeldet
      ? '<span class="melde-dank">Danke! Wir prüfen das.</span>'
      : '<button class="melde-link" data-aktion="melden">Frage melden</button>';
  }
  return `<div class="karte banner ${e.korrekt ? 'gut' : 'schlecht'}" role="status">
    <div class="text"><span class="display">${titel}</span><small>${esc(text)}</small>${melden}</div>${knopf}
  </div>`;
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
      <span class="tag" style="background:${bg};color:${fg}">${esc(KATEGORIEN[f.category])} · ${esc(SCHWIERIGKEIT[f.difficulty])}</span>
      ${!a.ergebnis && naechsterFaktor > 1 ? `<span class="combo">Combo ×${naechsterFaktor}</span>` : ''}
    </div>
    <div class="frage-zeile">
      <div class="figur">${reaktion}${maskottchen(frageStimmung(a, restMs), 'figur-bild')}</div>
      <div class="karte blase">${frageText(f, a)}</div>
    </div>
    ${antwortenBlock(a)}
    <div class="unten">${unterBlock(r)}</div>
    ${meldeDialog()}
  </section>`;
}

function ergebnisScreen() {
  const e = ui.ergebnis;
  const titel = e.modus === 'survival' ? 'GAME OVER' : e.modus === 'blitz' ? 'ZEIT UM!' : e.perfekt ? 'PERFEKT!' : 'RUNDE GESCHAFFT!';
  const wertung = e.modus === 'survival' || e.modus === 'blitz' ? `${e.richtig} richtig` : `${e.richtig} / ${e.gesamt} richtig`;
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
      <div class="oben"><span class="display">+${zahl(e.xp)} XP</span><small>${nochText}</small></div>
      <div class="balken"><span style="width:${prozent(altAnteil)}"></span><span class="neu" id="xp-neu" data-ziel="${prozent(neuAnteil)}"></span></div>
      <div class="unter"><span>${esc(nachher.name)}</span><span>${esc(nachher.naechster || '')}</span></div>
    </div>

    ${aufgestiegen ? `<div class="erfolg"><span class="medaille">${ICON.medaille}</span><span><span class="label">Neuer Rang</span><b>${esc(nachher.name)}</b><small>Du bist aufgestiegen!</small></span></div>` : ''}
    ${e.neuerRekord ? `<div class="erfolg"><span class="medaille">${ICON.blitz}</span><span><span class="label">Neuer Rekord</span><b>${e.richtig} richtige Antworten</b><small>${e.modus === 'survival' ? 'Survival' : 'Blitz'}</small></span></div>` : ''}
    ${e.neueAbzeichen.map((ab) => `<div class="erfolg"><span class="medaille">${ICON.medaille}</span><span><span class="label">Neues Abzeichen</span><b>${esc(ab.name)}</b><small>${esc(ab.text)}</small></span></div>`).join('')}

    <div class="fusszeile">
      ${e.modus === 'tages' ? '' : `<button class="knopf knopf-rot" data-aktion="nochmal">${ICON.nochmal} Nochmal</button>`}
      <div class="zweier">
        ${zweiterKnopf}
        <button class="knopf" data-aktion="nav" data-ziel="start">Zum Start</button>
      </div>
    </div>
  </section>`;
}

function statistikScreen() {
  const quote = profil.beantwortet ? Math.round((profil.richtig / profil.beantwortet) * 100) : 0;
  const zeilen = Object.entries(KATEGORIEN).map(([id, name]) => {
    const k = profil.kategorien[id] || { richtig: 0, beantwortet: 0 };
    const anteil = k.beantwortet ? k.richtig / k.beantwortet : 0;
    return `<div class="statistik-zeile">
      <div><span>${esc(name)}</span><small>${k.beantwortet ? `${Math.round(anteil * 100)} % · ${k.richtig}/${k.beantwortet}` : 'noch nicht gespielt'}</small></div>
      <div class="balken"><span style="width:${prozent(anteil)};background:${FARBEN[id][0]}"></span></div>
    </div>`;
  }).join('');
  return `<section class="screen mit-tabbar">
    <div class="kopfzeile"><h1>Statistik</h1></div>
    <div class="kennzahlen">
      <div class="kennzahl"><b>${zahl(profil.spiele)}</b><small>Runden</small></div>
      <div class="kennzahl"><b>${quote} %</b><small>Trefferquote</small></div>
      <div class="kennzahl"><b>${aktuelleStreak()}</b><small>Tage in Folge</small></div>
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
    <button class="leise-knopf" data-aktion="zuruecksetzen">Fortschritt zurücksetzen</button>
    ${tabbar('statistik')}
  </section>`;
}

function abzeichenScreen() {
  const anzahl = profil.abzeichen.length;
  return `<section class="screen mit-tabbar">
    <div class="kopfzeile"><h1>Abzeichen</h1></div>
    <p style="margin:0;font-weight:700">${anzahl} von ${ABZEICHEN.length} freigeschaltet</p>
    <div class="abzeichen-gitter">
      ${ABZEICHEN.map((ab) => {
        const offen = profil.abzeichen.includes(ab.id);
        return `<div class="karte abzeichen ${offen ? '' : 'gesperrt'}">
          <span class="medaille">${offen ? ICON.medaille : ICON.schloss}</span>
          <b>${esc(ab.name)}</b><small>${esc(ab.text)}</small>
        </div>`;
      }).join('')}
    </div>
    ${tabbar('abzeichen')}
  </section>`;
}

function infoScreen() {
  return `<section class="screen">
    <div class="kopfzeile">
      <button class="icon-knopf" data-aktion="nav" data-ziel="start" aria-label="Zurück zum Start">${ICON.zurueck}</button>
      <h1>Über Senpai Quiz</h1>
    </div>
    <div class="karte info-text">
      <p><b>Senpai Quiz ist ein inoffizielles Fan-Quiz.</b> Es steht in keiner Verbindung zu den Rechteinhabern der genannten Serien, Filme und Manga. Alle Namen und Marken gehören ihren jeweiligen Eigentümern.</p>
      <p>Alle Fragen sind selbst geschrieben. Die App enthält keine Bilder, Musik oder Ausschnitte aus Anime oder Manga.</p>
      <p>Dein Fortschritt im Einzelspiel wird nur auf diesem Gerät gespeichert. Für Duelle gegen Freunde legst du einen Account an.</p>
      <p style="font-size:13px;font-weight:700">Prototyp · ${FRAGEN.length} Fragen</p>
    </div>
    ${kontoBereich()}
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
  return { sieg: 'stolz', niederlage: 'traurig', unentschieden: 'nachdenklich' }[s.ausgang];
}

async function duellRundeFertig(r) {
  stoppeTimer();
  const ergebnisse = [0, 1, 2].map((i) => r.verlauf[i] === true);
  const xp = Math.round(r.punkte / 10);
  profil.xp += xp;
  profil.spiele++;
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
    ui.online.einladung = code;
    zeigeEinladung();
  },
  async herausfordern(d) {
    ui.online.fehler = '';
    try {
      const id = await online.herausfordern(d.id);
      await oeffneDuell(id);
    } catch (fehler) {
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
    if (!confirm('Willst du dieses Duell wirklich aufgeben? Dein Gegner gewinnt dann.')) return;
    try {
      await online.aufgeben(ui.online.duellId);
    } catch (fehler) {
      ui.online.fehler = fehler.message;
    }
    ladeDuelle();
  },
  async einladen() {
    const p = ui.online.profil;
    const link = `${location.origin}${location.pathname}?einladung=${p.einladungscode}`;
    const text = `Fordere mich in Senpai Quiz zu einem Anime-Duell heraus! Mein Spielername: ${p.spielername}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Senpai Quiz', text, url: link });
        return;
      } catch (fehler) {
        if (fehler.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${link}`);
      ui.online.meldung = 'Einladungslink kopiert. Schick ihn per WhatsApp oder Nachricht.';
    } catch {
      ui.online.linkZeigen = true;
    }
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
    if (!confirm('Account wirklich löschen? Dein Spielername und alle deine Duelle werden endgültig gelöscht.')) return;
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

function hinweise() {
  const o = ui.online;
  return `${o.fehler ? `<p class="fehler" role="alert">${esc(o.fehler)}</p>` : ''}${o.meldung ? `<p class="meldung" role="status">${esc(o.meldung)}</p>` : ''}`;
}

function accountScreen() {
  const o = ui.online;
  return `<section class="screen mit-tabbar">
    <div class="kopfzeile"><h1>Duelle</h1></div>
    <div class="karte konto-karte">
      ${maskottchen(o.einladung ? 'jubelnd' : 'entschlossen')}
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
  const link = `${location.origin}${location.pathname}?einladung=${o.profil.einladungscode}`;

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
        <span class="runden-kat">${z.kategorie ? esc(KATEGORIEN[z.kategorie]) : `Runde ${z.nr}`}</span>
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
        <button class="knopf kat breit" style="background:${FARBEN[k][0]};color:${FARBEN[k][1]}" data-aktion="kategorieNehmen" data-kategorie="${k}">
          <span style="display:flex;flex-direction:column;gap:2px"><b>${esc(KATEGORIEN[k])}</b><small>${esc(UNTERTITEL[k])}</small></span>
        </button>`).join('')}
    </div>
  </section>`;
}

function einladungScreen() {
  const gegner = ui.online.einladungProfil;
  if (!gegner) return duelleScreen();
  return `<section class="screen">
    <div class="karte konto-karte">
      ${maskottchen('jubelnd')}
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
  kategorie: kategorieScreen,
  frage: frageScreen,
  ergebnis: ergebnisScreen,
  statistik: statistikScreen,
  abzeichen: abzeichenScreen,
  info: infoScreen,
  duelle: duelleScreen,
  suche: sucheScreen,
  duell: duellScreen,
  duellKategorie: duellKategorieScreen,
  einladung: einladungScreen,
};

let letzterScreen = null;

function render() {
  app.innerHTML = SCREENS[ui.screen]();
  if (ui.screen !== letzterScreen) {
    window.scrollTo(0, 0);
    letzterScreen = ui.screen;
  }
  steuerePolling();
}

// ---------- Start ----------

async function init() {
  try {
    const antwort = await fetch('data/fragen.json');
    const daten = await antwort.json();
    FRAGEN = daten.fragen;
    KATEGORIEN = daten.kategorien;
    SCHWIERIGKEIT = daten.schwierigkeiten;
    // Stimmungsbilder vorladen, damit beim Wechsel nichts flackert
    STIMMUNGEN.forEach((s) => { new Image().src = `assets/stimmung/${s}.webp`; });
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
