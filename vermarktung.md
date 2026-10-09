# Senpai Quiz – Weg zur Vermarktung

Stand: 9. Oktober 2026. Grundlage: Code-Durchsicht, Test im Browser, Supabase-Projekt, Markt- und Konkurrenzrecherche (Quellen am Ende).

## 1. Wo die App heute steht

**Fertig und gut:**
- Klarer Manga-Look, eigenes Onigiri-Maskottchen mit 8 Stimmungen, das im Spiel reagiert. Das ist das stärkste Alleinstellungsmerkmal gegenüber allen gefundenen Konkurrenz-Apps.
- 4 Solo-Modi (Klassisch, Tagesquiz, Survival, Blitz), 6 Fragetypen, Joker, Combo, XP-Ränge, 9 Abzeichen, Streak.
- Freundes-Duelle wie bei Quizduell (6 Runden à 3 Fragen, asynchron) über Supabase, mit Einladungslink und -code. Server antwortet, Tabellen haben RLS, Security-Advisor zeigt nur erwartete Hinweise zu den RPC-Funktionen.
- Rechtlich sauber aufgestellt: eigene Fragen, keine offiziellen Bilder, Disclaimer im Info-Screen, keine Serien-Marke im Namen oder Icon.

**Lücken, die vor dem Launch zu schließen sind:**
| Thema | Befund | Warum es zählt |
|---|---|---|
| Fragenmenge | 200 Fragen, davon 50 auf Stufe Otaku | Nach 20 Runden ist alles gesehen. Konkurrenz wirbt mit 1.000 bis 5.000 Fragen. |
| Fragen-Abdeckung | Oshi no Ko kommt 17-mal vor, Evangelion, Cowboy Bebop, Dandadan, Tokyo Ghoul, Berserk, Vinland Saga, Blue Lock 0 bis 1-mal | Fans merken Schieflagen sofort. |
| Fragen-Tabelle Server | `fragen` in Supabase hat 183 Zeilen, `data/fragen.json` 200 | Duelle könnten andere Fragen ziehen als Solo. Prüfen und abgleichen. |
| Push-Benachrichtigungen | Keine. Duelle werden nur alle 15 s per Polling aktualisiert, solange der Bildschirm offen ist | Quizduell lebt von „Du bist dran“. Ohne Push schlafen Duelle ein. |
| Speicherung in der iOS-App | Spielstand nur in localStorage | In der Capacitor-Hülle kann iOS das löschen. Bei Resist the Cute war das Preferences-Plugin deshalb Pflicht. |
| Account | Anonym, an Gerät gebunden, weg bei App-Löschung | Für den Start okay. Später „Mit Apple anmelden“ zum Wiederherstellen. |
| Monetarisierung | Keine | Muss vor dem Store-Eintrag entschieden sein (Altersfreigabe, Datenschutz-Angaben). |
| Analytics | Keine | Ohne Retention-Zahlen (Tag 1, Tag 7) ist Marketing Blindflug. |
| Kleinigkeiten | `confirm()`-Dialoge (sehen in der nativen Hülle fremd aus), fehlendes Favicon, kein „Frage melden“-Knopf, keine Haptik, keine Sounds | Politur, aber im Store entscheiden Bewertungen. |
| Git | Duell-Funktion (online.js, vendor, 577 Zeilen in app.js) ist nicht committet | Erst sichern. |

## 2. Konkurrenz

**Kernbefund:** Es gibt keine deutschsprachige Anime-Quiz-App, und keine Anime-Quiz-App mit asynchronen Freundes-Duellen. Deutsche Nutzer fragen in Foren danach und bekommen die Antwort, es gebe keine. Die großen Quiz-Apps (Neues Quizduell, Trivia Crack) haben keine Anime-Kategorie.

**Direkte Konkurrenz (alle Englisch, alle klein):**
| App | Plattform | Modell | Besonderheit | Größe |
|---|---|---|---|---|
| Anime Quiz – Trivia Questions | iOS | Gratis + Abo 4,99 $/Woche oder 19,99 $/Jahr | 4-Bilder-Charakter-Raten, Level je Serie | 4,9 Sterne bei ~18 Bewertungen |
| Anime Quiz (Adam Balzan) | iOS | 0,99 $ Einmalkauf | 5.000+ Fragen, Enzyklopädie | neu, keine Bewertungen |
| Anime Trivia Pro | iOS | 0,99 $ | „Tausende Fragen“ | Reviews bemängeln falsche Antworten |
| OtaQuiz | iOS | Gratis | Opening-/OST-Raten | kaum Bewertungen |
| Anime Quiz: Brain & Trivia Game | Android | Gratis + Werbung | 1v1, Freunde herausfordern, Leaderboard | 10K+ Downloads |
| Guess the Anime Quiz (pokpakapps) | Android | Gratis + Werbung | Daily Challenge, Cloud-Save | 4,0 Sterne bei 1,57K Reviews |
| Guess the Anime / Ultimate Quiz (TalaDevs) | Android | Gratis + Werbung | Hangman, Bilderraten | 10K+ |

