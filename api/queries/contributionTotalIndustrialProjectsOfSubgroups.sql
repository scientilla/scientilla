WITH parent_industrial_projects AS (
    SELECT
        pi.id,
        pi.research_lines,
        pi.project_data
    FROM project_industrial pi
        JOIN verified_group vg ON vg.research_item = pi.id
        JOIN "group" g ON g.id = vg.group
    WHERE g.id = $1
), industrial_project_contributions AS (
    SELECT
        pip.id AS project,
        (sub.research_lines ->> 'code')::TEXT AS code,
        COALESCE((sub.research_lines -> 'inCashContribution')::TEXT::FLOAT, 0) + COALESCE((sub.research_lines -> 'inKindContribution')::TEXT::float, 0) AS contribution
    FROM parent_industrial_projects pip
        JOIN (
            SELECT
                pip.id AS project_id,
                json_array_elements(pip.research_lines) AS research_lines
            FROM parent_industrial_projects pip
        ) sub ON sub.project_id = pip.id
), groups AS (
    SELECT g.id, g.research_entity, g.name, g.code
    FROM "group" g
    WHERE g.type IN ('Research Line', 'Facility', 'Center')
), center_groups AS (
    SELECT g.id, g.research_entity, g.name, g.code
    FROM membershipgroup mg
        JOIN groups g ON g.id = mg.child_group
    WHERE mg.parent_group = 1
), child_groups_code AS (
        SELECT *
        FROM membershipgroup mg
            JOIN center_groups cg ON cg.id = mg.child_group
        WHERE mg.parent_group = 1
    UNION
        SELECT *
        FROM membershipgroup mg
            JOIN groups g ON g.id = mg.child_group
        WHERE mg.parent_group != 1
), parent_contribution AS (
    select COALESCE(SUM(ipc.contribution), 0) AS total
    FROm industrial_project_contributions ipc
    WHERE ipc.code IN (SELECT code FROM child_groups_code)
)

SELECT
    subquery.group_id,
    subquery.group_name,
    subquery.group_end_date,
    ROUND(COALESCE(SUM(subquery.contribution) / NULLIF((SELECT total from parent_contribution), 0)::FLOAT * 100, 0)::NUMERIC, 2) AS percentage
FROM (
    SELECT
        mg.parent_group,
        g.id AS group_id,
        g."name" AS group_name,
        (gd.imported_data -> 'matrix' ->> 'endDate')::text AS group_end_date,
        ipc.contribution AS contribution
    FROM "membershipgroup" mg
        JOIN groups g ON g.id = mg.child_group
        JOIN "group_data" gd ON gd.research_entity = g.research_entity
        LEFT JOIN verified_group vg ON vg.group = g.id
        LEFT JOIN industrial_project_contributions ipc ON vg.research_item = ipc.project
    WHERE
        mg.parent_group != 1 AND
        mg.active = true AND
        (gd.imported_data -> 'matrix' ->> 'public'::TEXT)::BOOLEAN = true

    UNION

    SELECT
        mg.parent_group,
        g.id AS group_id,
        g."name" AS group_name,
        null AS group_end_date,
        ipc.contribution AS contribution
    FROM "membershipgroup" mg
        JOIN groups g ON g.id = mg.child_group
        LEFT JOIN industrial_project_contributions ipc ON ipc.code = ANY (
            SELECT g2.code
            FROM "membershipgroup" mg2
                JOIN "group" g2 ON g2.id = mg2.child_group
            WHERE
                mg2.parent_group = mg.child_group AND
                mg2.active = true
        )
        LEFT JOIN verified_group vg ON vg.group = ANY (
            SELECT g3.id
            FROM "membershipgroup" mg3
                JOIN "group" g3 ON g3.id = mg3.child_group
            WHERE
                mg3.parent_group = mg.parent_group AND
                mg3.active = true
        ) AND vg.research_item = project
    WHERE
        mg.parent_group = 1 AND
        mg.active = true
) subquery
WHERE subquery.parent_group = $1
GROUP BY
    subquery.group_id,
    subquery.group_name,
    subquery.group_end_date
ORDER BY percentage DESC
