BEGIN;
SELECT plan(5);

SELECT columns_are(
    'yunocommunity',
    'posts',
    ARRAY['id', 'content_item_id', 'user_author_id', 'forum_id', 'multi_thread']
);

SELECT col_default_is(
    'yunocommunity',
    'posts',
    'multi_thread',
    'false'
);

SELECT has_fk(
    'yunocommunity',
    'posts',
    ARRAY['content_item_id'],
    'yunocontent',
    'content_items',
    ARRAY['id']
);

SELECT has_fk(
    'yunocommunity',
    'posts',
    ARRAY['forum_id'],
    'yunocommunity',
    'forums',
    ARRAY['id']
);

SELECT has_fk(
    'yunocommunity',
    'posts',
    ARRAY['user_author_id'],
    'auth',
    'users',
    ARRAY['id']
);

SELECT * FROM finish();
ROLLBACK;
