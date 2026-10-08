"""Erzeugt aus data/fragen.json eine lesbare Liste (fragen.md) zum Korrekturlesen."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
daten = json.loads((ROOT / "data" / "fragen.json").read_text(encoding="utf-8"))
kategorien = daten["kategorien"]
stufen = daten["schwierigkeiten"]
typen = {
    "multiple_choice": "Auswahl",
    "true_false": "Wahr/Falsch",
    "emoji": "Emoji-Rätsel",
    "order": "Reihenfolge",
    "estimate": "Schätzfrage",
    "who_am_i": "Wer bin ich?",
}

zeilen = [f"# Senpai Quiz – {len(daten['fragen'])} Fragen", ""]
zeilen.append("Die richtige Antwort ist **fett** und steht immer zuerst; die App mischt die Antworten.")
for stufe, name in stufen.items():
    fragen = [f for f in daten["fragen"] if str(f["difficulty"]) == stufe]
    zeilen += ["", f"## {name} ({len(fragen)} Fragen)"]
    for kat_id, kat_name in kategorien.items():
        teil = [f for f in fragen if f["category"] == kat_id]
        if not teil:
            continue
        zeilen += ["", f"### {kat_name}", ""]
        for f in teil:
            if f["type"] == "order":
                jahre = f.get("years") or [None] * len(f["answers"])
                loesung = " → ".join(f"{a} ({j})" if j else a for a, j in zip(f["answers"], jahre))
                antworten = f"**{loesung}**"
            elif f["type"] == "estimate":
                antworten = f"**{f['answer']}** (Schieberegler {f['min']}–{f['max']}, ±{f.get('tolerance', 2)} zählt als knapp)"
            else:
                antworten = " · ".join([f"**{f['answers'][0]}**"] + f["answers"][1:])
            frage = f["question"] if f["type"] != "who_am_i" else "Wer bin ich? " + " / ".join(f["hints"])
            zeilen.append(f"- `{f['id']}` *{typen[f['type']]}* – {frage}  ")
            zeilen.append(f"  {antworten}")

(ROOT / "fragen.md").write_text("\n".join(zeilen) + "\n", encoding="utf-8")
print("fragen.md geschrieben")
