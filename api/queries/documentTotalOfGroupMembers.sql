WITH document_types AS (
    SELECT dt.id
    FROM documenttype dt
    WHERE dt.key IN ('erratum', 'poster', 'phd_thesis', 'report', 'invited_talk', 'abstract_report')
), documents AS (
    SELECT d.id AS id
    FROM "document" d
    WHERE d.documenttype <> ALL (SELECT id FROM document_types)
), group_documents AS (
    SELECT ag.document
    FROM "authorshipgroup" ag
        LEFT JOIN documents ON documents.id = ag.document
    WHERE ag."researchEntity" = $1
), total_group_documents AS (
    SELECT COUNT(*) AS total
    FROM group_documents
)

SELECT
    u2.id AS user_id,
    CONCAT(u2.display_name, ' ', u2.display_surname) AS user_name,
    sub.active_group_member,
    sub.percentage
FROM (
    SELECT
        m.user,
        m.active AS active_group_member,
        ROUND((COALESCE(COUNT(gd.document), 0) / NULLIF((SELECT total FROM total_group_documents), 0)::FLOAT * 100)::NUMERIC, 2) AS percentage
    FROM "membership" m
        JOIN "user" u ON u.id = m.user
        LEFT JOIN "authorship" a ON u.id = a."researchEntity"
        JOIN group_documents gd ON gd.document = a.document
    WHERE m.group = $1
        --AND u.active = true
    GROUP BY m.user, m.active
) sub
    JOIN "user" u2 ON u2.id = sub."user"
ORDER BY sub.percentage DESC
