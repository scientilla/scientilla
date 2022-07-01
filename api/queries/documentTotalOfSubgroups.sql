SELECT sub.group_id, sub.group_name, count(*)
FROM (
    SELECT pg.id as parent_group, g.id as group_id, g."name" as group_name, ag.document
    FROM "membershipgroup" mg
        JOIN "group" g ON g.id = mg.child_group
        JOIN "authorshipgroup" ag ON ag."researchEntity" = g.id
        JOIN "group" pg ON pg.id = mg.parent_group
        JOIN "group_data" gd ON gd.research_entity = g.research_entity
    WHERE pg.id != 1 AND mg.active = true AND g.active = TRUE AND (gd.imported_data -> 'matrix' ->> 'public')::text::boolean = true

    UNION

    SELECT pg.id as parent_group, g.id as group_id, g."name" as group_name, ag.document
    FROM "membershipgroup" mg
        JOIN "group" g ON g.id = mg.child_group
        JOIN "authorshipgroup" ag ON ag."researchEntity" = g.id
        JOIN "group" pg ON pg.id = mg.parent_group
    WHERE pg.id = 1 AND g.active = TRUE
) sub
WHERE sub.parent_group = $1
GROUP BY sub.group_id, sub.group_name
