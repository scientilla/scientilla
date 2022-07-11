WITH document_types AS (
    SELECT dt.id
    FROM documenttype dt
    WHERE dt.key IN ('erratum', 'poster', 'phd_thesis', 'report', 'invited_talk', 'abstract_report')
), documents AS (
    SELECT d.id AS id
    FROM "document" d
    WHERE d.documenttype <> ALL (SELECT id FROM document_types)
), child_groups AS (
    SELECT *
    FROM "group" g
    WHERE g.type IN ('Research Line', 'Facility', 'Center')
)

SELECT
    sub.group_id,
    sub.group_name,
    sub.group_end_date,
    COALESCE(COUNT(*), 0) AS count
FROM (
    SELECT
        mg.parent_group,
        cg.id AS group_id,
        cg."name" AS group_name,
        (gd.imported_data -> 'matrix' ->> 'endDate')::text AS group_end_date,
        ag.document
    FROM "membershipgroup" mg
        JOIN child_groups cg ON cg.id = mg.child_group
        JOIN "group_data" gd ON gd.research_entity = cg.research_entity
        LEFT JOIN "authorshipgroup" ag ON ag."researchEntity" = cg.id
        LEFT JOIN documents ON documents.id = ag.document
    WHERE mg.parent_group != 1 AND
        mg.active = true AND
        (gd.imported_data -> 'matrix' ->> 'public')::text::boolean = true

    UNION

    SELECT
        mg.parent_group,
        cg.id AS group_id,
        cg."name" AS group_name,
        null AS group_end_date,
        ag.document
    FROM "membershipgroup" mg
        JOIN child_groups cg ON cg.id = mg.child_group
        LEFT JOIN "authorshipgroup" ag ON ag."researchEntity" = cg.id
        LEFT JOIN documents ON documents.id = ag.document
    WHERE mg.parent_group = 1
) sub
WHERE sub.parent_group = $1
GROUP BY
    sub.group_id,
    sub.group_name,
    sub.group_end_date