Keine davon kommt über „10K+“ bei Google Play. Wiederkehrende Kritik in den Reviews: falsche Antworten, zu viel Werbung, keine Übersetzung.

**Web-Konkurrenz (zeigt, was Fans spielen wollen):**
- Sporcle Anime: 24.000 Quizze, 31 Mio. Plays. Die Top-3 sind alle Bilder- oder Charakter-Raten.
- Anime Music Quiz: Openings raten, riesige Community, kein brauchbares Mobile-Angebot.
- Daily-Formate nach Wordle-Vorbild: Animedle, Mangadle, MALdle, Anime Heardle. Als native App existiert das kaum. Dein Tagesquiz trifft genau diesen Nerv.
- Deutsch: nur testedich.de und shonakid.de im Browser.

**Was das für Senpai Quiz heißt:**
1. Positionierung: „Das deutsche Anime-Quiz mit Duellen gegen Freunde.“ Niemand besetzt das.
2. Qualität als Verkaufsargument: „Jede Frage geprüft“ gegen die Fehler-Reviews der Konkurrenz. Dazu ein „Frage melden“-Knopf in der App.
3. Bilder-Raten geht ohne Lizenz nicht. Ersatz: „Wer bin ich?“ mit Hinweisen, Emoji-Rätsel, Zitate, Silhouetten oder eigene Illustrationen. Die ersten beiden gibt es schon.

**Zielgruppe DACH (belegte Zahlen):**
- Fast jede zweite Person der Gen Z und Millennials hat im letzten Jahr Anime oder Manga konsumiert, ein Viertel wöchentlich (Studie Appinio/THE AMBITION, Sept. 2026, 1.200 Befragte).
- Manga-Umsatz im deutschsprachigen Raum 2025: über 100 Mio. Euro.
- DoKomi 2025: über 200.000 Besucher. Leipziger Manga-Comic-Con 2026: 313.000. Connichi 2024: 27.000.
- Größter deutscher Anime-YouTube-Kanal: NinotakuTV mit rund 458.000 Abonnenten.
- Crunchyroll-Abos speziell für DACH sind nicht veröffentlicht. In Deutschland ist Netflix die meistgenutzte Anime-Plattform.

**Monetarisierung bei den Großen:**
- Trivia Crack: Werbung (Interstitial nach verlorenem Zug, Rewarded Video) plus Leben-Käufe. Rund die Hälfte des Umsatzes über Werbung. Hauptkritik: zu viel Werbung.
- Neues Quizduell: VIP-Abo 4,99 €/Monat plus Arena-Tickets bis 109,99 €. Starker Pay-to-Win-Backlash, 2 bis 3 Sterne.
- Lehre: Werbung freiwillig halten, Abo oder Einmalkauf nur für Komfort, nie für Vorteile im Duell.

## 3. Fahrplan

### Phase 0: Absichern und polieren (1 bis 2 Wochen)
1. Duell-Stand committen.
2. Fragen-Tabelle in Supabase mit `data/fragen.json` abgleichen, Import-Skript dafür ins Repo.
3. Tagesquiz-Ergebnis teilbar machen (Emoji-Raster wie Wordle, mit Link). Das ist der billigste Wachstumshebel, den die App haben kann.
4. „Frage melden“-Knopf auf dem Ergebnis-Banner, der in eine Supabase-Tabelle schreibt.
5. `confirm()` durch eigene Dialoge ersetzen, Favicon ergänzen, Haptik über Capacitor vorbereiten.
6. Spielstand über das Preferences-Plugin speichern (wie bei Resist the Cute), localStorage nur als Web-Fallback.
7. Fragen auf 400 bringen, Lücken bei Evangelion, Cowboy Bebop, Dandadan, Tokyo Ghoul, Berserk, Vinland Saga, Blue Lock, Haikyu, Solo Leveling, Frieren-Staffel 2, Chainsaw Man schließen. Ziel zum Store-Launch: 600, danach 50 pro Monat.

### Phase 1: Web-Soft-Launch und Testgruppe (Woche 2 bis 4)
1. GitHub Pages wie bei Resist the Cute, eigene Unterseite mit Datenschutz und Impressum (DSGVO, Supabase in Frankfurt).
2. Anonyme Anmeldung in Supabase einschalten, falls noch nicht geschehen, und Rate-Limits prüfen.
3. 20 bis 50 Tester aus Anime-Discords, dem eigenen Umfeld und Convention-Gruppen. Fragen: Welche Fragen sind falsch oder zu leicht? Wird das Tagesquiz am zweiten Tag gespielt? Kommen Duelle zustande?
4. Einfache Ereignis-Zählung in Supabase (Runde gestartet, Runde beendet, Tagesquiz gespielt, Duell gestartet) oder TelemetryDeck. Ziel-Kennzahlen: Tag-1-Retention über 35 %, Tag-7 über 15 %.

