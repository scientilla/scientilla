WITH parent_competitive_projects AS (
    SELECT
        v.research_entity AS research_entity,
        pc.id,
        pc.members,
        pc.research_lines
    FROM verify v
        JOIN project_competitive pc ON pc.id = v.research_item
    WHERE
        v.research_entity = $1
), competitive_project_contributions AS (
    SELECT
        pcp.id AS project,
        (sub.research_lines ->> 'code')::TEXT AS code,
        (sub.research_lines -> 'contribution')::TEXT::FLOAT AS contribution
    FROM parent_competitive_projects pcp
        JOIN (
            SELECT
                pcp.id AS project_id,
                json_array_elements(pcp.research_lines) AS research_lines
            FROM parent_competitive_projects pcp
        ) sub ON sub.project_id = pcp.id
), total_parent_contribution AS (
    SELECT COALESCE(SUM(cpc.contribution), 0) AS total
    FROM competitive_project_contributions cpc
    WHERE cpc.code = (SELECT code FROM "group" g WHERE g.research_entity = $1)
)

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
            SUM((sub.members ->> 'contributionObtained')::TEXT::FLOAT) as contribution
        FROM parent_competitive_projects pcp
            JOIN (
                SELECT
                    pcp.id as project_id,
                    json_array_elements(pcp.members) AS members
                FROM parent_competitive_projects pcp
            ) sub ON sub.project_id = pcp.id
            JOIN "user" u ON u.legacy_email = sub.members ->> 'email'
        GROUP BY u.id
    ) sub ON sub.user_id = u.id
WHERE mg.id = $1
    --AND u.active = true
ORDER BY percentage DESC
