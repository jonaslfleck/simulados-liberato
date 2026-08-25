import json,sys
from pathlib import Path
def validate(path):
 d=json.loads(Path(path).read_text(encoding="utf8")); qs=d.get("questions",[])
 nums=[q.get("number") for q in qs]
 issues=[]
 if len(set(nums))!=len(nums): issues.append("duplicated_numbers")
 if nums and nums!=sorted(nums): issues.append("unordered_numbers")
 for q in qs:
  if len(q.get("alternatives",[]))!=5: issues.append(f"Q{q.get('number')}: alternatives")
  if q.get("confidence",0)<.9: issues.append(f"Q{q.get('number')}: confidence")
 print(json.dumps({"questions":len(qs),"issues":issues,"valid":not issues},ensure_ascii=False,indent=2))
if __name__=="__main__": validate(sys.argv[1])
