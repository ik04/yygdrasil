-- notes table
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  title text,
  content text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- summaries table (one-to-many)
create table summaries (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references notes(id) on delete cascade,
  content text,
  created_at timestamp default now()
);
