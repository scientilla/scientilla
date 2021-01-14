SELECT count(*) AS count
FROM membership m
    JOIN "group" g ON g.id = m.group
    JOIN "user" u ON u.id = m.user
    WHERE m.active = TRUE AND g.id = $1 AND u.active = true;