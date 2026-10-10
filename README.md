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
| `assets/start/` | Startseite im Tusche- und Aquarell-Look (Higgsfield `gpt_image_2_5`): `held.webp` Kopfbild mit Fuji, Sonne, Torii und Kirschblüten (1024 breit, ohne Figur; das Maskottchen liegt als eigene Ebene darüber), `karte-rot/-gelb/-tuerkis/-lila/-ink.webp` bemalte Hintergründe (900 breit) für die Karten der Startseite und die Kopfzeilen der anderen Bildschirme: Kategorie rot, Heldenreise türkis, Dojo lila, Duelle gelb, Profil und Info schwarz (Klassen `kategorie`, `reise`, `dojo`, `duelle`, `profil`, `info` am `<section class="screen">`). Das Ergebnis nutzt das Kopfbild. Das Pinsel-Logo ist CSS (`.logo` in `css/style.css`, roter Pinselstrich als Inline-SVG); das Papier hat Kirschblütenblätter als SVG-Muster im `body` |
| `assets/stimmung/` | Posen des Maskottchens (Higgsfield), 480 × 480 mit Transparenz; `katana.webp` steht im Kopfbild der Startseite. Vier Posen gehören zu den Verwandlungen auf der Startseite (Senpai antippen, Aktion `verwandlung` in `js/app.js`, abwechselnd): Goldform mit `aufladend.webp` und `goldform.webp` (zittern und aufladen, Blitz, goldene Haare mit Aura; Klassen `laedt`/`blitzt`/`gold`) und Schwertkämpfer mit `bandana-binden.webp` und `bandana.webp` (Karte dunkelt ab, Bandana wird gebunden, Schnitt, Narbe über dem linken Auge; Klassen `bindet`/`schnitt`/`bandana` in `css/style.css`) |
| `assets/maskottchen-verwandlung.mp4`, `maskottchen-bandana.mp4` | Dieselben Verwandlungen als 5-Sekunden-Clips (Higgsfield Seedance 2.5, Start-Bild „entschlossen“, fertige Pose als End-Bild, 960 × 960, mit Ton), nicht in der App eingebunden; Material für Store-Vorschau oder Social Media |
| `assets/dojo/ton/` | Tonspuren fürs Dojo: jede Kana-Lesung, jedes Wort und jeder Satz als AAC (m4a, 48 kbit/s), gesprochen von der macOS-Stimme Kyoko, erzeugt mit `python3 scripts/dojo_ton.py` (nur fehlende Dateien; `--neu` für alle). Dateiname = Rōmaji-Slug, Makron wird zum Doppelvokal (`kōhai` → `koohai.m4a`, `ki o tsukete` → `ki-o-tsukete.m4a`), Hiragana und Katakana mit gleicher Lesung teilen sich eine Datei. Einzelne Kana spricht das Skript als Katakana, sonst liest die Stimme は als „wa“ |
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

Die Tab-Leiste unten hat fünf Tabs: Start (Tagesquiz, Klassisch, große Karten für Dojo und Heldenreise, darunter klein Survival und Blitz), Reise (Karte der Heldenreise), Dojo, Duelle und Profil (Rang, Statistik und Abzeichen als Segmente, Lexikon-Link, Info-Knopf oben rechts). Die alten Bildschirm-IDs `statistik` und `abzeichen` leiten auf den Profil-Tab weiter.

