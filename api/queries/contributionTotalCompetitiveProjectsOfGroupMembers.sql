WITH group_competitive_projects AS (
    SELECT
        v.research_entity AS research_entity,
        pc.id,
        pc.members
    FROM verify v
        JOIN project_competitive pc ON pc.id = v.research_item
    WHERE
        v.research_entity = $1
)

SELECT
    u.id AS user_id,
    concat(u.display_name, ' ', u.display_surname) AS user_name,
    m.active AS active_group_member,
    COALESCE(sub.total, 0) AS total
FROM "membership" m
    JOIN "user" u ON u.id = m.user
    JOIN "group" mg ON mg.id = m.group
    LEFT JOIN (
        SELECT
            vu.user,
            SUM((sub.members -> 'contributionObtained')::TEXT::float) AS total
        FROM verified_user vu
            JOIN group_competitive_projects gcp ON gcp.id = vu.research_item
            JOIN (
                SELECT
                    gcp.id AS project_id,
                    json_array_elements(gcp.members) AS members
                FROM group_competitive_projects gcp
            ) sub ON sub.project_id = gcp.id
        GROUP BY vu.user
    ) sub ON sub.user = u.id
WHERE mg.id = $1
    AND u.active = true
ORDER BY mg.id
