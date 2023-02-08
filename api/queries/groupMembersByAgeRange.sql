SELECT
       count(*) filter (WHERE DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) >= (DATE_PART('year', CURRENT_DATE) - 24)) AS "<25",
       count(*) filter (WHERE DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) BETWEEN (DATE_PART('year', CURRENT_DATE) - 29) AND DATE_PART('year', CURRENT_DATE) - 25) AS "25-29",
       count(*) filter (WHERE DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) BETWEEN (DATE_PART('year', CURRENT_DATE) - 34) AND DATE_PART('year', CURRENT_DATE) - 30) AS "30-34",
       count(*) filter (WHERE DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) BETWEEN (DATE_PART('year', CURRENT_DATE) - 44) AND DATE_PART('year', CURRENT_DATE) - 35) AS "35-44",
       count(*) filter (WHERE DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) BETWEEN (DATE_PART('year', CURRENT_DATE) - 54) AND DATE_PART('year', CURRENT_DATE) - 45) AS "45-54",
       count(*) filter (where DATE_PART('year', (ud.profile->'dateOfBirth'->>'value')::date) <= (DATE_PART('year', CURRENT_DATE) - 55)) AS ">=55"
FROM user_data ud
       JOIN "user" u ON u.research_entity = ud.research_entity
       JOIN membership m ON u.id = m."user"
WHERE m.active = TRUE AND m."group" = $1 AND u.active = true AND (ud.profile -> 'dateOfBirth' ->> 'value')::text ~ '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]';;
