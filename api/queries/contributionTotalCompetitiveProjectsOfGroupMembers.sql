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
            sum((sub.members -> 'contributionObtained')::TEXT::float) as total
        FROM verified_user vu
            JOIN project_competitive pc ON pc.id = vu.research_item
            JOIN (
                SELECT pc.id as project_id, json_array_elements(pc.members) as members
                FROM project_competitive pc
            ) sub ON sub.project_id = pc.id
        GROUP BY vu.user
    ) sub ON sub.user = u.id
WHERE mg.id = $1
    --AND m.active = true
    AND u.active = true
ORDER BY mg.id
