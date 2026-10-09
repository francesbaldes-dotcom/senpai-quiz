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
| `vendor/` | Supabase-JS (2.45.4), lokal eingebunden |
| `css/style.css` | Gestaltung (Manga-Look) |
| `css/fonts.css`, `fonts/` | Dela Gothic One und Rubik, lokal eingebunden (SIL Open Font License) |
| `assets/maskottchen.jpg` | Onigiri-Maskottchen (Higgsfield), Original mit 512 × 512 Pixeln |
| `assets/icon-180.png`, `assets/icon-512.png` | App-Icons; das 512er ist aus `maskottchen.jpg` erzeugt (auf 256 Farben reduziert) |
| `assets/favicon.ico`, `assets/favicon-32.png` | Favicons, aus `icon-180.png` erzeugt (Python mit Pillow) |
| `data/fragen.json` | Fragenkatalog |
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
- **Tagesquiz:** 5 Fragen pro Tag, für alle gleich (aus dem Datum berechnet), mit Streak. Das Ergebnis lässt sich teilen (Teilen-Menü des Geräts, sonst Zwischenablage): Datum, 🟩🟥-Kästchen je Frage, Stand, Serie ab 2 Tagen und der Link zur App. Beim ersten Teilen gibt es das Abzeichen „Teilgeist“.
- **Survival:** endlos, bis 3 Fehler gemacht sind
- **Blitz:** 60 Sekunden, so viele Fragen wie möglich

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
