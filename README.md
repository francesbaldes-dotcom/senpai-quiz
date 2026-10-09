# Senpai Quiz

Inoffizielles Anime- und Manga-Quiz. Prototyp als reine Web-App (HTML, CSS, JavaScript ohne Build-Schritt), damit sie später wie Resist the Cute mit Capacitor als iOS-App verpackt werden kann.

## Starten

Die App lädt `data/fragen.json` per `fetch`, braucht also einen kleinen Webserver:

```bash
python3 -m http.server 5190
```

Dann <http://localhost:5190> öffnen. Alle Pfade sind relativ, die App läuft deshalb auch unter einem Unterpfad wie `/senpai-quiz/` (z. B. GitHub Pages).

In Claude Code startet `.claude/launch.json` denselben Server für die Browser-Vorschau (Eintrag `senpai-quiz`).

## Aufbau

| Pfad | Inhalt |
|---|---|
| `index.html` | Einstieg |
| `manifest.webmanifest` | Web-App-Manifest (Name, Farben, Icons) für „Zum Home-Bildschirm“ |
| `js/app.js` | Spiellogik und alle Bildschirme |
| `js/speicher.js` | Speichern des Profils: im Browser `localStorage`, in der Capacitor-App das Plugin Preferences (dieser native Pfad ist noch ungetestet, weil es noch kein Capacitor-Projekt gibt) |
| `js/online.js` | Supabase-Client für Accounts und Duelle |
| `js/dojo.js` | Senpai Dojo (Japanisch lernen): Übersicht, Lernkarten, Abfrage, Leitner-Wiederholung, Gürtel, Kaufbildschirm; Anbindung über `dojoEinrichten()` aus `app.js` |
| `js/kauf.js` | In-App-Kauf fürs Dojo: im Browser eine Kauf-Attrappe, in der iPhone-App später RevenueCat/StoreKit |
| `data/dojo.json` | Inhalte des Dojo: Hiragana und Katakana mit Eselsbrücken, Anime-Vokabeln, Gürtel-Stufen |
| `css/dojo.css` | Gestaltung des Dojo |
| `js/teilen-bild.js` | Teilen-Bild fürs Tagesquiz (PNG per Canvas, 1080 × 1350, App-Schriften und Maskottchen) |
| `js/grafik.js` | Inline-SVG-Grafiken im Manga-Look: Kategorie-Icons (`kategorieIcon`), Abzeichen-Embleme (`abzeichenEmblem`), Rang-Embleme (`rangEmblem`) und Bausteine für die Heldenreise-Karte (`stationsKnoten`, `bossKnoten`). Eigene Symbole, keine Markenzeichen |
| `vendor/` | Supabase-JS (2.45.4), lokal eingebunden |
| `css/style.css` | Gestaltung (Manga-Look) |
| `impressum.html`, `datenschutz.html`, `nutzungsbedingungen.html` | Rechtstexte (Stand im Kopf jeder Seite), verlinkt unter Info und beim Anlegen des Accounts; Gestaltung in `css/rechtstext.css`. Die Datenschutz-URL für App Store Connect ist `…/senpai-quiz/datenschutz.html`. Abschnitte zu AdMob und App Store gelten erst mit der iPhone-App; der dort genannte Knopf „Werbe-Einwilligung“ muss mit AdMob in die App |
| `css/fonts.css`, `fonts/` | Dela Gothic One und Rubik, lokal eingebunden (SIL Open Font License) |
| `assets/maskottchen.jpg` | Onigiri-Maskottchen (Higgsfield), Original mit 512 × 512 Pixeln |
| `assets/maskottchen-2160.webp` | dasselbe Maskottchen („entschlossen“) in 2160 × 2160, per Higgsfield-Upscale aus `stimmung/entschlossen.webp`, Transparenz vom Original übernommen; Quelle für Icon und Splash |
| `assets/icon-1024.png`, `icon-512.png`, `icon-180.png` | App-Icons, erzeugt mit `python3 scripts/app_icon.py` aus dem Maskottchen (rote Fläche, gelbe Scheibe); das 512er ist auf 256 Farben reduziert |
| `assets/splash-2732.png`, `splash-2732-dark.png` | Startbildschirm der iPhone-App, hell und dunkel, Motiv mittig innerhalb von 1100 px (sichtbarer Streifen auf schmalen iPhones) |
| `assets/favicon.ico`, `assets/favicon-32.png` | Favicons, aus `icon-1024.png` erzeugt (gleiches Skript) |
| `data/fragen.json` | Fragenkatalog |
| `data/reise.json` | Stationen der Heldenreise (Akte, Kapitel, Regeln je Station); Pool-Prüfung mit `python3 scripts/reise_check.py` |
| `assets/reise/` | Bosse und Akt-Karten der Heldenreise (Higgsfield, siehe `heldenreise.md`) |
| `fragen.md` | Lesbare Fragenliste zum Korrekturlesen, erzeugt mit `python3 scripts/fragen_liste.py` |

