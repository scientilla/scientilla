SELECT
       (ud.profile->'nationality'->>'value')::text as nationality,
       count(*)
FROM user_data ud
            JOIN "user" u ON u.research_entity = ud.research_entity
            JOIN allmembership m on u.id = m."user"
WHERE m.active = true AND m."group" = $1
GROUP BY nationality;