  SELECT (roles->>'roleCategory')::text AS category,
         count(*) AS count
  FROM general_settings gs,
       jsonb_array_elements(gs.data) roles
         JOIN user_data ud ON LOWER((ud.profile->'roleCategory'->>'value')::text) = LOWER((roles->>'originalRole')::text)
         JOIN "user" u ON u.research_entity = ud.research_entity
         JOIN membership m ON u.id = m.user
         JOIN "group" g ON g.id = m.group
  WHERE m.active = TRUE AND g.id = $1 AND u.active = true AND gs.name='role-associations'
  GROUP BY category
UNION
  SELECT 'Others' AS category,
         count(*) AS count
  FROM user_data ud
         JOIN "user" u ON u.research_entity = ud.research_entity
         JOIN membership m ON u.id = m.user
         JOIN "group" g ON g.id = m.group
  WHERE m.active = TRUE AND g.id = $1 and LOWER((ud.profile->'roleCategory'->>'value')::text) NOT IN (
        SELECT LOWER((roles->>'originalRole')::text)
        FROM general_settings gs,
             jsonb_array_elements(gs.data) roles
        WHERE gs.name = 'role-associations'
  ) AND u.active = true
  GROUP BY category
  ORDER BY count DESC, category ASC;
