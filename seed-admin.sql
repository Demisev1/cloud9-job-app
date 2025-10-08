-- Replace YOUR_ADMIN_AUTH_USER_ID with the UUID from Auth → Users for Shane1661@gmail.com
insert into public.profiles (user_id, role) values ('YOUR_ADMIN_AUTH_USER_ID', 'admin')
on conflict (user_id) do update set role='admin';
