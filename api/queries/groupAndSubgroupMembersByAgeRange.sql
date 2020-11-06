SELECT
       count(*) filter (where DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) >= (DATE_PART('year', CURRENT_DATE) - 24)) as "<25",
       count(*) filter (where DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) between (DATE_PART('year', CURRENT_DATE) - 29) and DATE_PART('year', CURRENT_DATE) - 25) as "25-29",
       count(*) filter (where DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) between (DATE_PART('year', CURRENT_DATE) - 34) and DATE_PART('year', CURRENT_DATE) - 30) as "30-34",
       count(*) filter (where DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) between (DATE_PART('year', CURRENT_DATE) - 44) and DATE_PART('year', CURRENT_DATE) - 35) as "35-44",
       count(*) filter (where DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) between (DATE_PART('year', CURRENT_DATE) - 54) and DATE_PART('year', CURRENT_DATE) - 45) as "45-54",
       count(*) filter (where DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) <= (DATE_PART('year', CURRENT_DATE) - 55)) as ">=55"
FROM user_data ud
       JOIN "user" u ON u.research_entity = ud.research_entity
       JOIN allmembership m on u.id = m."user"
WHERE m.active = true AND m."group" = $1;