WITH research_entity_patents AS (
    SELECT
        v.research_entity as research_entity,
        count(*) as total
    FROM verify v
        JOIN patent p ON p.id = v.research_item
    WHERE p.translation = false
    GROUP BY v.research_entity
)

SELECT subquery.group_id, subquery.group_name, sum(subquery.total) as total
FROM (
    SELECT pg.id as parent_group, g.id as group_id, g."name" as group_name, rep.total AS "total"
    FROM "membershipgroup" mg
        JOIN "group" g ON g.id = mg.child_group
        JOIN "group" pg ON pg.id = mg.parent_group
        JOIN "group_data" gd ON gd.research_entity = g.research_entity
        JOIN research_entity_patents rep ON rep.research_entity = g.research_entity
    WHERE pg.id != 1 AND mg.active = true AND g.active = TRUE AND (gd.imported_data -> 'matrix' ->> 'public'::text)::boolean = true

    UNION

    SELECT pg.id as parent_group, g.id as group_id, g."name" as group_name, rep.total AS "total"
    FROM "membershipgroup" mg
        JOIN "group" g ON g.id = mg.child_group
        JOIN "group" pg ON pg.id = mg.parent_group
        JOIN research_entity_patents rep ON rep.research_entity = g.research_entity
    WHERE pg.id = 1 AND mg.active = true AND g.active = TRUE
) subquery
WHERE subquery.parent_group = $1
GROUP BY subquery.group_id, subquery.group_name
