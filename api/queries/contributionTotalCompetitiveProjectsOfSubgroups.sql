WITH parent_competitive_projects AS (
    SELECT
        pc.id,
        pc.research_lines,
        pc.project_data
    FROM project_competitive pc
        JOIN verified_group vg ON vg.research_item = pc.id
        JOIN "group" g ON g.id = vg.group
    WHERE g.id = $1
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
    select COALESCE(SUM(cpc.contribution), 0) AS total
    FROm competitive_project_contributions cpc
    WHERE cpc.code IN (SELECT code FROM child_groups_code)
)

SELECT
    subquery.group_id,
    subquery.group_name,
    subquery.group_end_date,
    ROUND(COALESCE(SUM(subquery.contribution) / NULLIF((SELECT total FROM parent_contribution), 0)::FLOAT * 100, 0)::NUMERIC, 2) AS percentage
FROM (
    SELECT
        mg.parent_group,
        g.id AS group_id,
        g."name" AS group_name,
        (gd.imported_data -> 'matrix' ->> 'endDate')::TEXT AS group_end_date,
        cpc.contribution AS contribution
    FROM "membershipgroup" mg
        JOIN groups g ON g.id = mg.child_group
        JOIN "group_data" gd ON gd.research_entity = g.research_entity
        LEFT JOIN verified_group vg ON vg.group = g.id
        LEFT JOIN competitive_project_contributions cpc ON vg.research_item = cpc.project
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
        cpc.contribution AS contribution
    FROM "membershipgroup" mg
        JOIN groups g ON g.id = mg.child_group
        LEFT JOIN competitive_project_contributions cpc ON cpc.code = ANY (
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
