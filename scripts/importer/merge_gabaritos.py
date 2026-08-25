import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/"data/extracted"
def answers(text):
    # aceita padrões como "1 D", "1. D", tabelas extraídas etc.
    out={}
    for n,a in re.findall(r'(?<!\d)([1-5]?\d)\s*[.)\-:]?\s*([A-E])\b',text.upper()):
        n=int(n)
        if 1<=n<=60: out[n]=a
    return out
# Arquivos de gabarito extraídos podem ser associados ao mesmo ano manualmente/por metadados.
for f in SRC.glob("*.json"):
    if f.name in ("manifest.json","index.json"): continue
    d=json.loads(f.read_text(encoding="utf8"))
    # reservado para associação após extrair texto dos gabaritos
    d["gabarito_merge_status"]="awaiting_gabarito_extraction"
    f.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding="utf8")
print("Status de associação atualizado.")
