BEGIN;
SELECT plan(4);

SELECT columns_are(
    'yunocommunity',
    'comments',
    ARRAY['id', 'content_item_id', 'user_author_id', 'parent_comment_id']
);

SELECT has_fk(
    'yunocommunity',
    'comments',
    ARRAY['content_item_id'],
    'yunocontent',
    'content_items',
    ARRAY['id']
);

SELECT has_fk(
    'yunocommunity',
    'comments',
    ARRAY['parent_comment_id'],
    'yunocommunity',
    'comments',
    ARRAY['id']
);

SELECT has_fk(
    'yunocommunity',
    'comments',
    ARRAY['user_author_id'],
    'auth',
    'users',
    ARRAY['id']
);

SELECT * FROM finish();
ROLLBACK;
