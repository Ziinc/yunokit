create schema if not exists "yunocommunity";

create table "yunocommunity"."forums" (
    id bigserial primary key,
    workspace_id bigint not null,
    name text not null,
    description text,
    archived boolean default false,
    created_at timestamp with time zone default now()
);

create table "yunocommunity"."posts" (
    id bigserial primary key,
    forum_id bigint references yunocommunity.forums(id) on delete cascade,
    author_id uuid references auth.users(id) on delete cascade,
    title text not null,
    content text,
    multi_thread boolean default true,
    created_at timestamp with time zone default now(),
    approved boolean default false
);

create type "yunocommunity"."comment_status" as enum ('pending','approved','rejected','hidden');

create table "yunocommunity"."comments" (
    id bigserial primary key,
    post_id bigint references yunocommunity.posts(id) on delete cascade,
    author_id uuid references auth.users(id) on delete cascade,
    parent_comment_id bigint references yunocommunity.comments(id),
    content text not null,
    status yunocommunity.comment_status default 'pending',
    created_at timestamp with time zone default now()
);

create table "yunocommunity"."user_bans" (
    id bigserial primary key,
    user_id uuid references auth.users(id) on delete cascade,
    banned_at timestamp with time zone default now(),
    banned_until timestamp with time zone,
    reason text,
    shadow boolean default false
);

create table "yunocommunity"."config" (
    id bigserial primary key,
    key text not null,
    value jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

alter table "yunocommunity"."forums" enable row level security;
alter table "yunocommunity"."posts" enable row level security;
alter table "yunocommunity"."comments" enable row level security;
alter table "yunocommunity"."user_bans" enable row level security;
alter table "yunocommunity"."config" enable row level security;
