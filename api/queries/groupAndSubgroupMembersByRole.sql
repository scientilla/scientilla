
  SELECT (roles->>'roleCategory')::text AS category,
         count(*) as count
  FROM general_settings gs,
       json_array_elements(gs.data) roles
         JOIN user_data ud ON (ud.profile->'roleCategory'->>'value')::text = (roles->>'originalRole')::text
         JOIN "user" u ON u.research_entity = ud.research_entity
         JOIN allmembership m ON u.id = m.user
         JOIN "group" g ON g.id = m.group
  WHERE m.active = true and g.id = $1
  GROUP BY category
UNION
  SELECT (ud.profile->'roleCategory'->>'value')::text as category,
         count(*) as count
  FROM user_data ud
         JOIN "user" u ON u.research_entity = ud.research_entity
         JOIN allmembership m ON u.id = m.user
         JOIN "group" g ON g.id = m.group
  WHERE m.active = true and g.id = $1 and (ud.profile->'roleCategory'->>'value')::text NOT IN (
        SELECT (roles->>'originalRole')::text
        FROM general_settings gs,
             json_array_elements(gs.data) roles
        WHERE gs.name='role-associations'
        )
  GROUP BY category
  ORDER BY count DESC;