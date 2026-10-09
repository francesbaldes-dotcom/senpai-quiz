// Senpai Quiz – Prototyp. Reines JavaScript ohne Build-Schritt.

import { belohnungsvideo, werbungOffen } from './werbung.js';

const app = document.getElementById('app');

// ---------- Konstanten ----------

const FRAGEZEIT = 15;
const BLITZZEIT = 60;
const RUNDENLAENGE = 10;
const SPEICHER = 'senpai-quiz-v1';

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
  video: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/></svg>',
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
const vorgestern = () => datumText(new Date(Date.now() - 2 * 86400000));

// Serie genau einen Tag verpasst: per Video rettbar
function streakRettbar() {
  const { tage, letzter } = profil.streak;
  return tage >= 2 && letzter === vorgestern() && profil.tagesquiz?.datum !== heute();
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
  if (r.modus === 'survival' && r.leben <= 0) return beendeRunde();
  if (r.modus === 'blitz' && Date.now() >= r.blitzEnde) return beendeRunde();
  r.index++;
  if (r.index >= r.fragen.length) return beendeRunde();
  starteFrage();
  render();
}

function beendeRunde() {
  stoppeTimer();
  const r = ui.runde;
  if (!r) return;
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

// ---------- Aktionen ----------

const aktionen = {
  nav(d) {
    ui.screen = d.ziel;
    render();
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
  abbrechen() {
    if (!confirm('Runde wirklich beenden? Der Fortschritt dieser Runde geht verloren.')) return;
    stoppeTimer();
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
    if (!r || r.zweiteChance || r.leben > 0) return;
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

app.addEventListener('input', (e) => {
  if (e.target.id !== 'schaetzregler') return;
  const a = ui.runde?.aktuell;
  if (!a) return;
  a.schaetz = Number(e.target.value);
  document.getElementById('schaetzwert').textContent = a.schaetz;
});

document.addEventListener('keydown', (e) => {
  if (ui.screen !== 'frage' || !ui.runde || werbungOffen()) return;
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
        ${streakRettbar()
          ? `<span class="streak">${ICON.flamme} Deine Serie von ${profil.streak.tage} Tagen ist gerissen!</span>
             <button class="knopf knopf-video knopf-klein" data-aktion="streakRetten" aria-label="Video ansehen und Serie retten">${ICON.video} Serie retten</button>`
          : `<span class="streak">${ICON.flamme} ${streak === 1 ? '1 Tag' : `${streak} Tage`} in Folge${erledigt ? ' · morgen geht’s weiter' : ''}</span>`}
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
    const titel = r.modus === 'tages' ? 'Tagesquiz' : 'Frage';
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
      ['fifty', '50:50', 'zwei weg', !fiftyMoeglich || a.entfernt.length > 0],
      ['zeit', '+10 s', 'mehr Zeit', false],
      ['skip', 'Weiter', 'überspringen', false],
    ];
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
  if (r.modus === 'survival' && !e.korrekt) text += r.leben > 0 ? ` · noch ${r.leben} ${r.leben === 1 ? 'Leben' : 'Leben'}` : ' · keine Leben mehr';
  const letzte = r.modus === 'survival' ? r.leben <= 0 || r.index >= r.fragen.length - 1 : r.index >= r.fragen.length - 1;
  const knopf = r.modus === 'blitz' ? '' : `<button class="knopf" data-aktion="weiter">${letzte ? 'Ergebnis' : 'Weiter'} ${ICON.weiter}</button>`;
  const zweiteChance = r.modus === 'survival' && r.leben <= 0 && !r.zweiteChance;
  return `<div class="karte banner ${e.korrekt ? 'gut' : 'schlecht'}" role="status">
    <div class="text"><span class="display">${titel}</span><small>${esc(text)}</small></div>${knopf}
  </div>
  ${zweiteChance ? `<button class="knopf knopf-video" data-aktion="zweiteChance">${ICON.video} Video ansehen: mit 1 Leben weiterspielen</button>` : ''}`;
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
      <div class="oben"><span class="display">+${zahl(e.xp)} XP${e.verdoppelt ? ' ×2' : ''}</span><small>${nochText}</small></div>
      <div class="balken"><span style="width:${prozent(altAnteil)}"></span><span class="neu" id="xp-neu" data-ziel="${prozent(neuAnteil)}"></span></div>
      <div class="unter"><span>${esc(nachher.name)}</span><span>${esc(nachher.naechster || '')}</span></div>
    </div>

    ${aufgestiegen ? `<div class="erfolg"><span class="medaille">${ICON.medaille}</span><span><span class="label">Neuer Rang</span><b>${esc(nachher.name)}</b><small>Du bist aufgestiegen!</small></span></div>` : ''}
    ${e.neuerRekord ? `<div class="erfolg"><span class="medaille">${ICON.blitz}</span><span><span class="label">Neuer Rekord</span><b>${e.richtig} richtige Antworten</b><small>${e.modus === 'survival' ? 'Survival' : 'Blitz'}</small></span></div>` : ''}
    ${e.neueAbzeichen.map((ab) => `<div class="erfolg"><span class="medaille">${ICON.medaille}</span><span><span class="label">Neues Abzeichen</span><b>${esc(ab.name)}</b><small>${esc(ab.text)}</small></span></div>`).join('')}

    <div class="fusszeile">
      ${!e.verdoppelt && e.xp > 0 ? `<button class="knopf knopf-video" data-aktion="xpVerdoppeln">${ICON.video} Video ansehen: XP verdoppeln</button>` : ''}
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
      <p>Dein Fortschritt wird nur auf diesem Gerät gespeichert.</p>
      <p style="font-size:13px;font-weight:700">Prototyp · ${FRAGEN.length} Fragen</p>
    </div>
  </section>`;
}

const SCREENS = {
  start: startScreen,
  kategorie: kategorieScreen,
  frage: frageScreen,
  ergebnis: ergebnisScreen,
  statistik: statistikScreen,
  abzeichen: abzeichenScreen,
  info: infoScreen,
};

let letzterScreen = null;

function render() {
  app.innerHTML = SCREENS[ui.screen]();
  if (ui.screen !== letzterScreen) {
    window.scrollTo(0, 0);
    letzterScreen = ui.screen;
  }
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
    render();
  } catch (fehler) {
    app.innerHTML = '<p class="laden">Die Fragen konnten nicht geladen werden.</p>';
    console.error(fehler);
  }
}

init();