### Phase 2: App Store (Woche 4 bis 8)
1. Capacitor-Projekt nach dem Muster von Resist the Cute anlegen: Bundle-ID, Icon 1024 px, Startbildschirm, Privacy-Manifest, nur Hochformat.
2. Push-Benachrichtigungen für Duelle: Capacitor Push plus Supabase Edge Function oder OneSignal. Ein Trigger auf `duelle.am_zug` reicht für den Start.
3. Monetarisierung einbauen, Empfehlung:
   - Kostenlos mit freiwilligen Rewarded Videos (AdMob, wie bei Resist the Cute): extra Leben im Survival, zweiter Joker-Satz, Tagesquiz-Wiederholung.
   - „Senpai Pass“ als Einmalkauf 3,99 bis 4,99 €: werbefrei, alle Abzeichen-Statistiken, exklusive Maskottchen-Outfits. Kein Vorteil im Duell.
   - Kein Interstitial nach jeder Runde, kein Abo zum Start.
4. Store-Eintrag: Name „Senpai Quiz – Anime & Manga“, Untertitel „Das deutsche Anime-Quiz mit Duellen“, Keywords (anime, manga, quiz, otaku, naruto, one piece, quizduell, trivia, japan), 6 bis 8 Screenshots mit Maskottchen und je einem Modus, 15-Sekunden-Vorschauvideo. Disclaimer in der Beschreibung.
5. Altersfreigabe 4+ ohne Werbung, 12+ mit Werbung prüfen. App-Datenschutz: „Daten, die nicht mit dir verknüpft sind“ (Spielername, Geräte-ID).
6. TestFlight mit der Testgruppe aus Phase 1, dann Einreichung. Bei Rückfrage zu Guideline 5.2 auf eigene Fragen, eigenes Artwork und Disclaimer verweisen.

### Phase 3: Wachstum (ab Launch, laufend)
1. Jede Woche ein Fragenpaket, mit Datum sichtbar in der App („Neu diese Woche“).
2. Season-Rhythmus nutzen: neue Anime-Season im Oktober, Januar, April, Juli, jeweils ein Themenpaket plus Social-Content.
3. Conventions 2027: Leipziger Buchmesse / Manga-Comic-Con (März), DoKomi (Mai/Juni), AnimagiC (August), Connichi (September). Kein Stand nötig, Flyer mit QR-Code und Einladungscode reichen; Blitz-Runde als Live-Challenge in Gruppen.
4. Creator-Duelle: deutschen Anime-YouTubern und TikTokern einen persönlichen Einladungscode schicken („Schlag den Nino“). Die Duell-Funktion ist das Format dafür.
5. Englische Lokalisierung nach 3 Monaten Daten. Der englische Markt ist größer und die Konkurrenz dort schwach.
6. Android über Capacitor erst, wenn iOS läuft. Bis dahin deckt die Web-Version Android ab.

## 4. Content-Ideen

### In der App (Bindung)
- **Themenwochen:** Ghibli-Woche, Shōnen-Jump-Woche, 90er-Woche, Mangaka-Woche. Ein eigenes Abzeichen je Woche.
- **Zitate-Raten:** „Wer hat das gesagt?“ mit kurzen, selbst formulierten Paraphrasen (keine wörtlichen Lyrics oder langen Zitate).
- **Zeitstrahl-Modus:** Ordnen nach Erscheinungsjahr gibt es schon, ausbauen auf Staffeln und Filme einer Reihe.
- **Schätz-Fragen ausbauen:** Kapitelzahlen, Bände, Episoden, Kinoumsatz, Geburtsjahre von Mangaka.
- **Charakter-Steckbrief:** „Wer bin ich?“ mit 5 statt 3 Hinweisen auf Stufe Otaku.
- **Community-Fragen:** Nutzer reichen Fragen ein, geprüfte erscheinen mit Namen des Einsenders. Löst das Mengenproblem und bindet Superfans.
- **Saisonales Tagesquiz:** An Feiertagen und Serienjubiläen (One-Piece-Jahrestag, Ghibli-Gründung) ein Sonder-Tagesquiz.
- **Maskottchen-Outfits:** Onigiri mit Strohhut, Stirnband, Zauberstab als freischaltbare Belohnung. Lizenzfrei, solange es generische Gegenstände bleiben.
- **Ranglisten pro Woche:** Blitz- und Survival-Rekorde unter Freunden, ohne globale Pay-to-Win-Arena.

