# Senpai Quiz – Prüfung auf Markttauglichkeit

Stand: 9. Oktober 2026, spätabends (nach den Sofortmaßnahmen, siehe unten). Geprüft: Repo (Commit 8f0f169), Live-Seite, Supabase-Projekt, Rechtstexte, Durchlauf im Browser (375 × 812).

## Urteil in einem Satz

Als **Web-Beta für Tester** ist die App bereit, sobald zwei Kleinigkeiten erledigt sind. Für den **App Store** fehlt noch die komplette native Schicht, und die Kauf-Freischaltung ist in der jetzigen Form nicht sicher.

## Was gut ist

- **Inhalt:** 1.500 Fragen in 10 Kategorien, 362 davon auf Otaku-Niveau. Faktenprüfung mit Skript und dokumentierten Korrekturen (über 100 Korrekturen in 9 Prüfläufen). Das ist mehr als jede gefundene Konkurrenz-App glaubhaft bietet.
- **Spieltiefe:** 5 Modi plus Heldenreise (50 Stationen, 10 Bosse, Geheimpfade, Zweite Reise), Duelle, 25 Abzeichen, Teilen mit Bild. Ein Grund zum Wiederkommen fehlt nicht mehr.
- **Dojo:** Japanisch-Lernen mit Spaced Repetition, Gürtelprüfung, Wochenliga. Eigenständiges Kaufargument, das keine Quiz-App hat.
- **Gestaltung:** Durchgängiger Manga-Look, 20 Maskottchen-Posen, eigene Icons und Embleme, Icon 1024 und Splash für iOS liegen bereit.
- **Recht:** Impressum, Datenschutzerklärung (14 Abschnitte, Supabase, AdMob, App Store, Kinder) und Nutzungsbedingungen mit korrekten Abo-Angaben (Preis, Verlängerung, 24-Stunden-Frist, Kündigung in iOS-Einstellungen, Erstattung über Apple). Verlinkt im Info-Screen, beim Account-Anlegen und im Kaufbildschirm.
- **Server:** Zeilenschutz auf allen Tabellen, Schreibzugriffe nur über Funktionen, Spielernamen-Sperrliste auf Client und Server, Fragen-melden-Kanal. Keine kritischen Advisor-Hinweise.
- **Technik:** Keine Konsolenfehler, keine Abstürze im Durchlauf, relative Pfade, Manifest, Favicon.

## Blocker für den App Store

| # | Problem | Warum es blockt | Lösung |
|---|---|---|---|
| 1 | **Kein natives Projekt.** Kein `ios/`, kein Capacitor, kein `package.json`. | Ohne Hülle kein Store. | Capacitor nach dem Muster von Resist the Cute aufsetzen (Preferences, Haptics, Splash). |
| 2 | **Kauf-Freischaltung nur lokal.** `dojoFrei()` in `js/dojo.js` vertraut `profil.dojo.frei` aus dem Gerätespeicher. Die Server-Spalte `dojo_bis` existiert, aber nichts schreibt sie. | In der iOS-App lässt sich der Spielstand per Backup bearbeiten, dann ist das Dojo ohne Kauf offen. Apple prüft das nicht, aber es ist Umsatzverlust ab Tag 1. | RevenueCat anbinden, beim Start das Entitlement abfragen, lokales Flag nur als Cache mit Ablauf. „Käufe wiederherstellen“-Knopf in den Kaufbildschirm. |
| 3 | **Kein In-App-Kauf, keine Werbung, kein Push.** `kauf.js` und `werbung.js` sind Attrappen, Push gibt es nicht. | Duelle ohne „Du bist dran“ schlafen ein, Monetarisierung existiert nicht. | RevenueCat, AdMob mit UMP-Einwilligung (wie bei Resist the Cute), Capacitor Push plus Edge Function auf `duelle.am_zug`. |
| 4 | **Store-Material fehlt.** Keine Screenshots, kein Vorschauvideo, keine Store-Texte, kein `appstore/`-Ordner. | Ohne geht keine Einreichung. | Nach Fertigstellung der Hülle, wie mit der Grafik-Session vereinbart. |

## Vor dem Tester-Rollout (Web) erledigen

1. ~~Server nachziehen.~~ Erledigt: Duell-Tabelle auf 1.451 Fragen (Migration `fragen_daten_1500`).
2. ~~„Prototyp · 1500 Fragen“ ersetzen.~~ Erledigt: Info-Screen zeigt „Version 0.1.0 · 1.500 Fragen“.
3. **Rechtstexte bestätigen.** Name, Anschrift und die Adresse francesbaldes+senpai@gmail.com sind aus Schwesterprojekten übernommen, nicht von dir freigegeben. Der Gmail-Alias funktioniert ohne Einrichtung, aber ein Filter „+senpai“ ins eigene Label lohnt sich.

## Risiken, die keine Blocker sind

