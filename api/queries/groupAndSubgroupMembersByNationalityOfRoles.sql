SELECT
       (ud.profile->'nationality'->>'value')::text AS nationality,
       count(*)
FROM general_settings gs,
     json_array_elements(gs.data) roles
       JOIN user_data ud ON (ud.profile->'roleCategory'->>'value')::text = (roles->>'originalRole')::text
       JOIN "user" u ON u.research_entity = ud.research_entity
       JOIN (SELECT "user", "group" FROM all_membership_group m WHERE m.active = true AND m.group = $1 GROUP BY m.user, m.group) as m ON u.id = m.user
WHERE (
        (roles->>'roleCategory')::text IS NOT NULL AND
        (roles->>'roleCategory')::text = ANY ($2)
)
GROUP BY nationality;