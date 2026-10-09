// Teilen-Bilder: PNG-Karten im Manga-Look der App (1080 × 1350, Hochformat 4:5,
// passt in WhatsApp, Instagram-Feed und als Story). Gezeichnet per Canvas mit den
// App-Schriften, dem Maskottchen aus assets/stimmung und den Bossen aus assets/reise.
//   tagesquizBild(): Ergebnis des Tagesquiz
//   bossBild(): Boss-Sieg in der Heldenreise

const INK = '#141414';
const PAPER = '#FBF8F1';
const WHITE = '#FFFFFF';
const RED = '#D7261E';
const YELLOW = '#FFD23F';
const GREEN = '#177A41';

const W = 1080;
const H = 1350;
// Große Karte
const KX = 60, KY = 60, KB = W - 120, KH = H - 120;

const DISPLAY = '"Dela Gothic One", "Hiragino Kaku Gothic StdN", sans-serif';
const BODY = 'Rubik, system-ui, sans-serif';

// ---------- Bausteine ----------

function rund(ctx, x, y, b, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, b, h, r);
}

// Kasten im App-Stil: Fläche, dicker Rand, harter Schatten
function kasten(ctx, x, y, b, h, r, farbe, schatten = 12, rand = 7) {
  if (schatten) {
    ctx.fillStyle = INK;
    rund(ctx, x + schatten, y + schatten, b, h, r);
    ctx.fill();
  }
  ctx.fillStyle = farbe;
  rund(ctx, x, y, b, h, r);
  ctx.fill();
  ctx.lineWidth = rand;
  ctx.strokeStyle = INK;
  ctx.stroke();
}

