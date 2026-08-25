import fitz,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def run(pdf):
    p=Path(pdf); out=ROOT/"data/assets"/p.stem; out.mkdir(parents=True,exist_ok=True)
    doc=fitz.open(p); manifest=[]
    for pi,page in enumerate(doc):
        for ii,img in enumerate(page.get_images(full=True)):
            xref=img[0]; data=doc.extract_image(xref)
            ext=data.get("ext","png"); name=f"page-{pi+1}-image-{ii+1}.{ext}"
            (out/name).write_bytes(data["image"])
            manifest.append({"page":pi+1,"file":str((out/name).relative_to(ROOT)),"xref":xref})
    (out/"manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf8")
    print(len(manifest),"imagens extraídas")
if __name__=="__main__":
    run(sys.argv[1])
