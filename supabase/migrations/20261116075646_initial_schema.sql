create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  color text not null default '#64748b',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  student_id text unique,
  department_id uuid references public.departments(id) on delete set null,
  batch text,
  role text not null default 'student' check (role in ('student', 'admin')),
  account_status text not null default 'pending' check (account_status in ('pending', 'approved', 'rejected', 'suspended')),
  review_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  organizer_name text not null,
  title text not null,
  summary text not null default '',
  description text not null,
  category_id uuid references public.categories(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  venue text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  registration_url text,
  contact_email text,
  poster_path text,
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_valid_time check (ends_at > starts_at)
);

create index if not exists events_starts_at_idx on public.events (starts_at);
create index if not exists events_status_starts_at_idx on public.events (status, starts_at);
create index if not exists events_owner_id_idx on public.events (owner_id);

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin' and p.account_status = 'approved'
  );
$$;

create or replace function private.is_approved_publisher()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'student' and p.account_status = 'approved'
  );
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.is_approved_publisher() from public;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_approved_publisher() to authenticated;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before update on public.events
for each row execute function private.set_updated_at();

create or replace function private.protect_profile_privileges()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if (select auth.uid()) = old.id then
    if new.role is distinct from old.role
       or new.account_status is distinct from old.account_status
       or new.reviewed_by is distinct from old.reviewed_by
       or new.reviewed_at is distinct from old.reviewed_at
       or new.review_note is distinct from old.review_note then
      raise exception 'Only an administrator can change account privileges or verification status';
    end if;
    if old.account_status = 'approved'
       and (new.student_id is distinct from old.student_id
         or new.department_id is distinct from old.department_id
         or new.batch is distinct from old.batch) then
      raise exception 'Verified student ID, department, and batch can only be changed by an administrator';
    end if;
  elsif not private.is_admin() then
    raise exception 'Not authorized to modify this profile';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges before update on public.profiles
for each row execute function private.protect_profile_privileges();

create or replace function private.set_event_organizer_name()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare profile_name text;
begin
  select p.full_name into profile_name from public.profiles p where p.id = new.owner_id;
  if profile_name is null or btrim(profile_name) = '' then
    raise exception 'Complete your profile name before publishing an event';
  end if;
  new.organizer_name := profile_name;
  return new;
end;
$$;

drop trigger if exists set_event_organizer_name on public.events;
create trigger set_event_organizer_name before insert or update of owner_id on public.events
for each row execute function private.set_event_organizer_name();

alter table public.departments enable row level security;
alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.admin_logs enable row level security;

create policy "Public can read departments" on public.departments
for select to anon, authenticated using (true);

create policy "Public can read categories" on public.categories
for select to anon, authenticated using (true);

create policy "Users can read own profile" on public.profiles
for select to authenticated using ((select auth.uid()) = id or (select private.is_admin()));

create policy "Users can update own profile" on public.profiles
for update to authenticated using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Admins can manage profiles" on public.profiles
for all to authenticated using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Public can read published and cancelled events" on public.events
for select to anon, authenticated using (status in ('published', 'cancelled'));

create policy "Owners can read their own events" on public.events
for select to authenticated using (owner_id = (select auth.uid()));

create policy "Admins can read all events" on public.events
for select to authenticated using ((select private.is_admin()));

create policy "Approved students can create own events" on public.events
for insert to authenticated with check (
  owner_id = (select auth.uid())
  and (select private.is_approved_publisher())
  and status in ('draft', 'published')
);

create policy "Approved owners can update own events" on public.events
for update to authenticated using (
  owner_id = (select auth.uid()) and (select private.is_approved_publisher())
) with check (
  owner_id = (select auth.uid()) and (select private.is_approved_publisher())
);

create policy "Approved owners can delete own events" on public.events
for delete to authenticated using (
  owner_id = (select auth.uid()) and (select private.is_approved_publisher())
);

create policy "Admins can manage all events" on public.events
for all to authenticated using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can read admin logs" on public.admin_logs
for select to authenticated using ((select private.is_admin()));

create policy "Admins can insert admin logs" on public.admin_logs
for insert to authenticated with check (
  actor_id = (select auth.uid()) and (select private.is_admin())
);

insert into public.categories (name, slug, color) values
  ('Academic', 'academic', '#2563eb'),
  ('Technology', 'technology', '#7c3aed'),
  ('Cultural', 'cultural', '#db2777'),
  ('Sports', 'sports', '#16a34a'),
  ('Career', 'career', '#d97706'),
  ('Workshop', 'workshop', '#0891b2'),
  ('Competition', 'competition', '#dc2626'),
  ('Other', 'other', '#64748b')
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public)
values ('event-posters', 'event-posters', true)
on conflict (id) do nothing;

create policy "Public can view event posters" on storage.objects
for select to anon, authenticated using (bucket_id = 'event-posters');

create policy "Approved students upload posters to own folder" on storage.objects
for insert to authenticated with check (
  bucket_id = 'event-posters'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.is_approved_publisher())
);

create policy "Owners update their own event posters" on storage.objects
for update to authenticated using (
  bucket_id = 'event-posters'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.is_approved_publisher())
) with check (
  bucket_id = 'event-posters'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.is_approved_publisher())
);

create policy "Owners delete their own event posters" on storage.objects
for delete to authenticated using (
  bucket_id = 'event-posters'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.is_approved_publisher())
);

grant usage on schema public to anon, authenticated;
grant select on public.departments, public.categories, public.events to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert on public.admin_logs to authenticated;