## Kategorien

Zehn Kategorien, die ID steht in `data/fragen.json` unter `kategorien` und in jeder Frage unter `category`:

| ID | Name | Was hineingehört |
|---|---|---|
| `onepiece` | One Piece | alles zu One Piece, auch Oda, Bände, Verlag |
| `dragonball` | Dragon Ball | alle Dragon-Ball-Serien, Toriyama |
| `naruto` | Naruto | Naruto, Shippuden, Boruto, Kishimoto |
| `shonen` | Shōnen | weitere Shōnen-Serien: Detektiv Conan, Pokémon, Attack on Titan, Bleach, Haikyu!!, Blue Lock, Yu-Gi-Oh! |
| `neu` | Neue Hits | Serien ab etwa 2015: Demon Slayer, Jujutsu Kaisen, Spy x Family, My Hero Academia, Chainsaw Man, Dandadan, Oshi no Ko, Dr. Stone |
| `isekai` | Isekai & Fantasy | andere Welten und Fantasy: Frieren, Solo Leveling, Fairy Tail, Hunter x Hunter, The Promised Neverland; später Re:Zero, Sword Art Online, KonoSuba |
| `klassiker` | Klassiker & Kult | Death Note, Fullmetal Alchemist, Tokyo Ghoul, JoJo, Tezuka, Fernseh-Geschichte (Heidi, RTL II) |
| `shojo` | Shōjo & Romance | Sailor Moon, Fruits Basket, Kaguya-sama, Black Butler, Die Tagebücher der Apothekerin |
| `filme` | Ghibli & Kinofilme | Ghibli, Shinkai, Hosoda, Kon, Kinofilme zu Serien |
| `kultur` | Manga, Begriffe & Kultur | Manga-Handwerk, Verlage, Magazine, Begriffe, Sprache, Japan |

## Fragenformat

Die richtige Antwort steht immer an erster Stelle (`"correct": 0`), die App mischt beim Anzeigen. Typen: `multiple_choice`, `true_false`, `emoji`, `order` (Antworten in richtiger Reihenfolge, optional `years`), `estimate` (`answer`, `min`, `max`, `tolerance` = Abstand, der noch halbe Punkte gibt), `who_am_i` (drei `hints`, alle 5 Sekunden wird einer mehr sichtbar; früh richtig raten gibt +25 Punkte pro verdecktem Hinweis).

## Spielmodi

- **Klassisch:** Kategorie (eine von zehn oder gemischt) und Schwierigkeit wählen, 10 Fragen, 15 Sekunden pro Frage, Joker (50:50, +10 s, Überspringen)
- **Tagesquiz:** 5 Fragen pro Tag, für alle gleich (aus dem Datum berechnet), mit Streak. Das Ergebnis lässt sich teilen (Teilen-Menü des Geräts, sonst Zwischenablage): Datum, 🟩🟥-Kästchen je Frage, Stand, Serie ab 2 Tagen und der Link zur App. Beim ersten Teilen gibt es das Abzeichen „Teilgeist“. Auf Geräten, die Dateien teilen können (iPhone), geht zusätzlich ein Bild im Manga-Look mit.
- **Survival:** endlos, bis 3 Fehler gemacht sind
- **Blitz:** 60 Sekunden, so viele Fragen wie möglich
- **Heldenreise:** Story-Modus mit Karte, oberste Karte auf der Startseite. 5 Akte, 10 Kapitel, je 4 Stationen und ein Boss, insgesamt 50 Stationen, die sich der Reihe nach freischalten. Station: 5 Fragen, Boss: 7 (Endboss 10 mit 12 s), immer 3 Herzen; jeder Fehler kostet eins, bei 0 ist die Station gescheitert und sofort wiederholbar. Sterne = übrige Herzen, Wiederholen verbessert sie. Joker gibt es erst ab Kapitel 2 (50:50), 2.3 (+10 s) und 3 (Weiter), Bosse haben keine; die Zweite Chance per Video gilt überall außer beim Endboss. Erstes Bestehen: +50 XP, erster Boss-Sieg: +150 XP. Regeln, Kategorien und Stufen jeder Station stehen in `data/reise.json`, das Konzept in `heldenreise.md`. Abzeichen: Aufbruch, Schwellenhüter, Heimkehr, Sternenfänger. Der Senpai (Maskottchen) spricht auf jeder Stationskarte, Bosse haben einen Auftrittssatz, nach einem Boss-Sieg gibt es ein Senpai-Zitat und einen Teilen-Knopf. Titel „Reisender“ (ab Boss 4) und „Heimkehrer“ (nach dem Ende) erscheinen neben dem Rang auf der Startseite. Alle Texte stehen in `data/reise.json`. Jeder Akt hat einen **Geheimpfad** (eine Kategorie pur auf Otaku, 5 Fragen, 3 Herzen), der ab 80 % der Akt-Sterne aufgeht und beim ersten Bestehen 100 XP gibt. Nach dem Ende lässt sich auf der Karte die **Zweite Reise** wählen: alle Stationen auf Fan und Otaku mit nur zwei Herzen und eigenen Sternen. Abzeichen dafür: Pfadfinder, Zweite Reise.

