SELECT DISTINCT ra.role_category AS role_category
FROM "user" u
         JOIN research_entity_data red ON red.research_entity = u.research_entity
         LEFT JOIN role_association ra
                   ON LOWER(ra.original_role) = LOWER((red.profile -> 'roleCategory' ->> 'value')::text)
WHERE role_category IS NOT NULL;