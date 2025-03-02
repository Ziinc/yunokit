\set ON_ERROR_ROLLBACK 1
\set ON_ERROR_STOP true
BEGIN;

select plan(2);


INSERT INTO supacontent.content_types
    (type, name, fields)
VALUES ('single', 'posts', '[]');

select pg_sleep(5);
update supacontent.content_types set type = 'collection';

select results_eq(
    'select count(id) from supacontent.content_types',
    $$ values (1::bigint) $$,
    'insert content_type successfully'
);

SELECT isnt(
    inserted_at, 
    updated_at, 
    'correctly updates update_at with trigger'
    )  FROM supacontent.content_types;


--content items

select * from finish()
rollback;
