SET session_replication_role = replica;
\set USER_ID :USER_ID

INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data, role, aud, encrypted_password, email_confirmed_at)
VALUES (
  :'USER_ID',
  'demo@example.com',
  '{"provider":"email"}',
  '{}',
  'authenticated',
  'authenticated',
  '',
  now()
);

INSERT INTO public.workspaces (id, user_id, name, description, project_ref)
VALUES (1, :'USER_ID', 'Demo Workspace', 'Demo workspace', 'demo-project');

INSERT INTO public.workspace_users (user_id, workspace_id)
VALUES (:'USER_ID', 1);

WITH s AS (
  INSERT INTO yunocontent.schemas (name, description, type, fields, strict)
  VALUES (
    'Article',
    'Blog posts',
    'collection',
    '[{"id":"title","label":"Title","description":null,"type":"text","required":true,"default_value":null,"options":[],"relation_schema_id":null}]',
    false
  ) RETURNING id
)
INSERT INTO yunocontent.content_items (uid, title, schema_id, data)
VALUES ('post-1', 'First Post', (SELECT id FROM s), '{"title":"First Post"}');
