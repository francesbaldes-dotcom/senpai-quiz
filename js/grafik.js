// Grafiken der App als Inline-SVG: Kategorie-Icons, Abzeichen-Embleme, Rang-Embleme.
// Alle im Manga-Look der App: dicke schwarze Outline, flache Farben. Keine Markenzeichen,
// nur eigene Symbole (Strohhut, Kunai, Torii …).

const INK = '#141414';
const WHITE = '#FFFFFF';
const RED = '#D7261E';
const YELLOW = '#FFD23F';
const GREEN = '#177A41';
const BLUE = '#1F5FD1';
const PINK = '#FFB3CF';
const ORANGE = '#FF8A3D';
const PURPLE = '#6B3FA0';
const TEAL = '#1C8C8C';
const BROWN = '#8B5A2B';
const LIGHT = '#D9D4C7';

// Umschlag für alle Zeichnungen: 48er-Raster, Outline 3 Pixel, runde Ecken
function svg(inhalt, groesse, klasse, titel = '') {
  return `<svg class="${klasse}" width="${groesse}" height="${groesse}" viewBox="0 0 48 48" aria-hidden="${titel ? 'false' : 'true'}" ${titel ? `role="img" aria-label="${titel}"` : ''}>${titel ? `<title>${titel}</title>` : ''}<g fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${inhalt}</g></svg>`;
}

// ---------- Kategorie-Icons ----------

