# Importador
O app está preparado para receber questões no Supabase. Como os PDFs oficiais têm layouts diferentes e podem conter gráficos/imagens, a importação deve preservar a URL/página de origem e passar por validação antes de publicar.
Fluxo: baixar PDFs oficiais -> extrair texto/imagens -> parsear questões -> associar gabarito -> validar -> inserir no banco.
