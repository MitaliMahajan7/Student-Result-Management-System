-- Roles enum
create type public.app_role as enum ('admin', 'teacher', 'student');

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  roll_number text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles viewable by authenticated"
  on public.profiles for select to authenticated using (true);

create policy "Users update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.get_user_role(_user_id uuid)
returns public.app_role
language sql stable security definer set search_path = public
as $$
  select role from public.user_roles where user_id = _user_id limit 1
$$;

create policy "Users view own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Admins manage roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Auto create profile + default student role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _role public.app_role;
begin
  insert into public.profiles (id, email, full_name, roll_number)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'roll_number'
  );

  _role := coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'student'::public.app_role);
  insert into public.user_roles (user_id, role) values (new.id, _role);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Subjects
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  max_marks int not null default 100,
  created_at timestamptz not null default now()
);

alter table public.subjects enable row level security;

create policy "Subjects viewable by authenticated" on public.subjects
  for select to authenticated using (true);

create policy "Admins manage subjects" on public.subjects
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Results
create table public.results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  marks_obtained numeric(6,2) not null,
  exam_term text not null default 'Final',
  exam_year int not null default extract(year from now()),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, subject_id, exam_term, exam_year)
);

alter table public.results enable row level security;

create policy "Students view own results" on public.results
  for select to authenticated using (
    student_id = auth.uid()
    or public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'teacher')
  );

create policy "Admins/Teachers insert results" on public.results
  for insert to authenticated with check (
    public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'teacher')
  );

create policy "Admins/Teachers update results" on public.results
  for update to authenticated using (
    public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'teacher')
  );

create policy "Admins delete results" on public.results
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger results_updated before update on public.results
  for each row execute function public.set_updated_at();

-- Seed subjects
insert into public.subjects (name, code, max_marks) values
  ('Mathematics', 'MATH101', 100),
  ('Physics', 'PHY101', 100),
  ('Chemistry', 'CHEM101', 100),
  ('English', 'ENG101', 100),
  ('Computer Science', 'CS101', 100);