- **Startseite überladen.** Hero, Lexikon-Link, Heldenreise, Dojo, Tagesquiz, Klassisch, Survival, Blitz: vier Bildschirmhöhen auf dem iPhone. Neue Nutzer sehen die Modi erst nach Scrollen. Empfehlung: Heldenreise und Dojo in die Tab-Leiste, Startseite auf Tagesquiz plus drei Modi kürzen.
- **Positionierung.** Mit dem Dojo ist es nicht mehr nur ein Quiz. Für Store-Titel und Screenshots muss klar sein, ob „Anime-Quiz mit Japanisch-Bonus“ oder „Anime-Quiz und Japanisch-Trainer“. Empfehlung: Quiz bleibt Hauptsache, Dojo ist das Kaufargument im dritten Screenshot.
- ~~Startladevolumen rund 2 MB.~~ Erledigt: Nur noch die fünf Stimmungen vorgeladen, die während einer Frage wechseln; die übrigen 15 laden bei Bedarf. Bleiben rund 500 KB JSON beim Start.
- **Kein Offline-Betrieb der Web-Version.** Ohne Service Worker zeigt die Home-Bildschirm-Version ohne Netz „Lade Fragen“. Für Tester über die Pages-URL fällt das auf, in der App nicht.
- ~~Keine Ereigniszählung.~~ Erledigt: Tabelle `ereignisse` zählt Starts (mit Tagen seit Erststart, ohne Kennung) und beendete Runden je Modus. Abfrage für Tag-1/Tag-7 steht im README unter „Anonyme Zählung“, Datenschutzerklärung Abschnitt 6a ergänzt.
- **Account gerätegebunden.** App löschen = Duelle, Liga und Lernstand weg. Der Kauf ist über Apple wiederherstellbar, der Rest nicht. Für Version 1 vertretbar, in den Nutzungsbedingungen steht es. Später „Mit Apple anmelden“.
- **Fragen-Prüfskript** meldet 7 sehr ähnliche Fragenpaare (Emoji-Rätsel, Verlagsfragen). Keine Fehler, aber im Tagesquiz könnten zwei fast gleiche Fragen hintereinander kommen.
- **Keine Quelle je Frage.** 1.500 Fragen ohne Quellenfeld. Die Faktenprüfung per Skript fängt viel ab, Fehler-Reviews bleiben aber das größte Risiko der Konkurrenz.
- **Doppelte Migrationen.** `kategorien_zehn` und `fragen_daten_600` stehen je zweimal in der Server-Historie, offenbar von zwei Sessions eingespielt. Harmlos, weil Upserts, aber ein Zeichen, dass die Absprache fehlt.

## Prüfung gegen Apple-Richtlinien

- **5.2 Geistiges Eigentum:** Nur Textfragen, eigenes Maskottchen, keine Serien-Marke in Name oder Icon, Disclaimer in Impressum und Info. Risiko gering.
- **3.1.1 In-App-Kauf:** Lerninhalte müssen über Apple laufen, Web-Kauf ist korrekt gesperrt. Abo-Pflichtangaben (Preis, Laufzeit, Verlängerung, Kündigung) stehen im Kaufbildschirm. Fehlt: „Käufe wiederherstellen“.
- **5.1.1 Datenschutz:** Datenschutzerklärung vorhanden, beschreibt Supabase, AdMob, App Store. Privacy-Manifest kommt mit Capacitor. App-Datenschutz-Angaben: „Daten, die nicht mit dir verknüpft sind“ (Spielername, Geräte-ID, Kaufverlauf über Apple).
- **1.2 Nutzerinhalte:** Spielernamen sind von anderen sichtbar. Sperrliste vorhanden. Eine Melde- oder Blockierfunktion für Spieler gibt es nicht, bei reinen Namen reicht die Sperrliste erfahrungsgemäß.
- **Altersfreigabe:** 4+ ohne Werbung, mit AdMob 12+ wegen Werbeinhalten prüfen.

## Reihenfolge bis zur Einreichung

1. Server nachziehen, „Prototyp“ raus, Rechtstexte freigeben. Dann Tester-Link verschicken. **1 Tag.**
2. Capacitor-Projekt, Preferences, Splash, Icon, Privacy-Manifest. Build auf dem eigenen iPhone. **2 bis 3 Tage.**
3. RevenueCat mit Produkt-IDs `de.senpaiquiz.dojo.monat` und `.lebenslang`, Entitlement-Prüfung, Wiederherstellen, Webhook auf `dojo_bis`. Sandbox-Test. **3 bis 4 Tage.**
4. Push für Duelle. **2 Tage.**
5. AdMob mit Einwilligung, Datenschutz-Knopf „Werbe-Einwilligung“ unter Info. **1 bis 2 Tage.**
6. Startseite entschlacken (Ereigniszählung und Stimmungsbilder sind erledigt). **1 Tag.**
7. Store-Texte, Screenshots, Vorschauvideo, Altersfreigabe, App-Datenschutz. TestFlight mit den Web-Testern. **3 Tage.**
8. Einreichung. Erfahrungswert: eine Ablehnungsrunde einplanen.

Realistisch **drei bis vier Wochen** bis zur ersten Einreichung, wenn die Sessions parallel arbeiten wie heute.
