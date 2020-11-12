SELECT
       (ud.profile->'gender'->>'value')::text AS gender,
       count(*) AS count
FROM general_settings gs,
     json_array_elements(gs.data) roles
       JOIN user_data ud ON (ud.profile->'roleCategory'->>'value')::text = (roles->>'originalRole')::text
       JOIN "user" u ON u.research_entity = ud.research_entity
       JOIN membership m ON u.id = m.user
       JOIN "group" g ON g.id = m.group
WHERE gs.name='role-associations' AND
    m.active = TRUE AND
    g.id = $1 AND
    (
        (roles->>'roleCategory')::text IS NOT NULL AND
        (roles->>'roleCategory')::text = $2
    )
GROUP BY gender;