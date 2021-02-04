WITH profile_data AS (
    SELECT u.id                                             AS id,
           (red.profile -> 'nationality' ->> 'value')::text AS nationality
    FROM "user" u
             JOIN research_entity_data red ON red.research_entity = u.research_entity
)
SELECT DISTINCT pd.nationality
FROM "user" u
    JOIN profile_data pd ON pd.id = u.id
WHERE nationality IS NOT NULL;