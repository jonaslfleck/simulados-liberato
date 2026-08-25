import os,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/"data/extracted"
print("Modo seguro: este script somente lista questões aptas.")
count=0
for f in SRC.glob("*.json"):
    if f.name in ("manifest.json","index.json"): continue
    d=json.loads(f.read_text(encoding="utf8"))
    for q in d.get("questions",[]):
        ok=q.get("confidence",0)>=.9 and len(q.get("alternatives",[]))==5
        if ok: count+=1
print("Questões candidatas à publicação:",count)
print("Configure o cliente Supabase e a revisão humana antes de ativar inserts.")
