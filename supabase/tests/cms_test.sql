BEGIN;
SELECT plan(12);

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

-- AUTHORS
SELECT columns_are(
    'yunocontent',
    'authors',
    ARRAY['id', 'sc_user_id', 'user_id', 'first_name', 'last_name', 'pseudonym', 'title', 'description', 'metadata']
);

-- CONTENT AUTHORS
SELECT columns_are(
    'yunocontent',
    'content_authors',
    ARRAY['id', 'content_id', 'author_id']
);

-- Check schema_type enum values
SELECT enum_has_labels(
    'yunocontent',
    'schema_type',
    ARRAY['single', 'collection']
);

-- Test foreign key relationships
SELECT has_fk(
    'yunocontent',
    'content_items',
    'schema_id',
    'yunocontent',
    'schemas',
    'id'
);

SELECT has_fk(
    'yunocontent',
    'content_authors',
    'author_id',
    'yunocontent',
    'authors',
    'id'
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

-- Test valid content item creation
prepare insert_valid_content as
    INSERT INTO yunocontent.content_items (uid, title, data) 
    VALUES ('valid-uid', 'Valid Content', '{"test": "data"}');

select lives_ok('insert_valid_content');

-- Test author creation
prepare insert_author as
    INSERT INTO yunocontent.authors (first_name, last_name, pseudonym) 
    VALUES ('John', 'Doe', 'johndoe');

select lives_ok('insert_author');

-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;