const KATEGORIE_ICONS = {
  // Strohhut mit rotem Band
  onepiece: `
    <ellipse cx="24" cy="32" rx="20" ry="7" fill="${YELLOW}"/>
    <path d="M11 31c0-10 5-17 13-17s13 7 13 17" fill="${YELLOW}"/>
    <path d="M11.5 27.5c3 2.5 22 2.5 25 0v4.5c-3 2-22 2-25 0z" fill="${RED}"/>
    <path d="M11 31c3 2 23 2 26 0" />`,
  // Energiekugel mit Strahlen
  dragonball: `
    <circle cx="24" cy="25" r="11" fill="${BLUE}"/>
    <circle cx="20" cy="21" r="3.5" fill="${WHITE}" stroke="none"/>
    <path d="M24 5v5M24 40v5M4 25h5M39 25h5M9.9 10.9l3.5 3.5M34.6 35.6l3.5 3.5M9.9 39.1l3.5-3.5M34.6 14.4l3.5-3.5"/>`,
  // Kunai
  naruto: `
    <path d="M24 3l9 19-9 7-9-7z" fill="${LIGHT}"/>
    <path d="M24 3v25" stroke-width="2"/>
    <path d="M21 28h6v9h-6z" fill="${BROWN}"/>
    <circle cx="24" cy="41" r="4" fill="${WHITE}"/>`,
  // Katana
  shonen: `
    <path d="M8 40L34 14l6-2-2 6L12 44z" fill="${LIGHT}"/>
    <path d="M12 44L8 40"/>
    <path d="M7 26l15 15" stroke-width="5"/>
    <path d="M7 26l15 15" stroke="${YELLOW}" stroke-width="2"/>
    <path d="M4 30l9 9" stroke-width="5"/>
    <path d="M4 30l9 9" stroke="${BROWN}" stroke-width="2"/>`,
  // Funkeln
  neu: `
    <path d="M22 8c2 11 4 13 15 16-11 3-13 5-15 16-2-11-4-13-15-16 11-3 13-5 15-16z" fill="${YELLOW}"/>
    <path d="M38 4c.8 4 1.5 4.7 5 6-3.5 1.3-4.2 2-5 6-.8-4-1.5-4.7-5-6 3.5-1.3 4.2-2 5-6z" fill="${WHITE}"/>`,
  // Portal in eine andere Welt
  isekai: `
    <ellipse cx="24" cy="24" rx="14" ry="19" fill="${WHITE}"/>
    <ellipse cx="24" cy="24" rx="7.5" ry="12" fill="#B388F0"/>
    <path d="M26 14c-5 5-5 15 0 20" stroke="${WHITE}" stroke-width="2.5"/>`,
  // Röhrenfernseher
  klassiker: `
    <path d="M17 14l-7-9M31 14l7-9"/>
    <rect x="6" y="14" width="36" height="26" rx="4" fill="${WHITE}"/>
    <rect x="10" y="19" width="21" height="16" rx="2" fill="${BLUE}"/>
    <path d="M14 22h4" stroke="${WHITE}" stroke-width="2.5"/>
    <circle cx="36.5" cy="23" r="2" fill="${INK}" stroke="none"/>
    <circle cx="36.5" cy="31" r="2" fill="${INK}" stroke="none"/>
    <path d="M14 40v4M34 40v4"/>`,
  // Herz mit Funkeln
  shojo: `
    <g transform="translate(1 6) scale(.86)">
      <path d="M24 41S6 30 6 17a8 8 0 0 1 14-5 8 8 0 0 1 4 4 8 8 0 0 1 4-4 8 8 0 0 1 14 5c0 13-18 24-18 24z" fill="${RED}"/>
      <path d="M14 15c0-2 1-4 3-5" stroke="${WHITE}" stroke-width="2.5"/>
    </g>
    <path d="M40 3c.6 3 1.2 3.6 4 4.5-2.8.9-3.4 1.5-4 4.5-.6-3-1.2-3.6-4-4.5 2.8-.9 3.4-1.5 4-4.5z" fill="${WHITE}"/>`,
  // Filmklappe
  filme: `
    <path d="M6 20h36v20a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill="${WHITE}"/>
    <path d="M6 20V11a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v9z" fill="${INK}"/>
    <path d="M13 9l-5 10M23 9l-5 10M33 9l-5 10M42 11l-4 8" stroke="${WHITE}" stroke-width="2.5"/>
    <path d="M12 32h12" />`,
  // Torii
  kultur: `
    <path d="M4 12c7-3.5 33-3.5 40 0v5c-7-2.5-33-2.5-40 0z" fill="${RED}"/>
    <rect x="11" y="16" width="5" height="28" fill="${RED}"/>
    <rect x="32" y="16" width="5" height="28" fill="${RED}"/>
    <rect x="8" y="22" width="32" height="5" fill="${RED}"/>`,
  // Würfel für „Gemischt“
  mix: `
    <rect x="7" y="7" width="34" height="34" rx="7" fill="${WHITE}"/>
    <circle cx="16" cy="16" r="3" fill="${INK}" stroke="none"/>
    <circle cx="32" cy="16" r="3" fill="${INK}" stroke="none"/>
    <circle cx="24" cy="24" r="3" fill="${RED}" stroke="none"/>
    <circle cx="16" cy="32" r="3" fill="${INK}" stroke="none"/>
    <circle cx="32" cy="32" r="3" fill="${INK}" stroke="none"/>`,
};

export function kategorieIcon(id, groesse = 32) {
  const inhalt = KATEGORIE_ICONS[id] ?? KATEGORIE_ICONS.kultur;
  return svg(inhalt, groesse, 'kat-icon');
}

// ---------- Abzeichen-Embleme ----------