- **Klassisch:** Kategorie (eine von zehn oder gemischt) und Schwierigkeit wählen, 10 Fragen, 15 Sekunden pro Frage, Joker (50:50, +10 s, Überspringen)
- **Tagesquiz:** 5 Fragen pro Tag, für alle gleich (aus dem Datum berechnet), mit Streak. Das Ergebnis lässt sich teilen (Teilen-Menü des Geräts, sonst Zwischenablage): Datum, 🟩🟥-Kästchen je Frage, Stand, Serie ab 2 Tagen und der Link zur App. Beim ersten Teilen gibt es das Abzeichen „Teilgeist“. Auf Geräten, die Dateien teilen können (iPhone), geht zusätzlich ein Bild im Manga-Look mit.
- **Survival:** endlos, bis 3 Fehler gemacht sind
- **Blitz:** 60 Sekunden, so viele Fragen wie möglich
- **Heldenreise:** Story-Modus mit Karte im Tab „Reise“; auf der Startseite zeigt eine große Karte den Stand. 5 Akte, 10 Kapitel, je 4 Stationen und ein Boss, insgesamt 50 Stationen, die sich der Reihe nach freischalten. Station: 5 Fragen, Boss: 7 (Endboss 10 mit 12 s), immer 3 Herzen; jeder Fehler kostet eins, bei 0 ist die Station gescheitert und sofort wiederholbar. Sterne = übrige Herzen, Wiederholen verbessert sie. Joker gibt es erst ab Kapitel 2 (50:50), 2.3 (+10 s) und 3 (Weiter), Bosse haben keine; die Zweite Chance per Video gilt überall außer beim Endboss. Erstes Bestehen: +50 XP, erster Boss-Sieg: +150 XP. Regeln, Kategorien und Stufen jeder Station stehen in `data/reise.json`, das Konzept in `heldenreise.md`. Abzeichen: Aufbruch, Schwellenhüter, Heimkehr, Sternenfänger. Der Senpai (Maskottchen) spricht auf jeder Stationskarte, Bosse haben einen Auftrittssatz, nach einem Boss-Sieg gibt es ein Senpai-Zitat und einen Teilen-Knopf. Titel „Reisender“ (ab Boss 4) und „Heimkehrer“ (nach dem Ende) erscheinen neben dem Rang im Profil-Tab und in der Sprechblase auf der Startseite. Alle Texte stehen in `data/reise.json`. Jeder Akt hat einen **Geheimpfad** (eine Kategorie pur auf Otaku, 5 Fragen, 3 Herzen), der ab 80 % der Akt-Sterne aufgeht und beim ersten Bestehen 100 XP gibt. Nach dem Ende lässt sich auf der Karte die **Zweite Reise** wählen: alle Stationen auf Fan und Otaku mit nur zwei Herzen und eigenen Sternen. Abzeichen dafür: Pfadfinder, Zweite Reise.

## Senpai Dojo (Japanisch lernen)

Kauf-Funktion, eigener Tab „Dojo“; auf der Startseite zeigt eine große Karte fällige Karten oder den Stand des Tagesziels. Inhalte in `data/dojo.json`, Logik in `js/dojo.js`, Gestaltung in `css/dojo.css`.

