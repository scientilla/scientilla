WITH group_patents AS (
    SELECT
        v.research_entity,
        p.id,
        p.translation
    FROM verify v
        JOIN patent p ON p.id = v.research_item
    WHERE
        p.translation = false AND
        v.research_entity = $1
), total_group_patents AS (
    SELECT COUNT(*) AS total
    FROM group_patents
)

SELECT
    u.id AS user_id,
    CONCAT(u.display_name, ' ', u.display_surname) AS user_name,
    m.active AS active_group_member,
    ROUND(COALESCE((sub.total / NULLIF((SELECT total FROM total_group_patents), 0)::FLOAT * 100)::NUMERIC, 0), 2) AS percentage
FROM "membership" m
    JOIN "user" u ON u.id = m.user
    JOIN "group" mg ON mg.id = m.group
    LEFT JOIN (
        SELECT
            v.research_entity AS research_entity,
            COUNT(*) AS total
        FROM verify v
            JOIN group_patents p ON p.id = v.research_item
        WHERE p.translation = false
        GROUP BY v.research_entity
    ) sub ON sub.research_entity = u.research_entity
WHERE
    mg.id = $1
    -- AND u.active = true
