alter table exams add column if not exists import_status text default 'draft' check (import_status in ('draft','review','published'));
alter table questions add column if not exists confidence numeric default 1;
alter table questions add column if not exists source_pdf_url text;
alter table questions add column if not exists review_required boolean default false;
create table if not exists import_jobs(
 id uuid primary key default gen_random_uuid(),
 source_url text not null,
 started_at timestamptz default now(),
 finished_at timestamptz,
 status text not null default 'pending',
 details jsonb default '{}'::jsonb
);
