SELECT
       (ud.profile->'nationality'->>'value')::text as nationality,
       count(*)
FROM general_settings gs,
     json_array_elements(gs.data) roles
       RIGHT OUTER JOIN "user" u ON u."jobTitle" = (roles->>'originalRole')::text
       JOIN allmembership m on u.id = m."user"
       JOIN user_data ud ON u.research_entity = ud.research_entity
WHERE m.active = true AND
      m."group" = $1 and
      (
          (
              (roles->>'roleCategory') :: text is null and
              u."jobTitle" = $2
          ) OR (
              (roles->>'roleCategory')::text is not null and
              (roles->>'roleCategory')::text = $2
          )
      )
GROUP BY nationality;