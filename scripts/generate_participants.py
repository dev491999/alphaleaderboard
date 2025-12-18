#!/usr/bin/env python3
import csv
import json
from pathlib import Path

csv_path = Path(__file__).parent.parent / 'alphaparticipants.csv'
json_path = Path(__file__).parent.parent / 'participants.json'

rows = []
with csv_path.open(newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    headers = [h.strip() for h in reader.fieldnames]
    for r in reader:
        rows.append({k.strip(): (v.strip() if v is not None else '') for k,v in r.items()})

out = {}
for r in rows:
    bib = r.get('Bib') or r.get('BIB') or ''
    if not bib:
        continue
    name = r.get('Name','').strip()
    gender = r.get('Gender','').strip() if 'Gender' in rows[0] else r.get('gender','').strip() if 'gender' in rows[0] else ''
    out[bib] = {'name': name, 'gender': gender}

with json_path.open('w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print(f'Wrote {len(out)} participants to {json_path}')