- **Aufbau wie ein Sprachlehrbuch:** 15 Kapitel nach Themen (`kapitel` in `data/dojo.json`: Erste Worte, Anrede, Ich/du/das, Zahlen, Familie, Essen, Schule, Zeit, Gefühle, Eigenschaften, Verben, Natur, Kampf, Anime-Sätze, Höflich), je 10 Wörter und 7 bis 8 Sätze. Aus jedem Kapitel baut `ladeDojo()` drei aufeinander aufbauende Schritte: **1. Wörter lernen** (Rōmaji ↔ Deutsch, Karten `w:romaji`), **2. Sätze bauen** (die Wörter in einfachen Sätzen mit Yuki und Ken; aus Wortkacheln zusammensetzen, erst Japanisch → Deutsch, dann Deutsch → Japanisch, zwei Ablenker-Kacheln aus anderen Sätzen des Kapitels; jeder Satz trägt einen Grammatik-Hinweis wie „desu steht am Satzende“; Karten `s:romaji`, Satzzeichen zählen nicht, Groß-/Kleinschreibung auch nicht), **3. Lesen & verstehen** (Kana → Deutsch, Karten `v:romaji`, Lektions-ID = Kapitel-ID, damit alter Fortschritt zählt). Ein Schritt öffnet sich, wenn der vorige abgeschlossen ist (`braucht`), schon fertige Schritte bleiben offen. Die Kana-Reihen (Hiragana, Katakana, je 46 Grundzeichen plus Trübungen, dazu die kleinen Zeichen っゃゅょ nur zum Lernen) sind eine eigene Strecke dahinter. Kapitel 1 und Reihe A sind gratis. Vorbild für den Satzbau ist Duolingo, die Inhalte sind eigene.
- **Lernen:** Jeder Schritt = Lernkarten (Zeichen, Wort oder Satz, Rōmaji, Bedeutung, Eselsbrücke bzw. Hinweis, Anhören, bei 32 konkreten Vokabeln ein Bild aus `assets/dojo/`) und danach eine Abfrage, in der jede Karte erst erkannt (Mehrfachwahl bzw. Satz ins Deutsche) und dann geschrieben wird: Kana als Zeichen wählen, Wörter (Schritt 1) als Rōmaji wählen und später tippen, Sätze (Schritt 2) ins Japanische bauen, Vokabeln (Schritt 3) abwechselnd aus Kana-Kacheln zusammensetzen („Silben ordnen“, zwei Ablenker-Kacheln) und als Wort wählen. Falsche Karten kommen in derselben Runde noch einmal. Die Übersicht markiert den nächsten offenen Schritt als „Empfohlen“. Sätze tauchen in Wiederholung und Gürtelprüfung auf, nicht in „Paare finden“. „Anhören“ und die Hör-Aufgaben spielen die Tonspur aus `assets/dojo/ton/` (`sprich()` in `js/dojo.js`); fehlt sie, springt die japanische Stimme des Geräts ein, falls vorhanden.
- **Wiederholung nach FSRS:** Geplant wird mit dem Free Spaced Repetition Scheduler (FSRS-5, Standardgewichte wie in Anki ab 23.10, `W` in `js/dojo.js`). Jede Karte trägt `profil.dojo.karten[id] = { s, d, f, bis, letzt }`: Stabilität `s` in Tagen (bis der Behalt auf 90 % fällt), Schwierigkeit `d` (1–10), abgeleitete Stufe `f` 0–5 mit Namen (Neuling, Schüler, Geselle, Meister, Erleuchtet, Eingebrannt; Schwellen `STUFEN_AB` bei 2, 4, 10, 30 und 90 Tagen Stabilität), Fälligkeit und Datum der letzten Antwort. Richtig → `s` wächst abhängig von `d` und davon, wie knapp die Erinnerung war; falsch → `s` schrumpft, die Karte ist sofort wieder fällig. Richtige Antworten stufen nie zurück. Antworten am selben Tag nutzen die Kurzzeit-Formel. Der nächste Termin liegt `s` Tage entfernt, ab drei Tagen um ±15 % gestreut. Alte Leitner-Karten (nur `f` und `bis`) werden beim nächsten Abruf überführt. Ab Stufe 2 wird geschrieben oder zusammengesetzt, ab Stufe 3 die Lesung getippt (Rōmaji, Makrons und Doppelvokale sind egal, `si`/`ti`/`tu`/`hu` werden angenommen). Ab Stufe 3 „sitzt“ eine Karte. Jede Lektionszeile zeigt eine Stufen-Leiste, das Ergebnis-Banner den Stufenwechsel. Fällige Karten stehen auf der Startkarte und im Dojo unter „Wiederholen“ (höchstens 20 pro Runde, niedrigste Stufen zuerst).
- **Tagesziel und Serie:** 5, 10 oder 20 Karten pro Tag (`profil.dojo.ziel`, gezählt in `profil.dojo.tage[datum]`, auch Paare aus dem Blitz). Ist das Ziel erreicht, verlängert sich die Serie der Startseite wie beim Tagesquiz (`serieHeute()` in `app.js`); „Serie retten“ per Video gilt unverändert.
- **Wochenliga:** Jede im Dojo verdiente XP zählt als Dojo-Punkt der laufenden ISO-Woche (`profil.dojo.wochen`, lokal auch ohne Account). Mit Account meldet die App die Punkte an den Server (RPC `liga_melden`, nicht gemeldete Punkte warten in `profil.dojo.ligaOffen`) und zeigt im Dojo die Liga aus dir und allen Duellpartnern (RPC `liga_stand`, laufende und vorige Woche, Tabelle `dojo_liga`, Migration `dojo_wochenliga`). Die Woche wechselt Sonntag um Mitternacht (Europe/Berlin); wer vorige Woche vorn lag, steht unter der Liste. Ohne Duellpartner zeigt die Karte den Weg zu den Duellen.
- **Fehler üben:** Falsch beantwortete Karten landen in `profil.dojo.fehler` (nur der aktuelle Tag) und lassen sich über „Fehler üben“ gezielt abfragen; dort richtig beantwortet, verschwinden sie aus der Liste.
- **Paare finden (Blitz):** 60 Sekunden, fünf Paare auf dem Brett (links Zeichen oder Wort, rechts Lesung oder Bedeutung), gefundene Paare werden nachgefüllt. Pool: alle schon gelernten Karten, bei weniger als zehn zusätzlich die Gratis-Lektionen. 2 XP je Paar, Rekord in `profil.dojo.blitz`; die Fächer ändert der Blitz nicht.
- **Hören und Bilder:** Gibt es eine japanische Stimme (`speechSynthesis`, auf dem iPhone offline vorhanden), haben Lernkarten einen Anhören-Knopf, und etwa ein Drittel der Abfragen ab Fach 1 sind Hör-Aufgaben. Karten mit Bild bekommen ab Fach 1 zusätzlich Bild-Aufgaben („Was zeigt das Bild?“, Wort wählen). Die Bilder (Higgsfield, Stil des Maskottchens, 480 × 480 WebP auf Weiß) liegen in `assets/dojo/`, der Dateiname steht als fünftes Element der Wortzeile in `dojo.json`.
- **Gürtel und Gürtelprüfung:** Die Zahl sitzender Karten macht einen Gürtel erreichbar (Stufen in `dojo.json`: Weiß 0, Gelb 20, Orange 46, Grün 92, Blau 150, Braun 220, Schwarz alle), getragen wird er erst nach der bestandenen Gürtelprüfung: 10 zufällige gelernte Karten (bevorzugt sitzende), 3 Herzen, jeder Fehler kostet eins, bei 0 ist die Prüfung vorbei; Fehler werden in der Prüfung nicht wiederholt, die Karten verlieren aber wie immer ihre Stufe. Bestanden: +50 XP, Eintrag in `profil.dojo.pruefungen`, Konfetti und das Maskottchen mit dem neuen Gürtel. Das ist die einzige Stelle mit Herzen im Dojo; beim Lernen selbst kosten Fehler nichts. Das Maskottchen trägt im Dojo und auf der Startkarte den Karate-Anzug mit dem aktuellen Gürtel (`assets/dojo/guertel-*.webp`, sieben freigestellte Bilder).
- **Wortkette (Shiritori):** 10 Glieder. Zum gezeigten Wort muss das Wort gewählt werden, das mit dessen letzter Silbe beginnt (vier Vorschläge, 3 XP je Treffer, Rekord in `profil.dojo.kette`). Längsstrich wird übersprungen, kleine Kana zählen groß, Trübungen gelten als gleich (ず schließt an す an), Katakana wird wie Hiragana behandelt. Hat ein Wort keinen Anschluss oder endet es auf ん, beginnt eine neue Kette. Wortschatz: alle Vokabeln der offenen Lektionen.
- **XP:** 5 je richtiger Antwort, 25 beim ersten Abschluss einer Lektion; fließt in den normalen Rang.
- **Abzeichen:** Hiragana-Held (alle Hiragana-Lektionen), Katakana-Kenner (alle Katakana-Lektionen), Wortschatz (100 Vokabeln sitzen), Gürtelträger (erste Gürtelprüfung), Kettenmeister (Wortkette 10 von 10), Fleißig (an 7 Tagen mindestens 5 Karten). Einträge in `ABZEICHEN` (app.js) mit `pruefe: () => false`, geprüft und vergeben nach jeder Dojo-Runde in `js/dojo.js` (`ABZEICHEN_BEDINGUNG`), Embleme in `js/grafik.js`.
- **Kauf:** Gratis sind Hiragana Reihe A und die Vokabel-Lektion „Erste Worte“; alle anderen Lektionen zeigen ein Schloss und führen zum Kaufbildschirm. Zwei Angebote in `js/kauf.js`: Monatsabo (`de.senpaiquiz.dojo.monat`, 2,99 €) und Einmalkauf (`de.senpaiquiz.dojo.lebenslang`, 19,99 €). Nur bei lokaler Entwicklung (localhost) läuft eine Attrappe („App Store · Platzhalter“), die nach 1,5 s einen Kaufen-Knopf freigibt; auf GitHub Pages sind die Angebote ausgegraut mit dem Hinweis, dass der Kauf nur in der iPhone-App geht. der Kauf landet in `profil.dojo.frei = { art, bis, seit }` (Abo-Attrappe: 30 Tage). In der iPhone-App muss hier Apples In-App-Kauf hinein, am einfachsten RevenueCat (`@revenuecat/purchases-capacitor`), das auch „Käufe wiederherstellen“ liefert. Preise und Produkt-IDs in App Store Connect anlegen. Abo-Regeln stehen in `nutzungsbedingungen.html` (Abschnitt 7, Anker `#dojo`, vom Kaufbildschirm verlinkt), die Datenverarbeitung in `datenschutz.html` (Abschnitt 9).
- **Server:** Spalte `profile.dojo_bis` (Migration `dojo_freischaltung`) als zweite Quelle der Freischaltung; die App liest sie mit dem Profil. Geschrieben wird sie nicht aus der App, sondern später vom Store-Webhook (RevenueCat → Edge Function mit Service-Rolle). Da Accounts an das Gerät gebunden sind, geht der Lernfortschritt beim Löschen der App verloren; der Kauf lässt sich über Apple wiederherstellen.

