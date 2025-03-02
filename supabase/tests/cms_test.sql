BEGIN;
SELECT plan(7);

-- CONTENT ITEMS
SELECT columns_are(
    'supacontent',
    'content_items',
    ARRAY['id', 'content_type_id', 'data', 'inserted_at', 'updated_at', 'user_id' ]
);


SELECT triggers_are(
    'supacontent',
    'content_items',
    ARRAY[ 'tr_content_items_bu']
);


-- CONTENT TYPES

SELECT columns_are(
    'supacontent',
    'content_types',
    ARRAY['id', 'fields', 'name', 'type', 'inserted_at', 'updated_at']
);



SELECT triggers_are(
    'supacontent',
    'content_types',
    ARRAY[ 'tr_content_types_bu']
);



-- restricted column values
prepare insert_type as 
    INSERT INTO supacontent.content_types (type, name, fields) 
    VALUES ('any', 'posts', '[]');

select throws_ok('insert_type');


-- restricted column values
prepare insert_name as 
    INSERT INTO supacontent.content_types (type, name, fields) 
    VALUES ('single', 'p', '[]');

select throws_ok('insert_name');


prepare insert_fields as 
    INSERT INTO supacontent.content_types (type, name, fields) 
    VALUES ('single', 'posts', '{}');

select throws_ok('insert_fields');


-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;