// Jedes Emblem: Grundfarbe der Scheibe und das Symbol darauf
const ABZEICHEN_EMBLEME = {
  // Fahne: erste Runde
  erste: [YELLOW, `
    <path d="M16 10h20l-5 7 5 7H16z" fill="${RED}"/>
    <path d="M16 8v32"/>`],
  // Stern: alles richtig
  perfekt: [RED, `
    <path d="M24 7l4.8 10.4 11.2 1.2-8.4 7.6 2.4 11.2L24 31.6l-10 5.8 2.4-11.2-8.4-7.6 11.2-1.2z" fill="${YELLOW}"/>`],
  // Kettenglieder: Combo
  kette: [BLUE, `
    <rect x="3" y="14" width="24" height="20" rx="10" fill="${WHITE}"/>
    <rect x="21" y="14" width="24" height="20" rx="10" fill="${WHITE}"/>
    <path d="M21.5 15.1A10 10 0 0 1 27 24"/>`],
  // Blitz: schnelle Antworten
  blitzmerker: [INK, `
    <path d="M27 6L12 27h10l-2 15 15-21H25z" fill="${YELLOW}"/>`],
  // Runde Brille: Otaku
  otaku: [GREEN, `
    <circle cx="14" cy="27" r="8" fill="${WHITE}"/>
    <circle cx="34" cy="27" r="8" fill="${WHITE}"/>
    <path d="M22 26h4M6 25l-3-6M42 25l3-6"/>`],
  // Herz mit Pflaster: Survival
  ueberleben: [PINK, `
    <path d="M24 41S6 30 6 17a8 8 0 0 1 14-5 8 8 0 0 1 4 4 8 8 0 0 1 4-4 8 8 0 0 1 14 5c0 13-18 24-18 24z" fill="${RED}"/>
    <path d="M17 29l12-12M24 17l5 5M19 22l5 5" stroke="${WHITE}" stroke-width="3.5"/>`],
  // Stoppuhr: Blitz-Modus
  schnellfeuer: [ORANGE, `
    <circle cx="24" cy="27" r="13" fill="${WHITE}"/>
    <path d="M24 19v8l5 3M20 6h8M24 6v6M36 13l3-3"/>`],
  // Flamme: Serie
  treue: [RED, `
    <path d="M24 6c2 8 10 11 10 21a10 10 0 0 1-20 0c0-5 3-8 5-10 .6 4 2.6 6 5 6-2-6-1-12 0-17z" fill="${YELLOW}"/>`],
  // Vier Felder: alle Kategorien
  allrounder: [PURPLE, `
    <rect x="9" y="9" width="13" height="13" rx="3" fill="${RED}"/>
    <rect x="26" y="9" width="13" height="13" rx="3" fill="${YELLOW}"/>
    <rect x="9" y="26" width="13" height="13" rx="3" fill="${BLUE}"/>
    <rect x="26" y="26" width="13" height="13" rx="3" fill="${GREEN}"/>`],
  // Papierflieger: geteilt
  teilgeist: [TEAL, `
    <path d="M6 22L42 9l-8 32-10-12z" fill="${WHITE}"/>
    <path d="M24 29l18-20M24 29l-5 10"/>`],

  // ---- Heldenreise (Story-Modus) ----
  // Wegweiser: Kapitel 1 geschafft
  aufbruch: [GREEN, `
    <path d="M20 10v34M14 44h12"/>
    <path d="M12 12h24l6 7-6 7H12z" fill="${WHITE}"/>
    <path d="M12 30h20l5 6-5 6H12z" fill="${YELLOW}"/>`],
  // Schild: erster Boss besiegt
  schwellenhueter: [BLUE, `
    <path d="M24 5l16 5v13c0 10-7 17-16 21-9-4-16-11-16-21V10z" fill="${WHITE}"/>
    <path d="M24 13v22M15 22h18" stroke-width="4"/>`],
  // Haus mit offener Tür: Reise beendet
  heimkehr: [RED, `
    <path d="M6 24L24 7l18 17v18H6z" fill="${WHITE}"/>
    <path d="M19 42V29h10v13" fill="${YELLOW}"/>
    <path d="M34 7h5v9"/>`],
  // Sterne im Netz: alle 150 Sterne
  sternenfaenger: [PURPLE, `
    <path d="M6 42c6-14 18-14 24 0" stroke-width="3"/>
    <path d="M12 36c4-8 10-8 14 0M9 39c5-4 11-4 16 0" stroke-width="2"/>
    <path d="M30 4l2.7 6 6.3.7-4.7 4.3 1.3 6.4L30 18l-5.6 3.4 1.3-6.4L21 10.7l6.3-.7z" fill="${YELLOW}"/>
    <path d="M40 22l1.5 3.3 3.5.4-2.6 2.4.7 3.5-3.1-1.9-3.1 1.9.7-3.5-2.6-2.4 3.5-.4z" fill="${WHITE}"/>
    <path d="M16 26l1.5 3.3 3.5.4-2.6 2.4.7 3.5-3.1-1.9-3.1 1.9.7-3.5-2.6-2.4 3.5-.4z" fill="${WHITE}"/>`],
  // Kompass: alle fünf Geheimpfade gefunden
  pfadfinder: [TEAL, `
    <circle cx="24" cy="24" r="20" fill="${WHITE}"/>
    <path d="M24 4l7 20-7 20-7-20z" fill="${LIGHT}"/>
    <path d="M24 4l7 20H17z" fill="${RED}"/>
    <circle cx="24" cy="24" r="3.5" fill="${INK}" stroke="none"/>
    <path d="M4 24h6M38 24h6"/>`],
  // Zwei Sterne: die Zweite Reise beendet
  zweitereise: [INK, `
    <path d="M20 4l4.8 10.4 11.2 1.2-8.4 7.6 2.4 11.2L20 29.6l-10 5.8 2.4-11.2-8.4-7.6 11.2-1.2z" fill="${YELLOW}"/>
    <path d="M35 24l3 6.5 7 .8-5.2 4.8 1.5 7-6.3-3.6-6.3 3.6 1.5-7-5.2-4.8 7-.8z" fill="${WHITE}"/>`],
  // ---------- Senpai Dojo ----------
  // あ: alle Hiragana-Lektionen
  hiragana: [RED, `
    <text x="24" y="35" text-anchor="middle" font-family="'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif" font-size="30" font-weight="700" fill="${WHITE}" stroke="none">あ</text>`],
  // ア: alle Katakana-Lektionen
  katakana: [BLUE, `
    <text x="24" y="35" text-anchor="middle" font-family="'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif" font-size="30" font-weight="700" fill="${WHITE}" stroke="none">ア</text>`],
  // Aufgeschlagenes Buch: 100 Vokabeln sitzen
  wortschatz: [GREEN, `
    <path d="M24 13c-5-4-11-4-17-2v26c6-2 12-2 17 2z" fill="${WHITE}"/>
    <path d="M24 13c5-4 11-4 17-2v26c-6-2-12-2-17 2z" fill="${WHITE}"/>
    <path d="M24 13v26M12 19c3-1 6-1 8 0M12 26c3-1 6-1 8 0M28 19c3-1 6-1 8 0M28 26c3-1 6-1 8 0"/>`],
  // Geknoteter Gürtel: erste Gürtelprüfung
  guertel: [PURPLE, `
    <path d="M3 19h42v10H3z" fill="${YELLOW}"/>
    <path d="M22 29l-6 13M26 29l6 13" stroke-width="8"/>
    <path d="M22 29l-6 13M26 29l6 13" stroke="${YELLOW}" stroke-width="4"/>
    <circle cx="24" cy="24" r="6" fill="${YELLOW}"/>`],
  // Perlenkette: Wortkette ohne Fehler
  shiritori: [ORANGE, `
    <path d="M8 36C8 20 40 28 40 12" fill="none"/>
    <circle cx="8" cy="36" r="5" fill="${WHITE}"/>
    <circle cx="17" cy="27" r="5" fill="${YELLOW}"/>
    <circle cx="27" cy="23" r="5" fill="${WHITE}"/>
    <circle cx="36" cy="18" r="5" fill="${YELLOW}"/>
    <circle cx="40" cy="9" r="4" fill="${WHITE}"/>`],
  // Kalender mit Haken: sieben Lerntage
  fleiss: [TEAL, `
    <rect x="7" y="11" width="34" height="30" rx="4" fill="${WHITE}"/>
    <path d="M7 19h34M15 7v8M33 7v8"/>
    <path d="M16 30l6 6 11-12" stroke-width="4"/>`],
};