## iPhone-App (Capacitor)

Der Ordner `ios/` enthält ein Xcode-Projekt, das die Web-App als native iOS-App verpackt (Capacitor 8 mit Swift Package Manager, kein CocoaPods). Die Web-Dateien bleiben im Repo-Stamm, GitHub Pages läuft weiter.

Voraussetzungen: Mac mit Xcode, Node.js 20 oder neuer, für den Store eine Mitgliedschaft im Apple Developer Program.

1. `npm install` – lädt Capacitor und die Plugins Preferences (Spielstand, sonst könnte iOS den WebView-Speicher löschen) und Haptics nach `node_modules/`.
2. `npm run sync:ios` – kopiert die Web-Dateien nach `www/` (`scripts/prepare-www.mjs`), passt die Kopie an und überträgt sie ins Xcode-Projekt. Anpassungen: `window.SENPAI_APP_URL` auf die Web-Adresse, damit Teilen-Links nicht auf `capacitor://localhost` zeigen; Rechtstexte öffnen im selben Fenster (ihr Link „Zur App“ führt zurück); Prüfung, dass die Kauf-Attrappe in `js/kauf.js` nativ gesperrt ist. Nach jeder Änderung an den Web-Dateien wiederholen.
3. `npm run open:ios` – öffnet das Projekt in Xcode. Unter „Signing & Capabilities“ das eigene Team wählen. Bundle-ID: `de.senpaiquiz.app` (änderbar in `capacitor.config.json` und in Xcode).
4. Zum Testen ein iPhone anschließen oder einen Simulator wählen und auf „Run“ drücken.
5. Für den Upload: Product → Archive, dann „Distribute App“ → App Store Connect.

