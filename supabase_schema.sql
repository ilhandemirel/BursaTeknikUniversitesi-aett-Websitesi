-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Team Members table
create table if not exists team_members (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  role text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Vehicles table
create table if not exists vehicles (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  specs jsonb not null default '{}'::jsonb,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create News table
create table if not exists news (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  image_url text,
  published_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table team_members enable row level security;
alter table vehicles enable row level security;
alter table news enable row level security;

-- Create policies (Drop first to avoid errors on re-run)
drop policy if exists "Public members can view team members" on team_members;
create policy "Public members can view team members" on team_members for select using (true);

drop policy if exists "Public members can view vehicles" on vehicles;
create policy "Public members can view vehicles" on vehicles for select using (true);

drop policy if exists "Public members can view news" on news;
create policy "Public members can view news" on news for select using (true);

-- Allow authenticated users (admin) to insert, update, delete
drop policy if exists "Admins can manage team members" on team_members;
create policy "Admins can manage team members" on team_members for all using (auth.role() = 'authenticated');

drop policy if exists "Admins can manage vehicles" on vehicles;
create policy "Admins can manage vehicles" on vehicles for all using (auth.role() = 'authenticated');

drop policy if exists "Admins can manage news" on news;
create policy "Admins can manage news" on news for all using (auth.role() = 'authenticated');

-- Create Storage Buckets
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing;

-- Storage Policies
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'images' );

drop policy if exists "Auth Upload" on storage.objects;
create policy "Auth Upload" on storage.objects for insert with check ( bucket_id = 'images' and auth.role() = 'authenticated' );

drop policy if exists "Auth Update" on storage.objects;
create policy "Auth Update" on storage.objects for update using ( bucket_id = 'images' and auth.role() = 'authenticated' );

-- Create Site Settings table
create table if not exists site_settings (
  id uuid default uuid_generate_v4() primary key,
  key text not null unique,
  value text,
  type text not null, -- 'image', 'text', 'json', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for site_settings
alter table site_settings enable row level security;

-- Policies
drop policy if exists "Public can view settings" on site_settings;
create policy "Public can view settings" on site_settings for select using (true);

drop policy if exists "Admins can manage settings" on site_settings;
create policy "Admins can manage settings" on site_settings for all using (auth.role() = 'authenticated');

-- Create Races table
create table if not exists races (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  rank text,
  image_url text,
  year text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for races
alter table races enable row level security;

-- Policies for races
drop policy if exists "Public can view races" on races;
create policy "Public can view races" on races for select using (true);

drop policy if exists "Admins can manage races" on races;
create policy "Admins can manage races" on races for all using (auth.role() = 'authenticated');


-- Create Activities table
create table if not exists activities (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for activities
alter table activities enable row level security;

-- Policies for activities
drop policy if exists "Public can view activities" on activities;
create policy "Public can view activities" on activities for select using (true);

drop policy if exists "Admins can manage activities" on activities;
create policy "Admins can manage activities" on activities for all using (auth.role() = 'authenticated');


-- Create Sponsors table
create table if not exists sponsors (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  logo_url text,
  website_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for sponsors
alter table sponsors enable row level security;

-- Policies for sponsors
drop policy if exists "Public can view sponsors" on sponsors;
create policy "Public can view sponsors" on sponsors for select using (true);

drop policy if exists "Admins can manage sponsors" on sponsors;
create policy "Admins can manage sponsors" on sponsors for all using (auth.role() = 'authenticated');


-- Create Contact Messages table
create table if not exists contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for contact_messages
alter table contact_messages enable row level security;

-- Policies for contact_messages
drop policy if exists "Public can insert messages" on contact_messages;
create policy "Public can insert messages" on contact_messages for insert with check (true);

drop policy if exists "Admins can view messages" on contact_messages;
create policy "Admins can view messages" on contact_messages for select using (auth.role() = 'authenticated');

drop policy if exists "Admins can update messages" on contact_messages;
create policy "Admins can update messages" on contact_messages for update using (auth.role() = 'authenticated');

drop policy if exists "Admins can delete messages" on contact_messages;
create policy "Admins can delete messages" on contact_messages for delete using (auth.role() = 'authenticated');
