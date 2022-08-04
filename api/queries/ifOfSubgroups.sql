WITH document_types AS (
    SELECT dt.id
    FROM documenttype dt
    WHERE dt.key IN ('erratum', 'poster', 'phd_thesis', 'report', 'invited_talk', 'abstract_report')
), parent_documents AS (
    SELECT
        d.id AS id,
        d.source AS source
    FROM "document" d
        JOIN authorshipgroup ag ON ag.document = d.id
    WHERE d.documenttype <> ALL (SELECT id FROM document_types) AND ag."researchEntity" = $1
), research_entity_if AS (
    SELECT
        ag."researchEntity" AS group_id,
        SUM(lsm.value) AS total
    FROM authorshipgroup ag
        JOIN parent_documents pd ON ag.document = pd.id
        JOIN latest_source_metric lsm ON pd.source = lsm.source
    WHERE lsm.name = 'IF'
    GROUP BY ag."researchEntity"
    ORDER BY total DESC
), parent_if AS(
    SELECT SUM(reif.total) AS total
    FROM research_entity_if reif
    WHERE reif.group_id = $1
), child_groups AS (
    SELECT *
    FROM "group" g
    WHERE g.type IN ('Research Line', 'Facility', 'Center')
)

SELECT
    subquery.group_id,
    subquery.group_name,
    subquery.group_end_date,
    ROUND(COALESCE((SUM(subquery.total) / NULLIF((SELECT total FROM parent_if), 0)::FLOAT * 100)::NUMERIC, 0), 2) AS percentage
FROM (
    SELECT
        mg.parent_group,
        cg.id AS group_id,
        cg."name" AS group_name,
        (gd.imported_data -> 'matrix' ->> 'endDate')::TEXT AS group_end_date,
        reif.total
    FROM "membershipgroup" mg
        JOIN child_groups cg ON cg.id = mg.child_group
        JOIN "group_data" gd ON gd.research_entity = cg.research_entity
        LEFT JOIN research_entity_if reif ON reif.group_id = cg.id
    WHERE
        mg.parent_group != 1 AND
        mg.active = true AND
        (gd.imported_data -> 'matrix' ->> 'public')::TEXT::BOOLEAN = true

    UNION

    SELECT
        mg.parent_group,
        cg.id AS group_id,
        cg."name" AS group_name,
        null AS group_end_date,
        reif.total
    FROM "membershipgroup" mg
        JOIN child_groups cg ON cg.id = mg.child_group
        LEFT JOIN research_entity_if reif ON reif.group_id = cg.id
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
