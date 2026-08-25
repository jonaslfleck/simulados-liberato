# Importador V2

## O que faz
1. Lê a página oficial configurada em `SOURCE_PAGE`.
2. Descobre links para PDFs.
3. Classifica arquivos como prova/gabarito.
4. Baixa os PDFs para `data/raw`.
5. Extrai texto com PyMuPDF.
6. Gera JSON bruto em `data/extracted`.
7. Tenta separar questões e alternativas.
8. Envia somente registros validados para revisão/importação.

## Segurança da importação
PDFs com fórmulas, gráficos ou OCR ruim podem exigir revisão. Por padrão o script **não publica automaticamente questões de baixa confiança**.

## Uso
```bash
pip install -r requirements.txt
python scripts/importer/import_liberato.py --download
python scripts/importer/import_liberato.py --parse
```

Opcionalmente configure Supabase em `.env` e use `--upload`.
