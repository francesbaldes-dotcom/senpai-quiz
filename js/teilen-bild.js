// Teilen-Bild fürs Tagesquiz: eine PNG-Karte im Manga-Look der App (1080 × 1350,
// Hochformat 4:5, passt in WhatsApp, Instagram-Feed und als Story).
// Gezeichnet per Canvas, nutzt die App-Schriften und das Maskottchen aus assets/stimmung.

const INK = '#141414';
const PAPER = '#FBF8F1';
const WHITE = '#FFFFFF';
const RED = '#D7261E';
const YELLOW = '#FFD23F';
const GREEN = '#177A41';

const W = 1080;
const H = 1350;

const DISPLAY = '"Dela Gothic One", "Hiragino Kaku Gothic StdN", sans-serif';
const BODY = 'Rubik, system-ui, sans-serif';

// Rechteck mit runden Ecken als Pfad
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
function speedlines(ctx, cx, cy, innen, aussen) {
  ctx.save();
  const verlauf = ctx.createRadialGradient(cx, cy, innen, cx, cy, aussen);
  verlauf.addColorStop(0, 'rgba(20,20,20,0)');
  verlauf.addColorStop(1, 'rgba(20,20,20,.38)');
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

function stimmungFuer(richtig, gesamt) {
  if (richtig === gesamt) return 'stolz';
  if (richtig / gesamt >= 0.6) return 'jubelnd';
  if (richtig / gesamt >= 0.4) return 'entschlossen';
  return 'erledigt';
}

/**
 * Zeichnet die Tagesquiz-Karte.
 * @param {{ datum: string, verlauf: boolean[], richtig: number, gesamt: number, streak: number, link: string }} d
 *   datum als Text (z. B. "09.10.2026"), link als Anzeige ohne https://
 * @returns {Promise<File|null>} PNG-Datei oder null, wenn der Browser kein Canvas kann
 */
export async function tagesquizBild(d) {
  if (typeof document === 'undefined' || !('roundRect' in CanvasRenderingContext2D.prototype)) return null;
  try {
    await Promise.all([
      document.fonts.load(`400 120px ${DISPLAY}`),
      document.fonts.load(`900 40px ${BODY}`),
      document.fonts.load(`700 32px ${BODY}`),
    ]);
  } catch { /* Schriften fehlen: Fallback-Schrift */ }
  const maskottchen = await bildLaden(`assets/stimmung/${stimmungFuer(d.richtig, d.gesamt)}.webp`);

  const leinwand = document.createElement('canvas');
  leinwand.width = W;
  leinwand.height = H;
  const ctx = leinwand.getContext('2d');
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Papier mit Rasterpunkten
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

  // Große Karte
  const kx = 60, ky = 60, kb = W - 120, kh = H - 120;
  kasten(ctx, kx, ky, kb, kh, 44, WHITE, 16, 8);
  ctx.save();
  rund(ctx, kx, ky, kb, kh, 44);
  ctx.clip();
  speedlines(ctx, W / 2, 680, 380, 800);
  ctx.restore();

  // Logo: SENPAI auf weißem Grund, QUIZ als roter, leicht gedrehter Kasten
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = `400 128px ${DISPLAY}`;
  const senpaiBreite = ctx.measureText('SENPAI').width;
  const logoX = (W - senpaiBreite) / 2;
  ctx.fillStyle = WHITE;
  ctx.fillRect(logoX - 18, 150, senpaiBreite + 36, 136);
  ctx.fillStyle = INK;
  ctx.fillText('SENPAI', logoX, 262);

  ctx.save();
  ctx.font = `400 104px ${DISPLAY}`;
  const quizBreite = ctx.measureText('QUIZ').width;
  ctx.translate(W / 2, 352);
  ctx.rotate(-4 * Math.PI / 180);
  kasten(ctx, -quizBreite / 2 - 30, -62, quizBreite + 60, 124, 10, RED, 0, 7);
  ctx.fillStyle = WHITE;
  ctx.fillText('QUIZ', -quizBreite / 2, 40);
  ctx.restore();

  // Gelbe Pille: Tagesquiz und Datum
  ctx.font = `900 38px ${BODY}`;
  const pille = `TAGESQUIZ · ${d.datum}`;
  const pilleBreite = ctx.measureText(pille).width + 72;
  kasten(ctx, (W - pilleBreite) / 2, 470, pilleBreite, 78, 39, YELLOW, 8, 6);
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.fillText(pille, W / 2, 522);

  // Kästchen je Frage
  const n = d.verlauf.length || d.gesamt;
  const groesse = n <= 5 ? 136 : Math.min(136, Math.floor((kb - 120 - (n - 1) * 20) / n));
  const luecke = 22;
  const gesamtBreite = n * groesse + (n - 1) * luecke;
  let x = (W - gesamtBreite) / 2;
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
  ctx.textAlign = 'left';
  const standX = 110;
  ctx.fillStyle = INK;
  ctx.font = `400 110px ${DISPLAY}`;
  ctx.fillText(`${d.richtig}/${d.gesamt}`, standX, 920);
  ctx.font = `900 44px ${BODY}`;
  ctx.fillText('richtig', standX + 6, 980);

  // Serie
  if (d.streak > 1) {
    const sy = 1060;
    ctx.save();
    ctx.translate(standX - 4, sy - 46);
    ctx.scale(3.2, 3.2);
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
    ctx.fillStyle = INK;
    ctx.font = `900 50px ${BODY}`;
    ctx.fillText(`${d.streak} Tage in Folge`, standX + 76, sy + 4);
  }

  // Maskottchen rechts unten
  if (maskottchen) {
    const mg = 430;
    ctx.drawImage(maskottchen, W - 120 - mg, 752, mg, mg);
  }

  // Fußleiste mit Link
  ctx.save();
  rund(ctx, kx, ky, kb, kh, 44);
  ctx.clip();
  ctx.fillStyle = INK;
  ctx.fillRect(kx, ky + kh - 112, kb, 112);
  ctx.restore();
  ctx.font = `700 34px ${BODY}`;
  ctx.fillStyle = WHITE;
  ctx.textAlign = 'center';
  ctx.fillText(`Spiel mit: ${d.link}`, W / 2, ky + kh - 46);

  const blob = await new Promise((loese) => leinwand.toBlob(loese, 'image/png'));
  if (!blob) return null;
  return new File([blob], 'senpai-quiz-tagesquiz.png', { type: 'image/png' });
}

// Kann dieses Gerät Dateien über das Teilen-Menü weitergeben?
export function kannBildTeilen(datei) {
  return !!(navigator.share && navigator.canShare && datei && navigator.canShare({ files: [datei] }));
}
