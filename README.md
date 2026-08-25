# V8 — Importação pelo app

## Novo painel
`/admin/importar`

1. Informe a URL de um PDF oficial.
2. O backend baixa e extrai o texto.
3. O app separa questões e alternativas.
4. Revise/edite na tela.
5. Salve como `review` ou publique.
6. A prova publicada aparece em `/simulados`.

## Variáveis Vercel

Frontend:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Somente servidor:
- `SUPABASE_SERVICE_ROLE_KEY`

A Service Role Key nunca deve começar com `NEXT_PUBLIC_` e não deve ser exposta no navegador.

## Dependência adicional
```bash
npm install pdf-parse
```

## Limites
O processamento é feito por requisição. PDFs muito grandes ou com layout complexo podem falhar; nesse caso use o importador Python da V7.
