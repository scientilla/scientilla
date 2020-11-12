SELECT count(*) AS count
FROM allmembership m
    JOIN "group" g ON g.id = m.group
    WHERE m.active = TRUE AND g.id = $1;