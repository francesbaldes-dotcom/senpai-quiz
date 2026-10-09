# Senpai Quiz

Inoffizielles Anime- und Manga-Quiz. Prototyp als reine Web-App (HTML, CSS, JavaScript ohne Build-Schritt), damit sie später wie Resist the Cute mit Capacitor als iOS-App verpackt werden kann.

## Starten

Die App lädt `data/fragen.json` per `fetch`, braucht also einen kleinen Webserver:

```bash
python3 -m http.server 5190
```

Dann <http://localhost:5190> öffnen.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `index.html` | Einstieg |
| `js/app.js` | Spiellogik und alle Bildschirme |
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

## Belohnungswerbung

Werbevideos gibt es nur freiwillig gegen eine Belohnung (`js/werbung.js`). Im Browser läuft eine Attrappe mit 5-Sekunden-Countdown; in der iPhone-App kommt dort AdMob hinein (`@capacitor-community/admob`, wie bei Resist the Cute).

- **Joker zurückholen:** Ein benutzter Joker lässt sich einmal pro Runde per Video wieder auffüllen. Die Uhr der Frage steht so lange still.
- **Zweite Chance:** Im Survival einmal pro Runde mit 1 Leben weiterspielen.
- **XP verdoppeln:** auf dem Ergebnis-Bildschirm, einmal pro Runde.
- **Serie retten:** Wer das Tagesquiz genau einen Tag verpasst hat (Serie ab 2 Tagen), kann sie per Video erhalten.

Punkte: 100 pro richtiger Antwort plus bis zu 75 Zeitbonus, mal Combo (×2 ab 3 richtigen am Stück, ×3 ab 5). XP = Punkte ÷ 10. Fortschritt wird nur lokal im Browser gespeichert.
