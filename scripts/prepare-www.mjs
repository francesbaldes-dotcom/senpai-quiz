// Bereitet den Ordner www/ für Capacitor vor.
//
// Die Web-App liegt im Stamm des Repos, weil GitHub Pages von dort ausliefert. Capacitor
// braucht einen Ordner, der nur die Web-Dateien enthält. Dieses Skript kopiert sie nach www/
// und passt die Kopie für die native App an; die Dateien im Repo-Stamm bleiben unverändert.
// Aufruf: npm run www   (oder über: npm run sync:ios)
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(root, 'www');
const WEB_URL = 'https://francesbaldes-dotcom.github.io/senpai-quiz/';
const items = [
  'index.html', 'css', 'js', 'fonts', 'assets', 'data', 'vendor', 'manifest.webmanifest',
  'impressum.html', 'datenschutz.html', 'nutzungsbedingungen.html',
];

for (const item of items) {
  if (!existsSync(join(root, item))) throw new Error(`Datei fehlt im Repo-Stamm: ${item}`);
}
rmSync(www, { recursive: true, force: true });
mkdirSync(www);
for (const item of items) cpSync(join(root, item), join(www, item), { recursive: true });

// Nicht in die App: Quelldateien, die nur fürs Repo gedacht sind
for (const extra of ['assets/maskottchen-2160.webp', 'assets/splash-2732.png', 'assets/splash-2732-dark.png', 'assets/icon-1024.png']) {
  rmSync(join(www, extra), { force: true });
}

// index.html: Web-Adresse für Teilen-Links (in der App wäre location.origin „capacitor://localhost“)
const indexPath = join(www, 'index.html');
let html = readFileSync(indexPath, 'utf8');
const marker = '<script type="module"';
if (!html.includes(marker)) throw new Error('index.html: Modul-Skript nicht gefunden');
html = html.replace(marker, `<script>window.SENPAI_APP_URL = '${WEB_URL}';</script>\n${marker}`);
writeFileSync(indexPath, html);

// Rechtstexte öffnen in der App im selben Fenster (kein Browser-Tab). Ihr Link „Zur App“ führt zurück.
const appJs = join(www, 'js', 'app.js');
const dojoJs = join(www, 'js', 'dojo.js');
for (const file of [appJs, dojoJs]) {
  let js = readFileSync(file, 'utf8');
  const vorher = js;
  js = js.replace(/ target="_blank" rel="noopener"/g, '');
  if (js !== vorher) writeFileSync(file, js);
}

// Sicherheitsnetz: Die Kauf-Attrappe darf in der App nicht laufen.
const kauf = readFileSync(join(www, 'js', 'kauf.js'), 'utf8');
if (!/const NATIV = /.test(kauf) || !/const LOKAL = !NATIV &&/.test(kauf)) {
  throw new Error('js/kauf.js: Attrappe ist nicht gegen die native App abgesichert (NATIV/LOKAL).');
}

console.log(`www/ vorbereitet: ${items.join(', ')} – Web-Adresse ${WEB_URL}, Rechtstexte im selben Fenster, Kauf-Attrappe nativ gesperrt`);
