SELECT
       (ud.profile->'gender'->>'value')::text as gender,
       count(*)as count
FROM general_settings gs,
     json_array_elements(gs.data) roles
       RIGHT OUTER JOIN "user" u ON u."jobTitle" = (roles->>'originalRole')::text
       JOIN allmembership m ON u.id = m.user
       JOIN "group" g ON g.id = m.group
       JOIN user_data ud ON u.research_entity = ud.research_entity
WHERE gs.name='role-associations' and
    m.active = true and
    g.id = $1 and
    (
      (
        (roles->>'roleCategory') :: text is null and
        u."jobTitle" = $2
      ) OR (
        (roles->>'roleCategory')::text is not null and
        (roles->>'roleCategory')::text = $2
      )
    )
GROUP BY gender;