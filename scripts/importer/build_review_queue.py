import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/"data/extracted"; OUT=ROOT/"data/review"
OUT.mkdir(parents=True,exist_ok=True)
queue=[]
for f in SRC.glob("*.json"):
    if f.name in ("manifest.json","index.json"): continue
    try:
        d=json.loads(f.read_text(encoding="utf8"))
        for q in d.get("questions",[]):
            problems=[]
            if q.get("confidence",0)<.9: problems.append("low_confidence")
            if len(q.get("alternatives",[]))!=5: problems.append("alternatives_count")
            if len(q.get("statement",""))<20: problems.append("short_statement")
            if problems: queue.append({"source":str(f.relative_to(ROOT)),"year":d.get("year"),"question":q,"problems":problems})
    except Exception as e: queue.append({"source":str(f.relative_to(ROOT)),"error":str(e)})
(OUT/"queue.json").write_text(json.dumps(queue,ensure_ascii=False,indent=2),encoding="utf8")
print(f"{len(queue)} itens para revisão")
