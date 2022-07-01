SELECT
    u2.id as user_id,
    concat(u2.display_name, ' ', u2.display_surname) as user_name,
    sub.count
FROM (
    SELECT
        m.user as "user",
        count(*) AS "count"
    FROM "membership" m
        JOIN "user" u ON u.id = m.user
        JOIN "authorship" a ON u.id = a."researchEntity"
        JOIN "group" mg ON mg.id = m.group
    WHERE mg.id = $1
        --AND m.active = true
        AND u.active = true
    GROUP BY m.user
) sub
    JOIN "user" u2 ON u2.id = sub."user"
ORDER BY u2.display_surname
