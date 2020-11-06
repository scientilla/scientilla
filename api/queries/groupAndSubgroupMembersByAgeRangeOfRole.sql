SELECT
       count(*) filter (where DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) >= (DATE_PART('year', CURRENT_DATE) - 24)) as "<25",
       count(*) filter (where DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) between (DATE_PART('year', CURRENT_DATE) - 29) and DATE_PART('year', CURRENT_DATE) - 25) as "25-29",
       count(*) filter (where DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) between (DATE_PART('year', CURRENT_DATE) - 34) and DATE_PART('year', CURRENT_DATE) - 30) as "30-34",
       count(*) filter (where DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) between (DATE_PART('year', CURRENT_DATE) - 44) and DATE_PART('year', CURRENT_DATE) - 35) as "35-44",
       count(*) filter (where DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) between (DATE_PART('year', CURRENT_DATE) - 54) and DATE_PART('year', CURRENT_DATE) - 45) as "45-54",
       count(*) filter (where DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) <= (DATE_PART('year', CURRENT_DATE) - 55)) as ">=55"
FROM general_settings gs,
     json_array_elements(gs.data) roles
       RIGHT OUTER JOIN "user" u ON u."jobTitle" = (roles->>'originalRole')::text
       JOIN allmembership m ON u.id = m.user
       JOIN "group" g ON g.id = m.group
       JOIN user_data ud ON u.research_entity = ud.research_entity
WHERE gs.name='role-associations' and
      m.active = true and
      g.id = $1 and (
      (
          (roles->>'roleCategory') :: text is null and
          u."jobTitle" = $2
      ) OR (
          (roles->>'roleCategory')::text is not null and
          (roles->>'roleCategory')::text = $2
      )
);