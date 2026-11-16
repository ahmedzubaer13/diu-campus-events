drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can manage profiles" on public.profiles;

create policy "Profiles visible to owner or admin" on public.profiles
for select to authenticated
using ((select auth.uid()) = id or (select private.is_admin()));

create policy "Profiles editable by owner or admin" on public.profiles
for update to authenticated
using ((select auth.uid()) = id or (select private.is_admin()))
with check ((select auth.uid()) = id or (select private.is_admin()));

drop policy if exists "Public can read published and cancelled events" on public.events;
drop policy if exists "Owners can read their own events" on public.events;
drop policy if exists "Admins can read all events" on public.events;
drop policy if exists "Approved students can create own events" on public.events;
drop policy if exists "Approved owners can update own events" on public.events;
drop policy if exists "Approved owners can delete own events" on public.events;
drop policy if exists "Admins can manage all events" on public.events;

create policy "Events visible to public owner or admin" on public.events
for select to anon, authenticated
using (
  status in ('published', 'cancelled')
  or (select auth.uid()) = owner_id
  or (select private.is_admin())
);

create policy "Approved students or admins can create events" on public.events
for insert to authenticated
with check (
  (select private.is_admin())
  or (
    owner_id = (select auth.uid())
    and (select private.is_approved_publisher())
    and status in ('draft', 'published')
  )
);

create policy "Approved owners or admins can update events" on public.events
for update to authenticated
using (
  (select private.is_admin())
  or (owner_id = (select auth.uid()) and (select private.is_approved_publisher()))
)
with check (
  (select private.is_admin())
  or (owner_id = (select auth.uid()) and (select private.is_approved_publisher()))
);

create policy "Approved owners or admins can delete events" on public.events
for delete to authenticated
using (
  (select private.is_admin())
  or (owner_id = (select auth.uid()) and (select private.is_approved_publisher()))
);

create index if not exists profiles_department_id_idx on public.profiles(department_id);
create index if not exists profiles_reviewed_by_idx on public.profiles(reviewed_by);
create index if not exists events_category_id_idx on public.events(category_id);
create index if not exists events_department_id_idx on public.events(department_id);
create index if not exists admin_logs_actor_id_idx on public.admin_logs(actor_id);
