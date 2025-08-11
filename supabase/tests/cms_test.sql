BEGIN;
SELECT plan(7);

-- CONTENT ITEMS
SELECT columns_are(
    'yunocontent',
    'content_items',
    ARRAY['id', 'uid', 'title', 'data', 'schema_id', 'created_at', 'updated_at', 'published_at', 'deleted_at']
);

-- SCHEMAS (formerly content_types)
SELECT columns_are(
    'yunocontent',
    'schemas',
    ARRAY['id', 'name', 'description', 'type', 'fields', 'created_at', 'updated_at', 'archived_at', 'deleted_at']
);

-- Check schema_type enum values
SELECT enum_has_labels(
    'yunocontent',
    'schema_type',
    ARRAY['single', 'collection']
);

-- Test foreign key relationships - use proper signature for has_fk
SELECT has_fk(
    'yunocontent',
    'content_items',
    ARRAY['schema_id'],
    'yunocontent',
    'schemas',
    ARRAY['id']
);

-- Test schema type constraints
prepare insert_invalid_type as 
    INSERT INTO yunocontent.schemas (type, name, fields) 
    VALUES ('invalid', 'posts', '[]');

select throws_ok('insert_invalid_type');

-- Test valid schema type
prepare insert_valid_type as 
    INSERT INTO yunocontent.schemas (type, name, fields) 
    VALUES ('single', 'posts', '[]');

select lives_ok('insert_valid_type');

-- Test content_items uid uniqueness
prepare insert_duplicate_uid as
    INSERT INTO yunocontent.content_items (uid, title) 
    VALUES ('test-uid', 'Test 1'), ('test-uid', 'Test 2');

select throws_ok('insert_duplicate_uid');

-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;