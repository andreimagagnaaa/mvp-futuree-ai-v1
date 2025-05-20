-- Create funnels table
create table if not exists public.funnels (
    id uuid default uuid_generate_v4() primary key,
    user_id text not null,
    name text not null,
    stages jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.funnels enable row level security;

-- Create policies
create policy "Users can view their own funnels"
    on public.funnels for select
    using (user_id = current_setting('request.jwt.claims')::json->>'firebase_id');

create policy "Users can insert their own funnels"
    on public.funnels for insert
    with check (user_id = current_setting('request.jwt.claims')::json->>'firebase_id');

create policy "Users can update their own funnels"
    on public.funnels for update
    using (user_id = current_setting('request.jwt.claims')::json->>'firebase_id');

create policy "Users can delete their own funnels"
    on public.funnels for delete
    using (user_id = current_setting('request.jwt.claims')::json->>'firebase_id');

-- Create indexes
create index funnels_user_id_idx on public.funnels(user_id);
create index funnels_created_at_idx on public.funnels(created_at desc); 