-- V6: modelo para cadastrar a prova 2026 após importar/revisar as questões.
-- Não contém questões inventadas.
insert into exams (year, shift, title, total_questions, import_status)
values (2026, 'diurno', 'Processo Seletivo 2026', 40, 'review')
on conflict do nothing;

-- Após revisar as 40 questões extraídas, altere:
-- update exams set import_status='published'
-- where year=2026 and shift='diurno';
