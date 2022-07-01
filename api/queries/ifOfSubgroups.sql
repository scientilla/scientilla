WITH research_entity_if AS (
    SELECT
        ag."researchEntity" as group_id,
        round(sum(lsm.value), 2) AS total
    FROM authorshipgroup ag
        JOIN document d ON ag.document = d.id
        JOIN latest_source_metric lsm ON d.source = lsm.source
    AND lsm.name = 'IF'
    AND d.documenttype <> ALL (
        SELECT dt.id
        FROM documenttype dt
        WHERE dt.key in ('erratum', 'poster', 'phd_thesis', 'report', 'invited_talk', 'abstract_report')
    )
    GROUP BY ag."researchEntity"
)

SELECT subquery.group_id, subquery.group_name, sum(subquery.total) as total
FROM (
    SELECT pg.id as parent_group, g.id as group_id, g."name" as group_name, reif.total AS "total"
    FROM "membershipgroup" mg
        JOIN "group" g ON g.id = mg.child_group
        JOIN "group" pg ON pg.id = mg.parent_group
        JOIN "group_data" gd ON gd.research_entity = g.research_entity
        JOIN research_entity_if reif ON reif.group_id = g.id
    WHERE pg.id != 1 AND mg.active = true AND g.active = TRUE AND (gd.imported_data -> 'matrix' ->> 'public')::text::boolean = true

    UNION

    SELECT pg.id as parent_group, g.id as group_id, g."name" as group_name, reif.total AS "total"
    FROM "membershipgroup" mg
        JOIN "group" g ON g.id = mg.child_group
        JOIN "group" pg ON pg.id = mg.parent_group
        JOIN research_entity_if reif ON reif.group_id = g.id
    WHERE pg.id = 1 AND mg.active = true AND g.active = TRUE
) subquery
WHERE subquery.parent_group = $1
GROUP BY subquery.group_id, subquery.group_name