// Speedlines wie auf dem Ergebnis-Bildschirm: Strahlen aus einem Punkt, zur Mitte hin ausgeblendet
function speedlines(ctx, cx, cy, innen, aussen, staerke = 0.38) {
  ctx.save();
  const verlauf = ctx.createRadialGradient(cx, cy, innen, cx, cy, aussen);
  verlauf.addColorStop(0, 'rgba(20,20,20,0)');
  verlauf.addColorStop(1, `rgba(20,20,20,${staerke})`);
  ctx.fillStyle = verlauf;
  const n = 46;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const breite = 0.011;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a - breite) * aussen * 1.5, cy + Math.sin(a - breite) * aussen * 1.5);
    ctx.lineTo(cx + Math.cos(a + breite) * aussen * 1.5, cy + Math.sin(a + breite) * aussen * 1.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function bildLaden(src) {
  return new Promise((loese) => {
    const bild = new Image();
    bild.onload = () => loese(bild);
    bild.onerror = () => loese(null);
    bild.src = src;
  });
}

async function schriftenLaden() {
  try {
    await Promise.all([
      document.fonts.load(`400 120px ${DISPLAY}`),
      document.fonts.load(`900 40px ${BODY}`),
      document.fonts.load(`700 32px ${BODY}`),
    ]);
  } catch { /* Schriften fehlen: Fallback-Schrift */ }
}

function kannZeichnen() {
  return typeof document !== 'undefined' && 'roundRect' in CanvasRenderingContext2D.prototype;
}

// Leinwand mit Papier, Rasterpunkten und der großen Karte samt Speedlines
function leinwandMitKarte(speedMitte, speedInnen, speedAussen) {
  const leinwand = document.createElement('canvas');
  leinwand.width = W;
  leinwand.height = H;
  const ctx = leinwand.getContext('2d');
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(20,20,20,.10)';
  for (let y = 10; y < H; y += 22) {
    for (let x = 10; x < W; x += 22) {
      ctx.beginPath();
      ctx.arc(x, y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  kasten(ctx, KX, KY, KB, KH, 44, WHITE, 16, 8);
  ctx.save();
  rund(ctx, KX, KY, KB, KH, 44);
  ctx.clip();
  speedlines(ctx, W / 2, speedMitte, speedInnen, speedAussen);
  ctx.restore();
  return { leinwand, ctx };
}

// Logo: SENPAI auf weißem Grund, QUIZ als roter, leicht gedrehter Kasten
function logo(ctx, oben = 150, groesse = 1) {
  ctx.save();
  ctx.translate(W / 2, oben);
  ctx.scale(groesse, groesse);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = `400 128px ${DISPLAY}`;
  const senpaiBreite = ctx.measureText('SENPAI').width;
  ctx.fillStyle = WHITE;
  ctx.fillRect(-senpaiBreite / 2 - 18, 0, senpaiBreite + 36, 136);
  ctx.fillStyle = INK;
  ctx.fillText('SENPAI', -senpaiBreite / 2, 112);

  ctx.font = `400 104px ${DISPLAY}`;
  const quizBreite = ctx.measureText('QUIZ').width;
  ctx.translate(0, 202);
  ctx.rotate(-4 * Math.PI / 180);
  kasten(ctx, -quizBreite / 2 - 30, -62, quizBreite + 60, 124, 10, RED, 0, 7);
  ctx.fillStyle = WHITE;
  ctx.fillText('QUIZ', -quizBreite / 2, 40);
  ctx.restore();
}

// Gelbe Pille mit Text, mittig
function pille(ctx, text, y, farbe = YELLOW, maxBreite = KB - 60) {
  ctx.font = `900 38px ${BODY}`;
  let breite = ctx.measureText(text).width + 72;
  if (breite > maxBreite) {
    ctx.font = `900 30px ${BODY}`;
    breite = Math.min(maxBreite, ctx.measureText(text).width + 60);
  }
  kasten(ctx, (W - breite) / 2, y, breite, 78, 39, farbe, 8, 6);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;
  ctx.fillText(text, W / 2, y + 52);
}

// Fußleiste mit Link am unteren Kartenrand
function fussleiste(ctx, link) {
  ctx.save();
  rund(ctx, KX, KY, KB, KH, 44);
  ctx.clip();
  ctx.fillStyle = INK;
  ctx.fillRect(KX, KY + KH - 112, KB, 112);
  ctx.restore();
  ctx.font = `700 34px ${BODY}`;
  ctx.fillStyle = WHITE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`Spiel mit: ${link}`, W / 2, KY + KH - 46);
}

// Flamme wie im App-Icon, Ursprung oben links der 24er-Box
function flamme(ctx, x, y, skala) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(skala, skala);
  ctx.beginPath();
  ctx.moveTo(12, 3);
  ctx.bezierCurveTo(13, 7, 17, 8.5, 17, 13);
  ctx.arc(12, 13, 5, 0, Math.PI, false);
  ctx.bezierCurveTo(7, 10.5, 8.5, 9, 9.5, 8);
  ctx.bezierCurveTo(9.8, 10, 10.8, 11, 12, 11);
  ctx.bezierCurveTo(11, 8, 11.5, 5, 12, 3);
  ctx.closePath();
  ctx.fillStyle = RED;
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.restore();
}

// Fünfzackiger Stern, Mittelpunkt (x, y)
function stern(ctx, x, y, r, farbe) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.46 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = farbe;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  ctx.stroke();
}

async function alsDatei(leinwand, name) {
  const blob = await new Promise((loese) => leinwand.toBlob(loese, 'image/png'));
  return blob ? new File([blob], name, { type: 'image/png' }) : null;
}

function stimmungFuer(richtig, gesamt) {
  if (richtig === gesamt) return 'stolz';
  if (richtig / gesamt >= 0.6) return 'jubelnd';
  if (richtig / gesamt >= 0.4) return 'entschlossen';
  return 'erledigt';
}

// ---------- Tagesquiz ----------

/**
 * Zeichnet die Tagesquiz-Karte.
 * @param {{ datum: string, verlauf: boolean[], richtig: number, gesamt: number, streak: number, link: string }} d
 *   datum als Text (z. B. "09.10.2026"), link als Anzeige ohne https://
 * @returns {Promise<File|null>} PNG-Datei oder null, wenn der Browser kein Canvas kann
 */
export async function tagesquizBild(d) {
  if (!kannZeichnen()) return null;
  await schriftenLaden();
  const maskottchen = await bildLaden(`assets/stimmung/${stimmungFuer(d.richtig, d.gesamt)}.webp`);
  const { leinwand, ctx } = leinwandMitKarte(680, 380, 800);

  logo(ctx, 150);
  pille(ctx, `TAGESQUIZ · ${d.datum}`, 470);

  // Kästchen je Frage
  const n = d.verlauf.length || d.gesamt;
  const groesse = n <= 5 ? 136 : Math.min(136, Math.floor((KB - 120 - (n - 1) * 20) / n));
  const luecke = 22;
  let x = (W - (n * groesse + (n - 1) * luecke)) / 2;
  const y = 610;
  for (let i = 0; i < n; i++) {
    const ok = d.verlauf[i] === true;
    kasten(ctx, x, y, groesse, groesse, 26, ok ? GREEN : RED, 10, 7);
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 14;
    ctx.beginPath();
    if (ok) {
      ctx.moveTo(x + groesse * 0.26, y + groesse * 0.52);
      ctx.lineTo(x + groesse * 0.44, y + groesse * 0.70);
      ctx.lineTo(x + groesse * 0.76, y + groesse * 0.32);
    } else {
      ctx.moveTo(x + groesse * 0.32, y + groesse * 0.32);
      ctx.lineTo(x + groesse * 0.68, y + groesse * 0.68);
      ctx.moveTo(x + groesse * 0.68, y + groesse * 0.32);
      ctx.lineTo(x + groesse * 0.32, y + groesse * 0.68);
    }
    ctx.stroke();
    x += groesse + luecke;
  }

  // Stand
  const standX = 110;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;
  ctx.font = `400 110px ${DISPLAY}`;
  ctx.fillText(`${d.richtig}/${d.gesamt}`, standX, 920);
  ctx.font = `900 44px ${BODY}`;
  ctx.fillText('richtig', standX + 6, 980);

  // Serie
  if (d.streak > 1) {
    const sy = 1060;
    flamme(ctx, standX - 4, sy - 46, 3.2);
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.font = `900 50px ${BODY}`;
    ctx.fillText(`${d.streak} Tage in Folge`, standX + 76, sy + 4);
  }

  if (maskottchen) ctx.drawImage(maskottchen, W - 120 - 430, 752, 430, 430);
  fussleiste(ctx, d.link);
  return alsDatei(leinwand, 'senpai-quiz-tagesquiz.png');
}

// ---------- Heldenreise: Boss besiegt ----------

/**
 * Zeichnet die Karte für einen Boss-Sieg.
 * @param {{ boss: string, bild: string, kapitelNr: number, kapitelTitel: string, sterne: number, sterneMax: number, heimkehr: boolean, link: string }} d
 *   bild: Pfad des freigestellten Boss-Bilds (z. B. assets/reise/boss-01.webp);
 *   heimkehr: true nach dem Endboss, dann „HEIMKEHR!“ und Maskottchen „siegreich“
 * @returns {Promise<File|null>}
 */
export async function bossBild(d) {
  if (!kannZeichnen()) return null;
  await schriftenLaden();
  const [boss, maskottchen] = await Promise.all([
    bildLaden(d.bild),
    bildLaden(`assets/stimmung/${d.heimkehr ? 'siegreich' : 'kaempferisch'}.webp`),
  ]);
  const { leinwand, ctx } = leinwandMitKarte(640, 300, 760);

  logo(ctx, 100, 0.72);

  // Überschrift als roter Balken
  const titel = d.heimkehr ? 'HEIMKEHR!' : 'BOSS BESIEGT!';
  ctx.font = `400 ${d.heimkehr ? 84 : 72}px ${DISPLAY}`;
  const titelBreite = ctx.measureText(titel).width;
  ctx.save();
  ctx.translate(W / 2, 400);
  ctx.rotate(-2 * Math.PI / 180);
  kasten(ctx, -titelBreite / 2 - 36, -58, titelBreite + 72, 116, 14, RED, 12, 8);
  ctx.fillStyle = WHITE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(titel, 0, 28);
  ctx.restore();

  // Boss groß in der Mitte, dahinter ein gelber Kreis als Bühne
  const bx = W / 2, by = 690, br = 220;
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(bx + 12, by + 12, br, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = INK;
  ctx.stroke();
  if (boss) {
    const bg = 450;
    ctx.drawImage(boss, bx - bg / 2, by - bg / 2 - 10, bg, bg);
  }

  // „BESIEGT“-Stempel schräg über dem Boss
  const stempel = d.heimkehr ? 'ERINNERUNG GERETTET' : 'BESIEGT';
  ctx.save();
  ctx.translate(bx, by + 40);
  ctx.rotate(-14 * Math.PI / 180);
  ctx.font = `400 ${d.heimkehr ? 46 : 76}px ${DISPLAY}`;
  const sb = ctx.measureText(stempel).width;
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = WHITE;
  rund(ctx, -sb / 2 - 26, -56, sb + 52, 112, 10);
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = RED;
  ctx.stroke();
  ctx.lineWidth = 4;
  rund(ctx, -sb / 2 - 14, -44, sb + 28, 88, 6);
  ctx.stroke();
  ctx.fillStyle = RED;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(stempel, 0, d.heimkehr ? 16 : 27);
  ctx.restore();

  // Boss-Name
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = `400 54px ${DISPLAY}`;
  ctx.fillText(d.boss, W / 2, 962);

  // Kapitel-Pille
  pille(ctx, `KAPITEL ${d.kapitelNr} · ${String(d.kapitelTitel).toUpperCase()}`, 988, YELLOW, 620);

  // Sterne-Stand links unten
  stern(ctx, 150, 1118, 32, YELLOW);
  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `400 48px ${DISPLAY}`;
  ctx.fillText(`${d.sterne} / ${d.sterneMax}`, 200, 1122);
  ctx.font = `900 26px ${BODY}`;
  ctx.fillText('STERNE', 202, 1156);

  // Senpai klein rechts unten
  if (maskottchen) ctx.drawImage(maskottchen, W - 100 - 215, 935, 215, 215);

  fussleiste(ctx, d.link);
  return alsDatei(leinwand, 'senpai-quiz-boss.png');
}

// Kann dieses Gerät Dateien über das Teilen-Menü weitergeben?
export function kannBildTeilen(datei) {
  return !!(navigator.share && navigator.canShare && datei && navigator.canShare({ files: [datei] }));
}