export function abzeichenEmblem(id, groesse = 46) {
  const [farbe, symbol] = ABZEICHEN_EMBLEME[id] ?? [YELLOW, ''];
  return svg(`<circle cx="24" cy="24" r="22" fill="${farbe}"/><g transform="translate(6.5 6.5) scale(.73)">${symbol}</g>`, groesse, 'emblem');
}

// ---------- Rang-Embleme ----------

const RANG_EMBLEME = {
  // Keimling
  'Neuling': [WHITE, `
    <path d="M24 42V24"/>
    <path d="M24 30c-1-8-6-12-14-12 0 8 5 13 14 12z" fill="${GREEN}"/>
    <path d="M24 24c1-8 6-12 14-12 0 8-5 13-14 12z" fill="${GREEN}"/>`],
  // Ein Stern
  'Kōhai': [BLUE, `
    <path d="M24 7l4.8 10.4 11.2 1.2-8.4 7.6 2.4 11.2L24 31.6l-10 5.8 2.4-11.2-8.4-7.6 11.2-1.2z" fill="${WHITE}"/>`],
  // Stirnband mit Knoten, wie beim Maskottchen
  'Senpai': [RED, `
    <path d="M3 21c7-5 27-5 34 0v7c-7-5-27-5-34 0z" fill="${WHITE}"/>
    <path d="M38 21l8-9M38 28l8 9" stroke-width="9"/>
    <path d="M38 21l8-9M38 28l8 9" stroke="${WHITE}" stroke-width="3.5"/>
    <circle cx="37" cy="24.5" r="5" fill="${WHITE}"/>`],
  // Schriftrolle
  'Sensei': [PURPLE, `
    <rect x="9" y="14" width="30" height="20" fill="${WHITE}"/>
    <rect x="3" y="11" width="9" height="26" rx="4.5" fill="${LIGHT}"/>
    <rect x="36" y="11" width="9" height="26" rx="4.5" fill="${LIGHT}"/>
    <path d="M17 20h14M17 27h10"/>`],
  // Krone
  'Legende': [YELLOW, `
    <path d="M8 36V14l9 8 7-12 7 12 9-8v22z" fill="${RED}"/>
    <path d="M8 36h32"/>
    <circle cx="24" cy="29" r="2.5" fill="${YELLOW}" stroke="none"/>`],
};

