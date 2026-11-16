create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare dept_id uuid;
begin
  if nullif(new.raw_user_meta_data ->> 'department_id', '') is not null then
    dept_id := (new.raw_user_meta_data ->> 'department_id')::uuid;
  end if;
  insert into public.profiles (id, full_name, student_id, department_id, batch)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'student_id', ''),
    dept_id,
    nullif(new.raw_user_meta_data ->> 'batch', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
