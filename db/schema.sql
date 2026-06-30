-- db/schema.sql: self-hosted Postgres schema for Computer Store KS.
-- Mirrors the Supabase tables this app used. Apply to an empty database.
create extension if not exists "pgcrypto";

create table slideshow_slides (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  type        text not null check (type in ('html','image')),
  content     text,
  image_url   text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  archived_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table gallery_computers (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  type           text not null check (type in ('desktop','laptop')),
  category       text not null check (category in ('refurbished','custom','new')),
  price          numeric(10,2) not null,
  specs          jsonb not null default '[]'::jsonb,
  is_active      boolean not null default true,
  sort_order     integer not null default 0,
  stock_quantity integer not null default 1,
  archived_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table gallery_sales (
  id              uuid primary key default gen_random_uuid(),
  sale_type       text not null,
  name            text not null,
  discount_percent integer not null default 0,
  applies_to      jsonb not null default '[]'::jsonb,
  is_active       boolean not null default false,
  created_at      timestamptz not null default now()
);

create table oauth_tokens (
  id            uuid not null default gen_random_uuid(),
  provider      text primary key,
  refresh_token text not null,
  scope         text not null,
  account_email text,
  updated_at    timestamptz not null default now()
);

create table reviews_cache (
  id          integer primary key,
  reviews_raw jsonb not null default '[]'::jsonb,
  stats       jsonb not null default '{}'::jsonb,
  fetched_at  timestamptz not null default now()
);
