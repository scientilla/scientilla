SELECT
       count(*) filter (WHERE DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) >= (DATE_PART('year', CURRENT_DATE) - 24)) AS "<25",
       count(*) filter (where DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) BETWEEN (DATE_PART('year', CURRENT_DATE) - 29) AND DATE_PART('year', CURRENT_DATE) - 25) AS "25-29",
       count(*) filter (WHERE DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) BETWEEN (DATE_PART('year', CURRENT_DATE) - 34) AND DATE_PART('year', CURRENT_DATE) - 30) AS "30-34",
       count(*) filter (WHERE DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) BETWEEN (DATE_PART('year', CURRENT_DATE) - 44) AND DATE_PART('year', CURRENT_DATE) - 35) AS "35-44",
       count(*) filter (WHERE DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) BETWEEN (DATE_PART('year', CURRENT_DATE) - 54) AND DATE_PART('year', CURRENT_DATE) - 45) AS "45-54",
       count(*) filter (WHERE DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) <= (DATE_PART('year', CURRENT_DATE) - 55)) AS ">=55"
FROM general_settings gs,
     json_array_elements(gs.data) roles
       JOIN user_data ud ON (ud.profile->'roleCategory'->>'value')::text = (roles->>'originalRole')::text
       JOIN "user" u ON u.research_entity = ud.research_entity
       JOIN membership m ON u.id = m.user
       JOIN "group" g ON g.id = m.group
WHERE gs.name='role-associations' AND
      m.active = TRUE AND
      g.id = $1 AND (
          (roles->>'roleCategory')::text IS NOT NULL AND
          (roles->>'roleCategory')::text = ANY ($2)
      );