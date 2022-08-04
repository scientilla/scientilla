WITH parent_industrial_projects AS (
    SELECT
        v.research_entity AS research_entity,
        pi.id,
        pi.members,
        pi.research_lines
    FROM verify v
        JOIN project_industrial pi ON pi.id = v.research_item
    WHERE
        v.research_entity = $1
), industrial_project_contributions AS (
    SELECT
        pip.id AS project,
        (sub.research_lines ->> 'code')::TEXT AS code,
        COALESCE((sub.research_lines -> 'inCashContribution')::TEXT::FLOAT, 0) + COALESCE((sub.research_lines -> 'inKindContribution')::TEXT::FLOAT, 0) AS contribution
    FROM parent_industrial_projects pip
        JOIN (
            SELECT
                pip.id AS project_id,
                json_array_elements(pip.research_lines) AS research_lines
            FROM parent_industrial_projects pip
        ) sub ON sub.project_id = pip.id
), total_parent_contribution AS (
    select COALESCE(SUM(ipc.contribution), 0) AS total
    FROM industrial_project_contributions ipc
    WHERE ipc.code = (SELECT code FROM "group" g WHERE g.research_entity = $1)
)
--
SELECT
    u.id AS user_id,
    concat(u.display_name, ' ', u.display_surname) AS user_name,
    m.active AS active_group_member,
    ROUND(COALESCE((sub.contribution / NULLIF((SELECT total FROM total_parent_contribution), 0)::FLOAT * 100)::NUMERIC, 0), 2) AS percentage
FROM "membership" m
    JOIN "user" u ON u.id = m.user
    JOIN "group" mg ON mg.id = m.group
    LEFT JOIN (
        SELECT
            u.id AS user_id,
            SUM(COALESCE(((sub.members -> 'inCashContribution')::TEXT::float), 0)) AS contribution
        FROM parent_industrial_projects pip
            JOIN (
                SELECT
                    pip.id as project_id,
                    json_array_elements(pip.members) AS members
                FROM parent_industrial_projects pip
            ) sub ON sub.project_id = pip.id
            JOIN "user" u ON u.legacy_email = sub.members ->> 'email'
        GROUP BY u.id
    ) sub ON sub.user_id = u.id
WHERE mg.id = $1
   -- AND u.active = true
ORDER BY percentage DESC
