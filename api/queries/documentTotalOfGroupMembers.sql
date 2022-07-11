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
)

SELECT
    u2.id AS user_id,
    CONCAT(u2.display_name, ' ', u2.display_surname) AS user_name,
    sub.active_group_member,
    sub.count
FROM (
    SELECT
        m.user,
        m.active AS active_group_member,
        COALESCE(COUNT(gd.document), 0) AS "count"
    FROM "membership" m
        JOIN "user" u ON u.id = m.user
        LEFT JOIN "authorship" a ON u.id = a."researchEntity"
        LEFT JOIN group_documents gd ON gd.document = a.document
    WHERE m.group = $1
        AND u.active = true
    GROUP BY m.user, m.active
) sub
    JOIN "user" u2 ON u2.id = sub."user"
ORDER BY u2.display_surname