Eingerichtet: App-Icon 1024 px (`assets/icon-1024.png`), Startbildschirm hell und dunkel (`assets/splash-2732*.png`), nur Hochformat, Sprache Deutsch, Export-Compliance (keine eigene Verschlüsselung), Privacy-Manifest `ios/App/App/PrivacyInfo.xcprivacy` (UserDefaults-Zugriff des Preferences-Plugins, Grund CA92.1).

Noch offen für den Store: In-App-Kauf des Dojos (RevenueCat, siehe „Senpai Dojo“), AdMob für die Belohnungsvideos, Push-Benachrichtigungen für Duelle, Store-Texte und Screenshots.

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
- **RPC-Funktionen:** `profil_anlegen`, `duell_herausfordern`, `runde_starten`, `runde_abschliessen`, `duell_aufgeben`, `konto_loeschen`; fürs Dojo `liga_melden`, `liga_stand` (Tabelle `dojo_liga`). Geschrieben wird nur über diese Funktionen; sie prüfen, wer am Zug ist.
- **Schema:** `supabase/migrations/`.

## Fragen melden

Nach jeder beantworteten Frage (außer im Blitz) steht im Ergebnis-Banner der Link „Frage melden“. Der Dialog fragt nach dem Grund (Antwort ist falsch, Frage ist unklar, Tippfehler) und einer optionalen Erklärung mit bis zu 200 Zeichen. Gespeichert wird in der Supabase-Tabelle `meldungen`: Frage-ID, Grund, Text, die angetippte Antwort, ob sie als richtig gewertet wurde, der Spielmodus und die App-Version (`VERSION` in `js/app.js`). Keine Nutzer-ID, keine Gerätedaten; ein Account ist nicht nötig, die Rolle `anon` darf nur einfügen.

