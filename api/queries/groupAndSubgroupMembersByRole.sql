  SELECT
         (roles->>'roleCategory')::text AS category,
         count(*) AS count
  FROM general_settings gs,
       json_array_elements(gs.data) roles
         RIGHT OUTER JOIN "user" u ON u."jobTitle" = (roles->>'originalRole')::text
         JOIN allmembership m ON u.id = m.user
         JOIN "group" g ON g.id = m.group
  WHERE gs.name='role-associations' AND m.active = true AND (roles->>'roleCategory')::text IS NOT NULL AND g.id = $1
  GROUP BY category
UNION
  SELECT
         u."jobTitle",
         count(*) AS count
  FROM general_settings gs,
       json_array_elements(gs.data) roles
         RIGHT OUTER JOIN "user" u ON u."jobTitle" = (roles->>'originalRole')::text
         JOIN allmembership m ON u.id = m.user
         JOIN "group" g ON g.id = m.group
  WHERE gs.name='role-associations' AND m.active = true AND (roles->>'roleCategory')::text IS NULL AND g.id = $1
  GROUP BY u."jobTitle"
ORDER BY count DESC;