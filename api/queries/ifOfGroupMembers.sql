WITH document_types AS (
    SELECT dt.id
    FROM documenttype dt
    WHERE dt.key IN ('erratum', 'poster', 'phd_thesis', 'report', 'invited_talk', 'abstract_report')
), documents AS (
    SELECT
        d.id,
        d.source
    FROM "document" d
    WHERE d.documenttype <> ALL (SELECT id FROM document_types)
), parent_documents AS (
    SELECT
        ag.document AS id,
        documents.source
    FROM "authorshipgroup" ag
        LEFT JOIN documents ON documents.id = ag.document
    WHERE ag."researchEntity" = $1
), research_entity_if AS (
    SELECT
        a."researchEntity" AS research_entity,
        SUM(lsm.value) AS total
    FROM authorship a
        JOIN parent_documents pd ON a.document = pd.id
        JOIN latest_source_metric lsm ON pd.source = lsm.source
    WHERE lsm.name = 'IF'
    GROUP BY a."researchEntity"
    ORDER BY total DESC
), parent_if AS(
    SELECT
        ag."researchEntity" AS research_entity,
        SUM(lsm.value) AS total
    FROM authorshipgroup ag
        JOIN parent_documents pd ON ag.document = pd.id
        JOIN latest_source_metric lsm ON pd.source = lsm.source
    WHERE lsm.name = 'IF' AND ag."researchEntity" = $1
    GROUP BY ag."researchEntity"
)

SELECT
    u.id AS user_id,
    CONCAT(u.display_name, ' ', u.display_surname) AS user_name,
    m.active AS active_group_member,
    reif.total,
    (SELECT total FROM parent_if),
    ROUND(COALESCE(((reif.total / NULLIF((SELECT total FROM parent_if), 0))::FLOAT * 100)::NUMERIC, 0), 2) AS percentage
FROM "membership" m
    JOIN "user" u ON u.id = m.user
    JOIN "group" mg ON mg.id = m.group
    LEFT JOIN research_entity_if reif ON reif.research_entity = u.id
WHERE
    mg.id = $1
    AND u.active = true
