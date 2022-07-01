SELECT
    u.id as user_id,
    concat(u.display_name, ' ', u.display_surname) as user_name,
    sub.total
FROM "membership" m
    JOIN "user" u ON u.id = m.user
    JOIN "group" mg ON mg.id = m.group
    JOIN (
        SELECT
            a."researchEntity" as research_entity,
            round(sum(lsm.value), 2) AS total
        FROM authorship a
            JOIN document d ON a.document = d.id
            JOIN latest_source_metric lsm ON d.source = lsm.source
        AND lsm.name = 'IF'
        AND d.documenttype <> ALL (
            SELECT dt.id
            FROM documenttype dt
            WHERE dt.key in ('erratum', 'poster', 'phd_thesis', 'report', 'invited_talk', 'abstract_report')
        )
        GROUP BY a."researchEntity"
    ) sub ON sub.research_entity = u.id
WHERE mg.id = $1
    -- AND m.active = true
    AND u.active = true