export function rangEmblem(name, groesse = 40) {
  const [farbe, symbol] = RANG_EMBLEME[name] ?? RANG_EMBLEME.Neuling;
  return svg(`<circle cx="24" cy="24" r="22" fill="${farbe}"/><g transform="translate(6.5 6.5) scale(.73)">${symbol}</g>`, groesse, 'emblem', `Rang ${name}`);
}

export const KATEGORIE_ICON_IDS = Object.keys(KATEGORIE_ICONS);
export const ABZEICHEN_EMBLEM_IDS = Object.keys(ABZEICHEN_EMBLEME);
export const RANG_EMBLEM_NAMEN = Object.keys(RANG_EMBLEME);

// ---------- Bausteine für die Heldenreise-Karte ----------

const STERN = 'M0-7l2.1 4.5 4.9.5-3.7 3.3 1 4.9L0 3.8l-4.3 2.4 1-4.9-3.7-3.3 4.9-.5z';

// Stationsknoten 64×80: bis zu drei Sterne oben, darunter der Kreis.
// zustand: 'offen' (spielbar bzw. bestanden), 'gesperrt', 'aktuell' (nächste Station)
// max: wie viele Sterne es an dieser Station überhaupt gibt (2 in der Zweiten Reise), mittig gesetzt
export function stationsKnoten(sterne = 0, zustand = 'offen', breite = 64, max = 3) {
  const gesperrt = zustand === 'gesperrt';
  const aktuell = zustand === 'aktuell';
  const anzahl = Math.max(1, Math.min(3, max));
  const positionen = anzahl === 3 ? [14, 32, 50] : anzahl === 2 ? [23, 41] : [32];
  const sterneSvg = positionen.map((x, i) => `<path d="${STERN}" transform="translate(${x} 13) scale(1.15)" fill="${i < sterne ? YELLOW : gesperrt ? LIGHT : WHITE}" ${i < sterne ? '' : `stroke="${gesperrt ? '#B9B3A3' : INK}"`} stroke-width="2.4"/>`).join('');
  let innen = '';
  if (gesperrt) innen = `<rect x="23" y="49" width="18" height="13" rx="3" fill="${WHITE}" stroke-width="2.6"/><path d="M27 49v-4a5 5 0 0 1 10 0v4" stroke-width="2.6"/>`;
  else if (aktuell) innen = `<path d="M26 42v22l16-11z" fill="${YELLOW}" stroke="${INK}"/>`;
  else if (sterne > 0) innen = `<path d="M21 53l8 8 14-16" stroke="${INK}" stroke-width="4.5"/>`;
  const fuellung = gesperrt ? '#EDE8DC' : aktuell ? RED : WHITE;
  const rand = gesperrt ? '#B9B3A3' : INK;
  return `<svg class="stations-knoten ${zustand}" width="${breite}" height="${Math.round(breite * 80 / 64)}" viewBox="0 0 64 80" aria-hidden="true"><g fill="none" stroke="${rand}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    ${aktuell ? `<circle cx="32" cy="53" r="26" fill="${YELLOW}" stroke="none"/>` : ''}
    <circle cx="32" cy="53" r="${aktuell ? 21 : 23}" fill="${fuellung}"/>
    ${sterneSvg}${innen}
  </g></svg>`;
}

