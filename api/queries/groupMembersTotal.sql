SELECT count(*) AS count
FROM membership m
    JOIN "group" g ON g.id = m.group
    WHERE m.active = TRUE AND g.id = $1;