  SELECT (roles->>'roleCategory')::text AS category,
         count(*) AS count
  FROM general_settings gs,
       json_array_elements(gs.data) roles
         JOIN user_data ud ON LOWER((ud.profile->'roleCategory'->>'value')::text) = LOWER((roles->>'originalRole')::text)
         JOIN "user" u ON u.research_entity = ud.research_entity
         JOIN (SELECT "user", "group" FROM all_membership_group m WHERE m.active = true AND m.group = $1 GROUP BY m.user, m.group) as m ON u.id = m.user
  WHERE u.active = true
  GROUP BY category
UNION
  SELECT 'Others' AS category,
         count(*) AS count
  FROM user_data ud
         JOIN "user" u ON u.research_entity = ud.research_entity
         JOIN (SELECT "user", "group" FROM all_membership_group m WHERE m.active = true AND m.group = $1 GROUP BY m.user, m.group) as m ON u.id = m.user
  WHERE LOWER((ud.profile->'roleCategory'->>'value')::text) NOT IN (
        SELECT LOWER((roles->>'originalRole')::text)
        FROM general_settings gs,
             json_array_elements(gs.data) roles
        WHERE gs.name='role-associations'
  ) AND u.active = true
  GROUP BY category
  ORDER BY count DESC, category ASC;