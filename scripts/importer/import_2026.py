import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
answers=json.loads((ROOT/"data/seed/official_2026_gabarito.json").read_text())["answers"]
print("Gabarito oficial 2026 carregado:",len(answers),"respostas")
print("Execute primeiro: python scripts/importer/import_liberato.py --download")
print("Depois: python scripts/importer/import_liberato.py --parse")
print("A seguir associe answers[número] às questões extraídas e envie somente itens revisados.")
