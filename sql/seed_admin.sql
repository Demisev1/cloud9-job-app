-- Run this after creating the user Shane1661@gmail.com in Auth → Users.
insert into public.profiles (user_id, role) values ('b0a20c1d-f704-4d94-b903-cf4f5e56531d', 'admin')
on conflict (user_id) do update set role = 'admin';
