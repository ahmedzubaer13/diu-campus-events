-- Run this once in Supabase SQL Editor AFTER creating your own account.
-- Replace the email below with the exact email used for registration.
-- Do not expose admin promotion as a public app feature.

update public.profiles p
set role = 'admin',
    account_status = 'approved',
    reviewed_at = now(),
    review_note = 'Initial platform administrator'
from auth.users u
where p.id = u.id
  and u.email = 'REPLACE-WITH-YOUR-EMAIL';

-- Verify the intended account:
select p.id, u.email, p.role, p.account_status
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'REPLACE-WITH-YOUR-EMAIL';