### Social Media (Reichweite, TikTok / Instagram Reels / YouTube Shorts)
1. **„Nur echte Otakus schaffen Frage 3“:** 3 Fragen in 15 Sekunden, Maskottchen reagiert panisch bei 5 Sekunden Rest, Antwort in den Kommentaren. Direkt aus dem Fragenkatalog produzierbar.
2. **„Wer bin ich?“ als Reel:** Drei Hinweise nacheinander einblenden, Stopp-Aufforderung „Pausiere, wenn du es weißt“.
3. **Emoji-Rätsel als Story-Sticker:** Instagram-Quiz-Sticker mit vier Antworten, täglich eins.
4. **Tagesquiz-Teilen:** Emoji-Raster der eigenen Runde mit Streak-Zahl. Nutzer posten das selbst, wenn die Grafik gut aussieht.
5. **Streit-Umfragen:** „Sub oder Dub?“, „Stärkster Shōnen-Endgegner?“, „Beste Ghibli-Verfilmung?“ Hohe Kommentarrate, keine Rechteprobleme.
6. **„Welcher Rang bist du?“:** Screenshot-Challenge Neuling bis Legende, mit Hashtag.
7. **Fakten-Karussells:** „5 Dinge, die du über Akira nicht wusstest“, aus den Otaku-Fragen aufbereitet.
8. **Onigiri als Figur:** Reaktions-Clips des Maskottchens auf aktuelle Anime-News, Sticker-Pack für WhatsApp und Telegram.
9. **Season-Vorschau:** „Diese 5 Serien starten im Januar, wie gut kennst du die Vorlagen?“
10. **Creator-Duell-Clips:** Aufgezeichnete Duelle gegen YouTuber, Ergebnis als Short.

### Außerhalb Social
- Deutsche Anime-Discords und Subreddits: Nicht werben, sondern Tagesquiz-Ergebnisse posten und auf Fragen-Fehler reagieren.
- Manga-Buchhandlungen und Verlage (Carlsen, Altraverse, Panini): Kooperation „Fragenpaket zur neuen Reihe“ gegen Erwähnung. Erst nach Launch mit Zahlen anfragen.
- Presse: anime2you.de, manga-passion.de, Ninotaku-Umfeld. Aufhänger: „erstes deutsches Anime-Quiz mit Duellen“.

## 5. Risiken
- **Fragenfehler** sind der häufigste Review-Killer der Konkurrenz. Zwei Korrekturleser pro Paket, Quelle je Frage im Datensatz hinterlegen.
- **Push und Duelle:** Ohne Push ist die Duell-Funktion in der Praxis tot. Nicht ohne launchen.
- **Apple-Review 5.2:** Risiko gering, da kein fremdes Bildmaterial. Trotzdem keine Serien-Logos in Screenshots.
- **Werbe-Überdruss:** Nur Rewarded Video, keine Interstitials. Die Konkurrenz zeigt, wie schnell das Bewertungen kostet.

## Quellen (Auswahl)
- App-Store-Einträge: apps.apple.com/us/app/id6478061232, id6757419374, id555594329, id732952775
- Google Play: play.google.com/store/apps/details?id=com.codedharmony.animequiz, com.pokpakapps.quizanimesauce, com.taladevs.guess.anime
- Nachfrage nach deutscher App: gutefrage.net/frage/deutschsprachige-anime-quiz-appkostenlos-android
- Sporcle Anime: sporcle.com/games/subcategory/anime
- Studie Anime & Manga in Deutschland 2026: retail-news.de/anime-manga-studie-milliardenmarkt-deutschland
- Manga-Umsatz: tagesspiegel.de/kultur/ist-der-manga-boom-vorbei-15285107.html
- DoKomi 2025: pcgameshardware.de (Besucherrekord), duesseldorfcongress.de Pressemitteilung
- Leipziger Buchmesse 2026: leipziger-buchmesse.de Abschluss-Pressemeldung
- Connichi 2024: wiesbaden.de Pressemitteilung Mai 2025
- Crunchyroll 21 Mio. Abos: anime2you.de/news/1009098
- Netflix Nr. 1 für Anime in DE: anime2you.de/news/1007628
- Trivia Crack Monetarisierung: thinkwithgoogle.com, admob.google.com Fallstudie
- Neues Quizduell Abo-Kritik: iphone-ticker.de/quizduell-ehemaliger-community-liebling-ertrinkt-in-abos-und-kaeufen-171990
- MAG Interactive Zwischenbericht Sept 2025 bis Mai 2026: mfn.se
- Apple Guideline 5.2: developer.apple.com/forums/thread/697240
- Urheberrecht Datenbanken: e-recht24.de/urheberrecht/13360-urheberrecht-datenbank.html
