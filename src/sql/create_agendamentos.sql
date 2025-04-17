-- Criar tabela de agendamentos
create table if not exists public.agendamentos (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  email text not null,
  empresa text not null,
  telefone text not null,
  status text not null default 'pendente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  horario_agendado timestamp with time zone,
  observacoes text
);

-- Criar índices
create index if not exists agendamentos_email_idx on public.agendamentos(email);
create index if not exists agendamentos_status_idx on public.agendamentos(status);
create index if not exists agendamentos_created_at_idx on public.agendamentos(created_at);

-- Configurar RLS (Row Level Security)
alter table public.agendamentos enable row level security;

-- Criar política para permitir inserções anônimas
create policy "Permitir inserções anônimas"
  on public.agendamentos for insert
  with check (true);

-- Criar política para permitir leitura apenas para usuários autenticados
create policy "Permitir leitura para usuários autenticados"
  on public.agendamentos for select
  using (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_agendamentos_updated_at
  before update on public.agendamentos
  for each row
  execute procedure public.handle_updated_at(); 