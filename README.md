# Senpai Quiz

Inoffizielles Anime- und Manga-Quiz. Prototyp als reine Web-App (HTML, CSS, JavaScript ohne Build-Schritt), damit sie später wie Resist the Cute mit Capacitor als iOS-App verpackt werden kann.

## Starten

Die App lädt `data/fragen.json` per `fetch`, braucht also einen kleinen Webserver:

```bash
python3 -m http.server 5190
```

Dann <http://localhost:5190> öffnen.

In Claude Code startet `.claude/launch.json` denselben Server für die Browser-Vorschau (Eintrag `senpai-quiz`).

## Aufbau

| Pfad | Inhalt |
|---|---|
| `index.html` | Einstieg |
| `js/app.js` | Spiellogik und alle Bildschirme |
| `js/online.js` | Supabase-Client für Accounts und Duelle |
| `vendor/` | Supabase-JS (2.45.4), lokal eingebunden |
| `css/style.css` | Gestaltung (Manga-Look) |
| `css/fonts.css`, `fonts/` | Dela Gothic One und Rubik, lokal eingebunden (SIL Open Font License) |
| `assets/maskottchen.jpg` | Onigiri-Maskottchen (Higgsfield) |
| `data/fragen.json` | Fragenkatalog |
| `fragen.md` | Lesbare Fragenliste zum Korrekturlesen, erzeugt mit `python3 scripts/fragen_liste.py` |

## Fragenformat

Die richtige Antwort steht immer an erster Stelle (`"correct": 0`), die App mischt beim Anzeigen. Typen: `multiple_choice`, `true_false`, `emoji`, `order` (Antworten in richtiger Reihenfolge, optional `years`), `estimate` (`answer`, `min`, `max`, `tolerance` = Abstand, der noch halbe Punkte gibt), `who_am_i` (drei `hints`, alle 5 Sekunden wird einer mehr sichtbar; früh richtig raten gibt +25 Punkte pro verdecktem Hinweis).

## Spielmodi

- **Klassisch:** Kategorie und Schwierigkeit wählen, 10 Fragen, 15 Sekunden pro Frage, Joker (50:50, +10 s, Überspringen)
- **Tagesquiz:** 5 Fragen pro Tag, für alle gleich (aus dem Datum berechnet), mit Streak
- **Survival:** endlos, bis 3 Fehler gemacht sind
- **Blitz:** 60 Sekunden, so viele Fragen wie möglich

Punkte: 100 pro richtiger Antwort plus bis zu 75 Zeitbonus, mal Combo (×2 ab 3 richtigen am Stück, ×3 ab 5). XP = Punkte ÷ 10. Fortschritt wird nur lokal im Browser gespeichert.

## Duelle

Duelle gegen Freunde laufen wie bei Quizduell: **6 Runden mit je 3 Fragen**, abwechselnd und ohne gleichzeitig online sein zu müssen. Wer am Zug ist, wählt die Kategorie aus drei Vorschlägen und spielt zuerst, danach spielt der Gegner dieselben Fragen und wählt die nächste Kategorie. Die Ergebnisse des Gegners für eine Runde werden erst sichtbar, wenn man sie selbst gespielt hat.

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
