#!/usr/bin/env python3
"""Tonspuren fürs Senpai Dojo: spricht Kana, Wörter und Sätze aus data/dojo.json mit der macOS-Stimme Kyoko
und legt sie als AAC (m4a, 48 kbit/s) in assets/dojo/ton/ ab. Dateiname = Rōmaji-Slug (siehe tonSlug in js/dojo.js).

  python3 scripts/dojo_ton.py          # nur fehlende Dateien erzeugen
  python3 scripts/dojo_ton.py --neu    # alle neu erzeugen
"""
import json, re, subprocess, sys, tempfile, pathlib

WURZEL = pathlib.Path(__file__).resolve().parent.parent
ZIEL = WURZEL / 'assets' / 'dojo' / 'ton'
STIMME = 'Kyoko'
TEMPO = 150  # Wörter pro Minute, etwas langsamer als normal


def slug(romaji):
    s = romaji.lower()
    for a, b in (('ā', 'aa'), ('ī', 'ii'), ('ū', 'uu'), ('ē', 'ee'), ('ō', 'oo')):
        s = s.replace(a, b)
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def katakana(text):
    # Einzelne Hiragana als Katakana sprechen lassen, sonst liest die Stimme は als „wa“ und へ als „e“
    return ''.join(chr(ord(c) + 0x60) if 'ぁ' <= c <= 'ゖ' else c for c in text)


def main():
    neu = '--neu' in sys.argv
    daten = json.loads((WURZEL / 'data' / 'dojo.json').read_text(encoding='utf-8'))
    eintraege = {}  # slug → Text

    def merke(romaji, text):
        s = slug(romaji)
        if not s:
            return
        if s in eintraege and eintraege[s] != text:
            print(f'Achtung: {s} doppelt belegt: {eintraege[s]} / {text}')
            return
        eintraege[s] = text

    for g in daten['gruppen']:
        for l in g['lektionen']:
            for z in l['zeichen']:
                if len(z) > 3 and z[3]:
                    continue  # nur lernen, keine Lesung
                merke(z[1], katakana(z[0]))
    for k in daten['kapitel']:
        for w in k['woerter']:
            merke(w[1], w[0])
        for s in k.get('saetze', []):
            merke(s[1], s[0])

    ZIEL.mkdir(parents=True, exist_ok=True)
    erzeugt = 0
    with tempfile.TemporaryDirectory() as tmp:
        aiff = pathlib.Path(tmp) / 'ton.aiff'
        for s, text in sorted(eintraege.items()):
            datei = ZIEL / f'{s}.m4a'
            if datei.exists() and not neu:
                continue
            subprocess.run(['say', '-v', STIMME, '-r', str(TEMPO), '-o', str(aiff), text], check=True)
            subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '48000', str(aiff), str(datei)], check=True, capture_output=True)
            erzeugt += 1
    print(f'{len(eintraege)} Tonspuren, {erzeugt} neu erzeugt, in {ZIEL}')


if __name__ == '__main__':
    main()
