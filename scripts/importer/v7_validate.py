import json,sys
from pathlib import Path
d=json.loads(Path(sys.argv[1]).read_text(encoding="utf8")); qs=d.get("questions",[])
bad=[q["number"] for q in qs if q.get("confidence",0)<.9 or len(q.get("alternatives",[]))!=5]
print(json.dumps({"year":d.get("year"),"questions_found":len(qs),"ready":len(qs)-len(bad),"review":bad},ensure_ascii=False,indent=2))
