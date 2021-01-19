DROP VIEW IF EXISTS role_association CASCADE
CREATE
OR REPLACE VIEW role_association AS
SELECT 1 AS id,
       (associations ->> 'originalRole')::text AS original_role,
       (associations ->> 'roleCategory') ::text AS role_category
FROM (
         SELECT json_array_elements(gs.data) AS associations
         FROM general_settings gs
     ) a,
     general_settings gs
WHERE gs.name = 'role-associations'
  AND (associations ->> 'originalRole')::text IS NOT NULL AND
      (associations ->> 'roleCategory')::text IS NOT NULL;