# Simulados Liberato V5

## Versão pronta para integração

A V5 consolida o MVP e adiciona a preparação para produção:

- `.gitignore` seguro para Node, Next.js, dados importados e variáveis;
- cliente Supabase;
- funções para buscar provas e questões publicadas;
- políticas iniciais de Row Level Security;
- script de verificação da estrutura;
- pipeline V1–V4 mantido;
- separação entre acervo extraído e acervo publicado;
- preparação para GitHub + Vercel + Supabase.

## Instalação local

```bash
npm install
copy .env.example .env.local
```

Preencha `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Depois:

```bash
npm run dev
```

## Supabase

Execute no SQL Editor, nesta ordem:

1. `supabase/schema.sql`
2. `supabase/schema_v2.sql`
3. `supabase/rls.sql`

## Teste

```bash
python scripts/ci-check.py
npm run build
```

## Publicação

1. Suba o projeto para um repositório GitHub.
2. Importe o repositório na Vercel.
3. Configure `NEXT_PUBLIC_SUPABASE_URL`.
4. Configure `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Faça o deploy.

## Importação do acervo

O processamento dos PDFs deve ocorrer fora do frontend:

```bash
pip install -r requirements.txt
python scripts/importer/import_liberato.py --download
python scripts/importer/import_liberato.py --parse
python scripts/importer/build_review_queue.py
```

Revise os resultados antes de publicar no banco.

## Segurança

Nunca envie `.env.local`, chaves secretas ou `service_role` ao GitHub. Para o navegador use somente a URL do projeto e a Publishable Key com RLS corretamente configurado.
