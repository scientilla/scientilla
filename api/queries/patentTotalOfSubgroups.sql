WITH research_entity_patents AS (
    SELECT
        v.research_entity,
        COALESCE(COUNT(*), 0) AS total
    FROM verify v
        JOIN patent p ON p.id = v.research_item
    WHERE p.translation = false
    GROUP BY v.research_entity
), child_groups AS (
    SELECT *
    FROM "group" g
    WHERE g.type IN ('Research Line', 'Facility', 'Center')
)

SELECT
    subquery.group_id,
    subquery.group_name,
    subquery.group_end_date,
    COALESCE(SUM(subquery.total), 0) AS total
FROM (
    SELECT
        mg.parent_group AS parent_group,
        cg.id AS group_id,
        cg."name" AS group_name,
        (gd.imported_data -> 'matrix' ->> 'endDate')::text AS group_end_date,
        rep.total AS "total"
    FROM "membershipgroup" mg
        JOIN child_groups cg ON cg.id = mg.child_group
        JOIN "group" pg ON pg.id = mg.parent_group
        JOIN "group_data" gd ON gd.research_entity = cg.research_entity
        LEFT JOIN research_entity_patents rep ON rep.research_entity = cg.research_entity
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
        rep.total AS "total"
    FROM "membershipgroup" mg
        JOIN child_groups cg ON cg.id = mg.child_group
        JOIN "group" pg ON pg.id = mg.parent_group
        LEFT JOIN research_entity_patents rep ON rep.research_entity = cg.research_entity
    WHERE
        mg.parent_group = 1 AND
        mg.active = true
) subquery
WHERE subquery.parent_group = $1
GROUP BY
    subquery.group_id,
    subquery.group_name,
    subquery.group_end_date
