WITH RECURSIVE subg(parent_group, child_group, level) AS (
    SELECT
        mg.parent_group,
        mg.child_group,
        1 AS level
    FROM membershipgroup mg
    UNION
    SELECT
        mg.parent_group,
        sg.child_group,
        level + 1 AS level
    FROM membershipgroup mg
        JOIN subg sg ON mg.child_group = sg.parent_group
)
SELECT
    p.year,
    p.priority,
    count(*)
FROM research_item_patent rip
    JOIN "patent" p ON rip.research_item = p.id
    JOIN "verify" v ON rip.research_item = v.research_item
    JOIN "group" g ON v.research_entity = g.research_entity
WHERE
    p.translation = false AND (
        g.id = $1 OR
        g.research_entity = ANY(
            SELECT tmp_g.research_entity as research_entity
            FROM subg sg
            JOIN "group" tmp_g on tmp_g.id = sg.child_group
            WHERE sg.parent_group = g.id
        )
    )
GROUP BY p.year, p.priority
ORDER BY p.year
