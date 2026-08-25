# Simulados Liberato V8 Corrigido

## Correções
- JSX da tela de importação corrigido.
- Tratamento de respostas HTML/404/500 da API corrigido.
- Processador de PDF trocado para `pdfjs-dist`, mais compatível com rotas Node do Next.js/Vercel.
- Validação do arquivo baixado: precisa começar com `%PDF-`.
- Mensagens HTTP mais claras.
- Validação e logs da gravação no Supabase.
- Service Role usada apenas no endpoint do servidor.

## Instalação
```bash
npm install
npm run build
```

## Dependências
O projeto usa `pdfjs-dist`. As demais dependências do projeto permanecem.

## Vercel
Configure:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY

Depois faça redeploy.

## Importação
Acesse `/admin/importar`, informe uma URL HTTPS direta para um PDF e processe. Revise o conteúdo e salve primeiro como `review`.
