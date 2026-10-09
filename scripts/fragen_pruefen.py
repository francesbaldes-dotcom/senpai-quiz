"""Prüft data/fragen.json auf Schema-Fehler, doppelte IDs, doppelte Antworten und Beinahe-Dubletten.

Aufruf: python3 scripts/fragen_pruefen.py [--schwelle 0.5]
Beinahe-Dubletten: zwei Fragen mit derselben richtigen Antwort, deren Fragetexte sich stark überlappen.
"""
import json, re, sys, collections
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
daten = json.loads((ROOT / "data" / "fragen.json").read_text(encoding="utf-8"))
fragen = daten["fragen"]
schwelle = float(sys.argv[sys.argv.index("--schwelle") + 1]) if "--schwelle" in sys.argv else 0.5

STOPP = set("""der die das den dem des ein eine einer eines einem einen und oder in im am an auf aus bei mit von vom zu zum zur
für ist sind war wird werden wie was wer wen wem wessen welche welcher welches welchen wo wann warum wofür womit heißt heisst
nennt man sich nicht als auch nur noch so es er sie ihr ihm ihn seine seiner sein ihre ihren ihrer um bis über unter durch
gegen ohne nach vor zwischen dass ob kann hat haben gibt serie anime manga film welche""".split())

def tokens(text):
    return {t for t in re.findall(r"[a-zäöüß0-9]+", text.lower()) if t not in STOPP and len(t) > 2}

fehler, warnungen = [], []
ids = collections.Counter(f["id"] for f in fragen)
for i, n in ids.items():
    if n > 1: fehler.append(f"doppelte ID {i} ({n}x)")

for f in fragen:
    t = f["type"]
    if f["category"] not in daten["kategorien"]: fehler.append(f"{f['id']}: unbekannte Kategorie {f['category']}")
    if f["difficulty"] not in (1, 2, 3): fehler.append(f"{f['id']}: Schwierigkeit {f['difficulty']}")
    if f.get("correct") != 0: fehler.append(f"{f['id']}: correct ist nicht 0")
    a = f.get("answers", [])
    if t in ("multiple_choice", "emoji", "who_am_i") and len(a) != 4: fehler.append(f"{f['id']}: {len(a)} Antworten bei {t}")
    if t == "true_false" and a not in (["Wahr", "Falsch"], ["Falsch", "Wahr"]): fehler.append(f"{f['id']}: Wahr/Falsch-Antworten {a}")
    if t == "who_am_i" and len(f.get("hints", [])) < 2: fehler.append(f"{f['id']}: zu wenige Hinweise")
    if t == "estimate":
        for k in ("answer", "min", "max"):
            if k not in f: fehler.append(f"{f['id']}: Schätzfrage ohne {k}")
        if "answer" in f and not (f["min"] <= f["answer"] <= f["max"]): fehler.append(f"{f['id']}: Antwort außerhalb von min/max")
    if t == "order" and "years" in f and len(f["years"]) != len(a): fehler.append(f"{f['id']}: years passt nicht zu answers")
    if t == "order" and "years" in f and f["years"] != sorted(f["years"]): fehler.append(f"{f['id']}: years nicht aufsteigend")
    if len({x.strip().lower() for x in a}) != len(a): fehler.append(f"{f['id']}: doppelte Antwort {a}")
    if not f.get("question", "").strip(): fehler.append(f"{f['id']}: leere Frage")

# Beinahe-Dubletten: gleiche richtige Antwort + hohe Textüberlappung
def schluessel(f):
    return str(f.get("answer", f["answers"][0])).strip().lower()
gruppen = collections.defaultdict(list)
for f in fragen:
    if f["type"] in ("true_false", "order"): continue
    gruppen[schluessel(f)].append(f)
for antwort, gruppe in gruppen.items():
    for i in range(len(gruppe)):
        for j in range(i + 1, len(gruppe)):
            a, b = gruppe[i], gruppe[j]
            ta = tokens(a["question"] + " " + " ".join(a.get("hints", [])))
            tb = tokens(b["question"] + " " + " ".join(b.get("hints", [])))
            if not ta or not tb: continue
            jacc = len(ta & tb) / len(ta | tb)
            if jacc >= schwelle:
                warnungen.append(f"{a['id']} ~ {b['id']} ({jacc:.2f}, Antwort „{antwort}“): {a['question'][:60]} | {b['question'][:60]}")
# exakt gleiche Fragetexte
texte = collections.defaultdict(list)
for f in fragen: texte[f["question"].strip().lower()].append(f["id"])
for t, l in texte.items():
    if len(l) > 1 and not t.startswith("wer bin ich"): fehler.append(f"gleicher Fragetext: {', '.join(l)}")

print(f"{len(fragen)} Fragen")
print("Schwierigkeit:", dict(sorted(collections.Counter(f['difficulty'] for f in fragen).items())))
print("Typen:", dict(collections.Counter(f['type'] for f in fragen)))
print("Kategorien:", dict(sorted(collections.Counter(f['category'] for f in fragen).items())))
print(f"\n{len(fehler)} Fehler")
for e in fehler: print("  ✗", e)
print(f"\n{len(warnungen)} Beinahe-Dubletten (Schwelle {schwelle})")
for w in warnungen: print("  ~", w)
sys.exit(1 if fehler else 0)
