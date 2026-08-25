import json,sys
from pathlib import Path
p=Path(sys.argv[1]); d=json.loads(p.read_text(encoding="utf8"))
print("-- Revise antes de executar. Gerado a partir de extração validada.")
print("-- Questões:",len(d.get("questions",[])))
for q in d.get("questions",[]):
    if q.get("confidence",0)<.9 or len(q.get("alternatives",[]))!=5: continue
    print(f"-- Q{q['number']} pronta para inserir após associar exam_id")
