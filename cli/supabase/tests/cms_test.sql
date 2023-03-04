SELECT plan(2);

-- columns
SELECT columns_are(
    'supacontent',
    'content_items',
    ARRAY['id', 'content_type_id', 'data', 'inserted_at', 'updated_at', 'user_id' ]
);


SELECT columns_are(
    'supacontent',
    'content_types',
    ARRAY['id', 'fields', 'name', 'type', 'inserted_at']
);



-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;
