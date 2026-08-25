alter table exams enable row level security;
alter table questions enable row level security;
alter table alternatives enable row level security;
alter table attempts enable row level security;
alter table answers enable row level security;

create policy "published exams readable" on exams for select using (import_status = 'published');
create policy "questions from published exams readable" on questions for select using (
 exists(select 1 from exams e where e.id=questions.exam_id and e.import_status='published')
);
create policy "alternatives from published questions readable" on alternatives for select using (
 exists(select 1 from questions q join exams e on e.id=q.exam_id where q.id=alternatives.question_id and e.import_status='published')
);
