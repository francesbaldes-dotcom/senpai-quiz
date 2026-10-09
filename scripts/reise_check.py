"""Prüft, ob jede Station der Heldenreise (data/reise.json) genug Fragen in data/fragen.json findet.

Regel: Der Pool einer Station soll mindestens doppelt so groß sein wie ihre Fragenzahl,
damit Wiederholungen frische Fragen bekommen. Pflicht-Typen der Bosse werden einzeln geprüft,
ebenso die Geheimpfade (Stufe 3) und die Zweite Reise (alle Stationen auf Stufe 2 und 3).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
fragen = json.loads((ROOT / "data" / "fragen.json").read_text(encoding="utf-8"))["fragen"]
reise = json.loads((ROOT / "data" / "reise.json").read_text(encoding="utf-8"))

ALLE_TYPEN = ["multiple_choice", "true_false", "emoji", "who_am_i", "estimate", "order"]


def pool(kategorien, stufen, typen):
    return [
        f for f in fragen
        if (not kategorien or f["category"] in kategorien)
        and f["difficulty"] in stufen
        and f["type"] in typen
    ]


probleme = 0
gesamt = 0
for k in reise["kapitel"]:
    stationen = [dict(s, _id=f"{k['nr']}.{i + 1}") for i, s in enumerate(k["stationen"])]
    stationen.append(dict(k["boss"], _id=f"{k['nr']}.Boss", _boss=True))
    for s in stationen:
        kategorien = s.get("kategorien", k.get("kategorien", []))
        stufen = s.get("schwierigkeit", k.get("schwierigkeit", [1, 2, 3]))
        typen = s.get("typen", k.get("typen", ALLE_TYPEN))
        anzahl = s.get("fragen", 7 if s.get("_boss") else 5)
        p = pool(kategorien, stufen, typen)
        gesamt += anzahl
        status = "ok" if len(p) >= 2 * anzahl else "ZU WENIG"
        if status != "ok":
            probleme += 1
        print(f"{s['_id']:>8} {s.get('titel') or s.get('name'):<22} {len(p):>4} Fragen für {anzahl:>2}  {status}")
        for typ in s.get("pflicht", []):
            n = len([f for f in p if f["type"] == typ])
            if n == 0:
                probleme += 1
                print(f"         Pflichttyp {typ} fehlt im Pool")
for a in reise["akte"]:
    g = a.get("geheim")
    if not g:
        continue
    p = pool([g["kategorie"]], [3], ALLE_TYPEN)
    anzahl = g.get("fragen", 5)
    gesamt += anzahl
    status = "ok" if len(p) >= 2 * anzahl else "ZU WENIG"
    if status != "ok":
        probleme += 1
    print(f"{'Akt ' + str(a['nr']):>8} {'Geheimpfad: ' + g['titel']:<30} {len(p):>4} Fragen für {anzahl:>2}  {status}")
# Zweite Reise: alle Stationen auf Stufe 2 und 3
for k in reise["kapitel"]:
    for i, s in enumerate(k["stationen"] + [k["boss"]]):
        kategorien = s.get("kategorien", k.get("kategorien", []))
        typen = s.get("typen", k.get("typen", ALLE_TYPEN))
        anzahl = s.get("fragen", 7 if i == len(k["stationen"]) else 5)
        p = pool(kategorien, [2, 3], typen)
        if len(p) < anzahl:
            probleme += 1
            print(f"Zweite Reise {k['nr']}.{i + 1}: nur {len(p)} Fragen für {anzahl}")
print(f"\n{gesamt} Fragen für einen kompletten Durchlauf, {len(fragen)} im Katalog, {probleme} Problem(e)")
raise SystemExit(1 if probleme else 0)
