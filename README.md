# Simulados Liberato V7 — Importador de PDFs

A V7 implementa um pipeline executável para importar o acervo de PDFs da página oficial da Fundação Liberato.

## Fonte
O importador começa pela página oficial de provas e gabaritos e descobre os links PDF disponíveis.

## Configuração
Copie:

```bash
copy .env.import.example .env.import
```

Preencha somente para upload:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

A `SERVICE_ROLE_KEY` é usada somente pelo script local de importação. Nunca coloque essa chave na Vercel ou no frontend.

## Importar PDFs

```bash
pip install -r requirements.txt
python scripts/importer/v7_import_all.py --download
python scripts/importer/v7_import_all.py --parse
```

Ou:

```bash
python scripts/importer/v7_import_all.py --all
```

## Validar uma prova

```bash
python scripts/importer/v7_validate.py data/extracted/ARQUIVO.json
```

## Enviar prova revisada ao Supabase

```bash
python scripts/importer/v7_upload_supabase.py data/extracted/ARQUIVO.json
```

Ela entra como `review`.

Após conferir no banco, publique:

```bash
python scripts/importer/v7_upload_supabase.py data/extracted/ARQUIVO.json --publish
```

## Observação
O parser automático não deve ser considerado perfeito para PDFs com imagens, tabelas, fórmulas ou layouts complexos. Revise antes de publicar.
