WITH competitive_project_contributions AS (
    SELECT
        pc.id AS project,
        (sub.research_lines ->> 'code')::TEXT AS code,
        (sub.research_lines -> 'contribution')::TEXT::float AS contribution
    FROM project_competitive pc
        JOIN (
            SELECT
                pc.id AS project_id,
                json_array_elements(pc.research_lines) AS research_lines
            FROM project_competitive pc
        ) sub ON sub.project_id = pc.id
), child_groups AS (
    SELECT *
    FROM "group" g
    WHERE g.type IN ('Research Line', 'Facility', 'Center')
)

SELECT
    subquery.group_id,
    subquery.group_name,
    subquery.group_end_date,
    COALESCE(SUM(subquery.contribution), 0) AS total
FROM (
    SELECT
        mg.parent_group,
        cg.id AS group_id,
        cg."name" AS group_name,
        (gd.imported_data -> 'matrix' ->> 'endDate')::text AS group_end_date,
        cpc.contribution AS contribution
    FROM "membershipgroup" mg
        JOIN child_groups cg ON cg.id = mg.child_group
        JOIN "group_data" gd ON gd.research_entity = cg.research_entity
        LEFT JOIN verified_group vg ON vg.group = cg.id
        LEFT JOIN competitive_project_contributions cpc ON vg.research_item = cpc.project
    WHERE
        mg.parent_group != 1 AND
        mg.active = true AND
        (gd.imported_data -> 'matrix' ->> 'public'::text)::boolean = true

    UNION

    SELECT
        mg.parent_group,
        cg.id AS group_id,
        cg."name" AS group_name,
        null AS group_end_date,
        cpc.contribution AS contribution
    FROM "membershipgroup" mg
        JOIN child_groups cg ON cg.id = mg.child_group
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
