\set ON_ERROR_ROLLBACK 1
\set ON_ERROR_STOP true
BEGIN;

SELECT plan(8);

-- Test 1: Insert schema and verify created_at is set
INSERT INTO yunocontent.schemas (type, name, fields)
VALUES ('single', 'posts', '[]');

SELECT results_eq(
    'SELECT count(id) FROM yunocontent.schemas',
    $$ VALUES (1::bigint) $$,
    'Schema inserted successfully'
);

-- Test 2: Update schema and verify updated_at changes
SELECT pg_sleep(1); -- Ensure timestamp difference
UPDATE yunocontent.schemas SET type = 'collection' WHERE name = 'posts';

SELECT isnt(
    created_at, 
    updated_at, 
    'Schema updated_at changes on update'
) FROM yunocontent.schemas WHERE name = 'posts';

-- Test 3: Insert content item and verify timestamps
INSERT INTO yunocontent.content_items (title, data, schema_id)
SELECT 'Test Post', '{"content": "test"}', id 
FROM yunocontent.schemas WHERE name = 'posts';

SELECT results_eq(
    'SELECT count(id) FROM yunocontent.content_items',
    $$ VALUES (1::bigint) $$,
    'Content item inserted successfully'
);

-- Test 4: Update content item and verify updated_at changes
SELECT pg_sleep(1); -- Ensure timestamp difference
UPDATE yunocontent.content_items SET title = 'Updated Test Post' WHERE title = 'Test Post';

SELECT isnt(
    created_at, 
    updated_at, 
    'Content item updated_at changes on update'
) FROM yunocontent.content_items WHERE title = 'Updated Test Post';

-- Test 5: Verify schema foreign key constraint
SELECT has_fk(
    'yunocontent',
    'content_items',
    'schema_id',
    'yunocontent',
    'schemas',
    'id'
);

-- Test 6: Test schema type enum constraint
PREPARE insert_invalid_schema_type AS 
    INSERT INTO yunocontent.schemas (type, name, fields) 
    VALUES ('invalid', 'bad_schema', '[]');

SELECT throws_ok(
    'insert_invalid_schema_type',
    '23514',
    NULL,
    'Schema type constraint prevents invalid enum values'
);

-- Test 7: Test schema fields JSONB array constraint
PREPARE insert_invalid_fields AS 
    INSERT INTO yunocontent.schemas (type, name, fields) 
    VALUES ('single', 'bad_fields', '{}');

SELECT throws_ok(
    'insert_invalid_fields',
    '23514',
    NULL,
    'Schema fields constraint requires JSONB array'
);

-- Test 8: Test cascade behavior for content_items when schema is deleted
INSERT INTO yunocontent.schemas (type, name, fields)
VALUES ('collection', 'temp_schema', '[]');

INSERT INTO yunocontent.content_items (title, schema_id)
SELECT 'Temp Content', id FROM yunocontent.schemas WHERE name = 'temp_schema';

-- This should be restricted due to RESTRICT constraint
PREPARE delete_referenced_schema AS
    DELETE FROM yunocontent.schemas WHERE name = 'temp_schema';

SELECT throws_ok(
    'delete_referenced_schema',
    '23503',
    NULL,
    'Schema deletion restricted when content items exist'
);

SELECT * FROM finish();
ROLLBACK;
