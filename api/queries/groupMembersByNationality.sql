SELECT
       (ud.profile->'nationality'->>'value')::text AS nationality,
       count(*)
FROM user_data ud
            JOIN "user" u ON u.research_entity = ud.research_entity
            JOIN membership m ON u.id = m."user"
WHERE m.active = TRUE AND m."group" = $1
GROUP BY nationality;