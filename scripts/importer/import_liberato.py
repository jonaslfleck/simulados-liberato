import argparse,json,re,hashlib,os,time
from pathlib import Path
from urllib.parse import urljoin,urlparse
import requests
import fitz
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[2]
RAW=ROOT/"data/raw"; OUT=ROOT/"data/extracted"
RAW.mkdir(parents=True,exist_ok=True); OUT.mkdir(parents=True,exist_ok=True)
SOURCE_PAGE=os.getenv("SOURCE_PAGE","https://www.liberato.com.br/provas-e-gabaritos-processos-seletivos-anteriores/")
HEADERS={"User-Agent":"SimuladosLiberatoImporter/2.0 (educational; source attribution preserved)"}

def slug(s):
    return re.sub(r"[^a-z0-9]+","-",s.lower()).strip("-")

def discover():
    html=requests.get(SOURCE_PAGE,headers=HEADERS,timeout=30).text
    soup=BeautifulSoup(html,"html.parser")
    rows=[]
    for a in soup.find_all("a",href=True):
        href=urljoin(SOURCE_PAGE,a["href"])
        text=" ".join(a.stripped_strings)
        if ".pdf" in href.lower() or "prova" in text.lower() or "gabarito" in text.lower():
            if "liberato.com.br" in urlparse(href).netloc:
                kind="gabarito" if "gabarito" in text.lower() or "gabarito" in href.lower() else "prova"
                year=re.search(r"(20\d{2})",text+" "+href)
                rows.append({"label":text or Path(urlparse(href).path).name,"url":href,"kind":kind,"year":int(year.group(1)) if year else None})
    unique={r["url"]:r for r in rows}
    return list(unique.values())

def download(rows):
    manifest=[]
    for r in rows:
        if ".pdf" not in r["url"].lower(): continue
        name=f"{r['year'] or 'unknown'}-{r['kind']}-{slug(r['label'])[:70]}.pdf"
        path=RAW/name
        if not path.exists():
            res=requests.get(r["url"],headers=HEADERS,timeout=60); res.raise_for_status()
            path.write_bytes(res.content); time.sleep(.3)
        r={**r,"file":str(path.relative_to(ROOT)),"sha256":hashlib.sha256(path.read_bytes()).hexdigest()}
        manifest.append(r)
    (OUT/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf8")
    return manifest

def pdf_text(path):
    doc=fitz.open(path); pages=[]
    for i,p in enumerate(doc):
        pages.append({"page":i+1,"text":p.get_text("text")})
    return pages

QSTART=re.compile(r"(?:^|\n)\s*(\d{1,2})\s*[.)]\s+",re.M)
OPT=re.compile(r"(?:^|\n)\s*([A-Ea-e])\s*[.)]\s+",re.M)

def parse_questions(pages):
    full="\n".join(p["text"] for p in pages)
    hits=list(QSTART.finditer(full))
    questions=[]
    for ix,h in enumerate(hits):
        num=int(h.group(1))
        if not 1<=num<=60: continue
        chunk=full[h.end():hits[ix+1].start() if ix+1<len(hits) else len(full)]
        opts=list(OPT.finditer(chunk))
        if len(opts)<2: continue
        statement=chunk[:opts[0].start()].strip()
        alternatives=[]
        for j,o in enumerate(opts[:5]):
            end=opts[j+1].start() if j+1<len(opts) else len(chunk)
            alternatives.append({"letter":o.group(1).upper(),"text":chunk[o.end():end].strip()})
        confidence=0.95 if len(alternatives)==5 and statement else 0.55
        questions.append({"number":num,"subject":"Português" if num<=20 else "Matemática","statement":statement,"alternatives":alternatives,"confidence":confidence})
    return questions

def parse_all():
    manifest=json.loads((OUT/"manifest.json").read_text(encoding="utf8"))
    index=[]
    for item in manifest:
        if item["kind"]!="prova": continue
        path=ROOT/item["file"]
        try:
            pages=pdf_text(path); qs=parse_questions(pages)
            data={**item,"pages":len(pages),"questions":qs,"parsed_at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime())}
            out=OUT/(slug(path.stem)+".json"); out.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf8")
            index.append({"file":str(out.relative_to(ROOT)),"year":item["year"],"count":len(qs)})
        except Exception as e:
            index.append({"file":item["file"],"error":str(e)})
    (OUT/"index.json").write_text(json.dumps(index,ensure_ascii=False,indent=2),encoding="utf8")

if __name__=="__main__":
    ap=argparse.ArgumentParser(); ap.add_argument("--download",action="store_true"); ap.add_argument("--parse",action="store_true")
    args=ap.parse_args()
    if args.download:
        rows=discover(); download(rows); print("Manifest criado em data/extracted/manifest.json")
    if args.parse:
        parse_all(); print("Extração concluída; revise data/extracted/index.json")
    if not args.download and not args.parse: ap.print_help()
