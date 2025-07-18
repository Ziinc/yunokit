create table "yunofeedback"."tickets" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "title" text not null,
    "description" text,
    "labels" text[] default array[]::text[],
    "status" text not null default 'open',
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);

create table "yunofeedback"."ticket_comments" (
    "id" uuid not null default gen_random_uuid(),
    "ticket_id" uuid not null references yunofeedback.tickets(id) on delete cascade,
    "user_id" uuid not null,
    "content" text not null,
    "created_at" timestamp with time zone not null default now()
);

alter table "yunofeedback"."tickets" enable row level security;
alter table "yunofeedback"."ticket_comments" enable row level security;

create unique index tickets_pkey on yunofeedback.tickets using btree (id);
create unique index ticket_comments_pkey on yunofeedback.ticket_comments using btree (id);

alter table "yunofeedback"."tickets" add constraint "tickets_pkey" primary key using index "tickets_pkey";
alter table "yunofeedback"."ticket_comments" add constraint "ticket_comments_pkey" primary key using index "ticket_comments_pkey";
