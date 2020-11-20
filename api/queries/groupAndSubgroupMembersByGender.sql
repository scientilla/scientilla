SELECT
       (ud.profile->'gender'->>'value')::text AS gender,
       count(*)
FROM user_data ud
            JOIN "user" u ON u.research_entity = ud.research_entity
            JOIN (SELECT "user", "group" FROM all_membership_group m WHERE m.active = true AND m.group = $1 GROUP BY m.user, m.group) as m ON u.id = m.user
GROUP BY gender;