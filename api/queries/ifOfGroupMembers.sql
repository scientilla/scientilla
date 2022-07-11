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
), group_documents AS (
    SELECT
        ag.document,
        documents.source
    FROM "authorshipgroup" ag
        LEFT JOIN documents ON documents.id = ag.document
    WHERE ag."researchEntity" = $1
)

SELECT
    u.id AS user_id,
    CONCAT(u.display_name, ' ', u.display_surname) AS user_name,
    m.active AS active_group_member,
    COALESCE(sub.total, 0) AS total
FROM "membership" m
    JOIN "user" u ON u.id = m.user
    JOIN "group" mg ON mg.id = m.group
    LEFT JOIN (
        SELECT
            a."researchEntity" AS research_entity,
            ROUND(SUM(lsm.value), 2) AS total
        FROM authorship a
            JOIN group_documents gd ON a.document = gd.document
            JOIN latest_source_metric lsm ON gd.source = lsm.source
        AND lsm.name = 'IF'
        GROUP BY a."researchEntity"
    ) sub ON sub.research_entity = u.id
WHERE
    mg.id = $1 AND
    u.active = true