Meldungen ansehen: im Supabase-Dashboard das Projekt `senpai-quiz` öffnen, dann **Table Editor → meldungen** (neueste zuerst nach `erstellt` sortieren) oder im **SQL Editor**:

```sql
select erstellt, frage_id, grund, text, antwort, als_richtig, modus, version
from public.meldungen order by erstellt desc;
```

Die Frage-ID findet man in `data/fragen.json` oder `fragen.md`. Erledigte Meldungen kann man dort löschen; aus der App heraus geht das nicht.

## Anonyme Zählung

Die App zählt Starts und beendete Runden in der Supabase-Tabelle `ereignisse` (`ereignis()` in `js/app.js`, `ereignisMelden()` in `js/online.js`, Migration `ereignisse`). Übertragen werden nur Art (`start` oder `runde`), bei Starts `tag_nr` (Tage seit dem ersten Start auf dem Gerät, höchstens 30, Datum in `profil.erstStart`), bei Runden der Modus, dazu Version und Zeitpunkt. Keine Nutzer- oder Geräte-ID; die Rolle `anon` darf nur einfügen. Fehler beim Zählen werden verschluckt.

Wiederkehr-Quote im SQL-Editor (Anteil der Geräte, die am Tag 1 bzw. Tag 7 nach dem ersten Start wieder starten, über alle Tage summiert):

```sql
select tag_nr, sum(anzahl) as starts,
       round(100.0 * sum(anzahl) / (select sum(anzahl) from public.ereignisse_tage where art = 'start' and tag_nr = 0), 1) as prozent_von_tag_0
from public.ereignisse_tage where art = 'start' group by tag_nr order by tag_nr;
```

Runden je Modus und Tag: `select * from public.ereignisse_tage where art = 'runde' order by tag desc;`. Die Sicht `ereignisse_tage` ist nur mit der Service-Rolle lesbar. Einträge älter als zwölf Monate sollten gelöscht werden (steht so in der Datenschutzerklärung, Abschnitt 6a).

