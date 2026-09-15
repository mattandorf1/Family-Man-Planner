# The Family Man Planner — App

## 1. Set up the database (one time)

In your Supabase project: left sidebar → **SQL Editor** → **New query** → paste this in → **Run**.

```sql
create table rhythms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  category text not null check (category in ('weekly','monthly','quarterly','annual')),
  text text not null,
  created_at timestamp with time zone default now()
);
alter table rhythms enable row level security;
create policy "Users manage their own rhythms"
  on rhythms for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table weeks (
  user_id uuid references auth.users not null,
  week_start date not null,
  data jsonb not null default '{}',
  updated_at timestamp with time zone default now(),
  primary key (user_id, week_start)
);
alter table weeks enable row level security;
create policy "Users manage their own weeks"
  on weeks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

This creates two tables and locks them down so each person can only ever see and edit
their own rows (Row Level Security) — required since this app will have real users.

## 2. Turn on email sign-in

Supabase dashboard → **Authentication** → **Providers** → make sure **Email** is enabled
(it is by default). No extra setup needed — the app uses passwordless "magic link" sign-in.

## 3. Push this code to GitHub

1. Create a new repository on github.com (e.g. `family-man-planner`)
2. Upload everything in this folder **except** `.env.local` and `node_modules`
   (`.env.local` is already excluded by `.gitignore` — don't remove that)

## 4. Deploy on Vercel

1. vercel.com → **Add New Project** → import the GitHub repo you just created
2. Before clicking Deploy, open **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → (your Supabase project URL)
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → (your Supabase publishable key)
3. Click **Deploy**

## 5. One last Supabase setting

Supabase dashboard → **Authentication** → **URL Configuration** → set 
**Site URL** to your live Vercel URL (e.g. `https://family-man-planner.vercel.app`).
This makes the magic-link emails redirect back to the live app instead of localhost.

That's it — open the live link, enter your email, click the link it sends you, and you're in.
