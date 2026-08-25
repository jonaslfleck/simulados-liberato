import os,re,json,time,hashlib,argparse
from pathlib import Path
from urllib.parse import urljoin
import requests,fitz
from bs4 import BeautifulSoup
from dotenv import load_dotenv
load_dotenv(".env.import")
ROOT=Path(__file__).resolve().parents[2]
RAW=ROOT/"data/raw"; OUT=ROOT/"data/extracted"; RAW.mkdir(parents=True,exist_ok=True); OUT.mkdir(parents=True,exist_ok=True)
SOURCE=os.getenv("SOURCE_PAGE","https://www.liberato.com.br/provas-e-gabaritos-processos-seletivos-anteriores/")
H={"User-Agent":"SimuladosLiberatoV7/1.0 educational importer"}
def year_of(s):
 m=re.search(r'20\d{2}',s); return int(m.group()) if m else None
def discover():
 html=requests.get(SOURCE,headers=H,timeout=30).text; soup=BeautifulSoup(html,"html.parser"); out=[]
 for a in soup.select("a[href]"):
  label=" ".join(a.stripped_strings); url=urljoin(SOURCE,a["href"])
  if ".pdf" not in url.lower(): continue
  t=(label+" "+url).lower()
  kind="gabarito" if "gabarito" in t else "prova"
  out.append({"url":url,"label":label,"year":year_of(label+" "+url),"kind":kind,"source_page":SOURCE})
 return list({x["url"]:x for x in out}.values())
def safe(s): return re.sub(r"[^a-z0-9]+","-",s.lower()).strip("-")[:80]
def download(items):
 for x in items:
  name=f'{x["year"] or "sem-ano"}-{x["kind"]}-{safe(x["label"])}.pdf'; p=RAW/name
  if not p.exists():
   r=requests.get(x["url"],headers=H,timeout=90); r.raise_for_status(); p.write_bytes(r.content); time.sleep(.2)
  x["file"]=str(p.relative_to(ROOT)); x["sha256"]=hashlib.sha256(p.read_bytes()).hexdigest()
 return items
Q=re.compile(r"(?:^|\n)\s*(\d{1,2})\s*[.)]\s+",re.M); A=re.compile(r"(?:^|\n)\s*([A-E])\s*[.)]\s+",re.M|re.I)
def parse(item):
 doc=fitz.open(ROOT/item["file"]); text="\n".join(p.get_text("text") for p in doc)
 hits=list(Q.finditer(text)); questions=[]
 for i,h in enumerate(hits):
  n=int(h.group(1))
  if not 1<=n<=60: continue
  chunk=text[h.end():hits[i+1].start() if i+1<len(hits) else len(text)]
  opts=list(A.finditer(chunk))
  if len(opts)<4: continue
  alts=[]
  for j,o in enumerate(opts[:5]):
   end=opts[j+1].start() if j+1<len(opts) else len(chunk)
   alts.append({"letter":o.group(1).upper(),"content":chunk[o.end():end].strip()})
  stmt=chunk[:opts[0].start()].strip()
  questions.append({"number":n,"subject":"Língua Portuguesa" if n<=20 else "Matemática","statement":stmt,"alternatives":alts,"confidence":.98 if len(alts)==5 and len(stmt)>30 else .65})
 return {**item,"pages":len(doc),"questions":questions}
def main():
 ap=argparse.ArgumentParser(); ap.add_argument("--download",action="store_true"); ap.add_argument("--parse",action="store_true"); ap.add_argument("--all",action="store_true"); args=ap.parse_args()
 items=discover(); (OUT/"manifest-v7.json").write_text(json.dumps(items,ensure_ascii=False,indent=2))
 if args.download or args.all: items=download(items); (OUT/"manifest-v7.json").write_text(json.dumps(items,ensure_ascii=False,indent=2))
 if args.parse or args.all:
  for x in items:
   if x["kind"]!="prova" or "file" not in x: continue
   d=parse(x); (OUT/f'{x["year"]}-{safe(x["label"])}.json').write_text(json.dumps(d,ensure_ascii=False,indent=2))
if __name__=="__main__": main()