// Bossknoten 80×80: roter Kasten mit Schattengesicht.
// zustand: 'aktuell' (wartet), 'gesperrt', 'offen' (besiegt)
export function bossKnoten(zustand = 'aktuell', breite = 80) {
  const gesperrt = zustand === 'gesperrt';
  const besiegt = zustand === 'offen';
  const fuellung = gesperrt ? '#EDE8DC' : besiegt ? WHITE : RED;
  const rand = gesperrt ? '#B9B3A3' : INK;
  let gesicht;
  if (gesperrt) gesicht = `<rect x="29" y="40" width="22" height="16" rx="3" fill="${WHITE}"/><path d="M34 40v-5a6 6 0 0 1 12 0v5"/>`;
  else if (besiegt) gesicht = `<path d="M24 28l10 10M34 28L24 38M46 28l10 10M56 28L46 38" stroke-width="4"/><path d="M30 54c6-4 14-4 20 0" stroke-width="4"/>`;
  else gesicht = `<path d="M18 24l18 10-18 6zM62 24L44 34l18 6z" fill="${INK}" stroke="none"/><path d="M26 50c8 10 20 10 28 0z" fill="${INK}" stroke="none"/><path d="M26 50c8 10 20 10 28 0" stroke="${INK}"/><path d="M33 52v4M40 54v5M47 52v4" stroke="${WHITE}" stroke-width="2.5"/>`;
  return `<svg class="boss-knoten ${zustand}" width="${breite}" height="${breite}" viewBox="0 0 80 80" aria-hidden="true"><g fill="none" stroke="${rand}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    ${!gesperrt && !besiegt ? `<path d="M40 2v8M78 40h-8M40 78v-8M2 40h8M13 13l6 6M67 13l-6 6M67 67l-6-6M13 67l6-6" stroke="${INK}"/>` : ''}
    <rect x="12" y="12" width="56" height="56" rx="12" fill="${fuellung}"/>
    ${gesicht}
  </g></svg>`;
}
