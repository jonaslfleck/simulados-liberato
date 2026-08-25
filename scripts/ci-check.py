from pathlib import Path
required=["package.json","app/page.tsx","supabase/schema.sql","supabase/schema_v2.sql","supabase/rls.sql",".gitignore"]
missing=[x for x in required if not Path(x).exists()]
if missing: raise SystemExit("Arquivos ausentes: "+", ".join(missing))
print("Estrutura V5 OK")
