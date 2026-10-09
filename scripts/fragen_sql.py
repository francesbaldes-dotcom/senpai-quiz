"""Erzeugt aus data/fragen.json die Fragenliste für den Duell-Server (Supabase-Tabelle public.fragen).

Für Duelle zählen nur schnelle Fragetypen. Neue Fragen im Katalog: Skript ausführen und die erzeugte
SQL-Datei als Migration im Supabase-Projekt senpai-quiz einspielen.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DUELL_TYPEN = ("multiple_choice", "true_false", "emoji", "who_am_i")

daten = json.loads((ROOT / "data" / "fragen.json").read_text(encoding="utf-8"))
werte = [
    f"('{f['id']}','{f['category']}',{f['difficulty']},'{f['type']}')"
    for f in daten["fragen"]
    if f["type"] in DUELL_TYPEN
]
sql = (
    "insert into public.fragen (id, kategorie, schwierigkeit, typ) values\n"
    + ",\n".join(werte)
    + "\non conflict (id) do update set kategorie = excluded.kategorie, "
    "schwierigkeit = excluded.schwierigkeit, typ = excluded.typ;\n"
)
ziel = ROOT / "supabase" / "fragen_daten.sql"
ziel.write_text(sql, encoding="utf-8")
print(f"{len(werte)} Fragen → {ziel.relative_to(ROOT)}")
