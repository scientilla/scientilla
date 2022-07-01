SELECT
    u.id as user_id,
    concat(u.display_name, ' ', u.display_surname) as user_name,
    sub.total
FROM "membership" m
    JOIN "user" u ON u.id = m.user
    JOIN "group" mg ON mg.id = m.group
    JOIN (
        SELECT
            vu.user,
            sum(COALESCE(((sub.members -> 'inCashContribution')::TEXT::float), 0) +  COALESCE(((sub.members -> 'inCashContribution')::TEXT::float), 0))as total
        FROM verified_user vu
            JOIN project_industrial pi ON pi.id = vu.research_item
            JOIN (
                SELECT pi.id as project_id, json_array_elements(pi.members) as members
                FROM project_industrial pi
            ) sub ON sub.project_id = pi.id
        GROUP BY vu.user
    ) sub ON sub.user = u.id
WHERE mg.id = $1
    --AND m.active = true
    AND u.active = true
ORDER BY mg.research_entity
