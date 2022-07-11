WITH group_industrial_projects AS (
    SELECT
        v.research_entity AS research_entity,
        pi.id,
        pi.members
    FROM verify v
        JOIN project_industrial pi ON pi.id = v.research_item
    WHERE
        v.research_entity = $1
)

SELECT
    u.id AS user_id,
    CONCAT(u.display_name, ' ', u.display_surname) AS user_name,
    m.active AS active_group_member,
    COALESCE(sub.total, 0) AS total
FROM "membership" m
    JOIN "user" u ON u.id = m.user
    JOIN "group" mg ON mg.id = m.group
    LEFT JOIN (
        SELECT
            vu.user,
            SUM(COALESCE(((sub.members -> 'inCashContribution')::TEXT::float), 0) +  COALESCE(((sub.members -> 'inCashContribution')::TEXT::float), 0)) AS total
        FROM verified_user vu
            JOIN group_industrial_projects gip ON gip.id = vu.research_item
            JOIN (
                SELECT
                    gip.id AS project_id,
                    json_array_elements(gip.members) AS members
                FROM group_industrial_projects gip
            ) sub ON sub.project_id = gip.id
        GROUP BY vu.user
    ) sub ON sub.user = u.id
WHERE
    mg.id = $1 AND
    u.active = true
ORDER BY mg.research_entity