## Senpai Dojo (Japanisch lernen)

Kauf-Funktion, eigene Karte auf der Startseite unter der Heldenreise. Inhalte in `data/dojo.json`, Logik in `js/dojo.js`, Gestaltung in `css/dojo.css`.

- **Inhalt:** Hiragana und Katakana (je 46 Grundzeichen plus Trübungen, zusammen 143 Zeichen) mit einer Eselsbrücke pro Zeichen, dazu 150 Anime-Vokabeln in 15 Lektionen (Begrüßung, Anrede, Familie, Kampf, Gefühle, Essen, Zahlen, Anime-Sätze …). Karten-IDs: `h:か`, `k:カ`, `v:romaji`.
- **Lernen:** Lektion = Lernkarten (Zeichen, Rōmaji, Bedeutung, Eselsbrücke, Anhören) und danach eine Abfrage, in der jede Karte erst erkannt (Mehrfachwahl) und dann geschrieben wird (Zeichen wählen). Falsche Karten kommen in derselben Runde noch einmal.
- **Wiederholung nach Leitner:** Jede Karte hat ein Fach 0–5 (`profil.dojo.karten[id] = { f, bis }`). Richtig → Fach +1, falsch → Fach 0. Abstände: 0, 1, 3, 7, 14, 30 Tage. Ab Fach 2 wird geschrieben, ab Fach 3 die Lesung getippt (Rōmaji, Makrons und Doppelvokale sind egal, `si`/`ti`/`tu`/`hu` werden angenommen). Ab Fach 3 „sitzt“ eine Karte. Fällige Karten stehen auf der Startkarte und im Dojo unter „Wiederholen“ (höchstens 20 pro Runde, niedrigste Fächer zuerst).
- **Hören:** Gibt es eine japanische Stimme (`speechSynthesis`, auf dem iPhone offline vorhanden), haben Lernkarten einen Anhören-Knopf, und etwa ein Drittel der Abfragen ab Fach 1 sind Hör-Aufgaben.
- **Gürtel:** nach der Zahl sitzender Karten, Stufen in `dojo.json` (Weiß 0, Gelb 20, Orange 46, Grün 92, Blau 150, Braun 220, Schwarz alle). Aufstieg wird auf dem Ergebnis-Bildschirm gefeiert.
- **XP:** 5 je richtiger Antwort, 25 beim ersten Abschluss einer Lektion; fließt in den normalen Rang.
- **Kauf:** Gratis sind Hiragana Reihe A und die Vokabel-Lektion „Erste Worte“; alle anderen Lektionen zeigen ein Schloss und führen zum Kaufbildschirm. Zwei Angebote in `js/kauf.js`: Monatsabo (`de.senpaiquiz.dojo.monat`, 2,99 €) und Einmalkauf (`de.senpaiquiz.dojo.lebenslang`, 19,99 €). Nur bei lokaler Entwicklung (localhost) läuft eine Attrappe („App Store · Platzhalter“), die nach 1,5 s einen Kaufen-Knopf freigibt; auf GitHub Pages sind die Angebote ausgegraut mit dem Hinweis, dass der Kauf nur in der iPhone-App geht. der Kauf landet in `profil.dojo.frei = { art, bis, seit }` (Abo-Attrappe: 30 Tage). In der iPhone-App muss hier Apples In-App-Kauf hinein, am einfachsten RevenueCat (`@revenuecat/purchases-capacitor`), das auch „Käufe wiederherstellen“ liefert. Preise und Produkt-IDs in App Store Connect anlegen. Abo-Regeln stehen in `nutzungsbedingungen.html` (Abschnitt 7, Anker `#dojo`, vom Kaufbildschirm verlinkt), die Datenverarbeitung in `datenschutz.html` (Abschnitt 9).
- **Server:** Spalte `profile.dojo_bis` (Migration `dojo_freischaltung`) als zweite Quelle der Freischaltung; die App liest sie mit dem Profil. Geschrieben wird sie nicht aus der App, sondern später vom Store-Webhook (RevenueCat → Edge Function mit Service-Rolle). Da Accounts an das Gerät gebunden sind, geht der Lernfortschritt beim Löschen der App verloren; der Kauf lässt sich über Apple wiederherstellen.

