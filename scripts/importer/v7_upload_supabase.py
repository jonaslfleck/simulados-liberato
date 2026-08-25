import os,json,argparse
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
load_dotenv(".env.import")
ROOT=Path(__file__).resolve().parents[2]; OUT=ROOT/"data/extracted"
url=os.getenv("SUPABASE_URL"); key=os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not url or not key: raise SystemExit("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.import")
s=create_client(url,key)
ap=argparse.ArgumentParser();ap.add_argument("file");ap.add_argument("--publish",action="store_true");args=ap.parse_args()
d=json.loads(Path(args.file).read_text(encoding="utf8"))
qs=[q for q in d.get("questions",[]) if q["confidence"]>=.9 and len(q["alternatives"])==5]
exam=s.table("exams").insert({"year":d.get("year"),"shift":"diurno","title":d.get("label"),"total_questions":len(qs),"import_status":"review","source_url":d.get("url")}).execute().data[0]
for q in qs:
 qr=s.table("questions").insert({"exam_id":exam["id"],"question_number":q["number"],"subject":q["subject"],"statement":q["statement"],"confidence":q["confidence"],"source_pdf_url":d.get("url"),"review_required":False}).execute().data[0]
 s.table("alternatives").insert([{"question_id":qr["id"],"letter":a["letter"],"content":a["content"]} for a in q["alternatives"]]).execute()
if args.publish: s.table("exams").update({"import_status":"published"}).eq("id",exam["id"]).execute()
print("Importado:",exam["id"],"questões:",len(qs),"status:","published" if args.publish else "review")
