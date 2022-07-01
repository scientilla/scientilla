SELECT
    u.id as user_id,
    concat(u.display_name, ' ', u.display_surname) as user_name,
    sub.total
FROM "membership" m
    JOIN "user" u ON u.id = m.user
    JOIN "group" mg ON mg.id = m.group
    JOIN (
        SELECT
            v.research_entity as research_entity,
            count(*) as total
        FROM verify v
            JOIN patent p ON p.id = v.research_item
        WHERE p.translation = false
        GROUP BY v.research_entity
        ORDER BY v.research_entity
    ) sub ON sub.research_entity = u.research_entity
WHERE mg.id = $1
    --AND m.active = true
    AND u.active = true
ORDER BY mg.research_entity
