SELECT plan(4);

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

-- Finish the tests and clean up.
SELECT * FROM finish();
