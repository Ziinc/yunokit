BEGIN;
SELECT plan(4);

SELECT columns_are(
    'yunocommunity',
    'forums',
    ARRAY['id', 'created_at', 'updated_at', 'deleted_at', 'archived_at', 'name', 'description']
);

SELECT col_default_is(
    'yunocommunity',
    'forums',
    'created_at',
    'now()'
);

SELECT col_default_is(
    'yunocommunity',
    'forums',
    'updated_at',
    'now()'
);

SELECT col_is_not_null(
    'yunocommunity',
    'forums',
    'name'
);

SELECT * FROM finish();
ROLLBACK;