## Belohnungswerbung

Werbevideos gibt es nur freiwillig gegen eine Belohnung (`js/werbung.js`). Im Browser läuft eine Attrappe mit 5-Sekunden-Countdown; in der iPhone-App kommt dort AdMob hinein (`@capacitor-community/admob`, wie bei Resist the Cute).

- **Joker zurückholen:** Ein benutzter Joker lässt sich einmal pro Runde per Video wieder auffüllen. Die Uhr der Frage steht so lange still.
- **Zweite Chance:** Im Survival einmal pro Runde mit 1 Leben weiterspielen.
- **XP verdoppeln:** auf dem Ergebnis-Bildschirm, einmal pro Runde.
- **Serie retten:** Wer das Tagesquiz genau einen Tag verpasst hat (Serie ab 2 Tagen), kann sie per Video erhalten.

Punkte: 100 pro richtiger Antwort plus bis zu 75 Zeitbonus, mal Combo (×2 ab 3 richtigen am Stück, ×3 ab 5). XP = Punkte ÷ 10. Fortschritt wird nur lokal im Browser gespeichert.

## Duelle

Duelle gegen Freunde laufen wie bei Quizduell: **6 Runden mit je 3 Fragen**, abwechselnd und ohne gleichzeitig online sein zu müssen. Wer am Zug ist, wählt die Kategorie aus vier Vorschlägen und spielt zuerst, danach spielt der Gegner dieselben Fragen und wählt die nächste Kategorie. Die Ergebnisse des Gegners für eine Runde werden erst sichtbar, wenn man sie selbst gespielt hat.

- **Account:** anonym über Supabase Anonymous Sign-in, nur mit Spielername, ohne E-Mail. Er ist an das Gerät gebunden; wer die App löscht, verliert ihn. Löschen geht in der App unter Info.
- **Einladen:** per Link `?einladung=CODE` oder über den 6-stelligen Einladungscode; außerdem Suche nach Spielernamen.
- **Server:** Supabase-Projekt `senpai-quiz` in Frankfurt (`eu-central-1`). Im Dashboard muss „Allow anonymous sign-ins“ eingeschaltet sein.
- **Tabellen:** `profile`, `duelle`, `duell_runden`, `duell_antworten`, `fragen` (nur IDs und Kategorie der duelltauglichen Fragen, erzeugt mit `python3 scripts/fragen_sql.py`). Alle mit Zeilenschutz: Jeder sieht nur seine eigenen Duelle.
- **RPC-Funktionen:** `profil_anlegen`, `duell_herausfordern`, `runde_starten`, `runde_abschliessen`, `duell_aufgeben`, `konto_loeschen`. Geschrieben wird nur über diese Funktionen; sie prüfen, wer am Zug ist.
- **Schema:** `supabase/migrations/`.

## Fragen melden

Nach jeder beantworteten Frage (außer im Blitz) steht im Ergebnis-Banner der Link „Frage melden“. Der Dialog fragt nach dem Grund (Antwort ist falsch, Frage ist unklar, Tippfehler) und einer optionalen Erklärung mit bis zu 200 Zeichen. Gespeichert wird in der Supabase-Tabelle `meldungen`: Frage-ID, Grund, Text, die angetippte Antwort, ob sie als richtig gewertet wurde, der Spielmodus und die App-Version (`VERSION` in `js/app.js`). Keine Nutzer-ID, keine Gerätedaten; ein Account ist nicht nötig, die Rolle `anon` darf nur einfügen.

Meldungen ansehen: im Supabase-Dashboard das Projekt `senpai-quiz` öffnen, dann **Table Editor → meldungen** (neueste zuerst nach `erstellt` sortieren) oder im **SQL Editor**:

```sql
select erstellt, frage_id, grund, text, antwort, als_richtig, modus, version
from public.meldungen order by erstellt desc;
```

Die Frage-ID findet man in `data/fragen.json` oder `fragen.md`. Erledigte Meldungen kann man dort löschen; aus der App heraus geht das nicht.
