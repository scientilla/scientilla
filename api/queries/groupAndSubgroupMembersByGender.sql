SELECT
       (ud.profile->'gender'->>'value')::text AS gender,
       count(*)
FROM user_data ud
            JOIN "user" u ON u.research_entity = ud.research_entity
            JOIN allmembership m ON u.id = m."user"
WHERE m.active = TRUE AND m."group" = $1
GROUP BY gender;