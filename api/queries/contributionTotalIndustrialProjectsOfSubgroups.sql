WITH competitive_project_contributions AS (
    SELECT pi.id as project, (sub.research_lines ->> 'code')::TEXT as code, COALESCE((sub.research_lines -> 'inCashContribution')::TEXT::float, 0) + COALESCE((sub.research_lines -> 'inKindContribution')::TEXT::float, 0) as contribution
    FROM project_industrial pi
        JOIN (
            SELECT pi.id as project_id, json_array_elements(pi.research_lines) as research_lines
            FROM project_industrial pi
        ) sub ON sub.project_id = pi.id
)

SELECT subquery.group_id, subquery.group_name, sum(contribution) as total
FROM (
    SELECT pg.id as parent_group, g.id as group_id, g."name" as group_name, cpc.contribution
    FROM "membershipgroup" mg
        JOIN "group" g ON g.id = mg.child_group
        JOIN "group" pg ON pg.id = mg.parent_group
        JOIN "group_data" gd ON gd.research_entity = g.research_entity
        JOIN verified_group vg ON vg.group = g.id
        JOIN competitive_project_contributions cpc ON vg.research_item = cpc.project
    WHERE pg.id != 1 AND mg.active = true AND g.active = TRUE AND (gd.imported_data -> 'matrix' ->> 'public')::text::boolean = true

    UNION

    SELECT pg.id as parent_group, g.id as group_id, g."name" as group_name, cpc.contribution
    FROM "membershipgroup" mg
        JOIN "group" g ON g.id = mg.child_group
        JOIN "group" pg ON pg.id = mg.parent_group
        JOIN competitive_project_contributions cpc ON cpc.code = any (
            SELECT g2.code
            FROM "membershipgroup" mg2
                JOIN "group" g2 ON g2.id = mg2.child_group
            WHERE mg2.parent_group = mg.child_group AND mg2.active = true
        )
        JOIN verified_group vg on vg.group = any (
            SELECT g3.id
            FROM "membershipgroup" mg3
                JOIN "group" g3 ON g3.id = mg3.child_group
            WHERE mg3.parent_group = pg.id AND mg3.active = true
        ) AND vg.research_item = project
    WHERE pg.id = 1 AND mg.active = true AND g.active = TRUE
) subquery
WHERE subquery.parent_group = $1
GROUP BY subquery.group_id, subquery.group_name
