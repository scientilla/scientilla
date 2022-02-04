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
WHERE
    p.translation = false AND (
        v.research_entity = $1 OR
        v.research_entity = ANY(
            SELECT g.research_entity as research_entity
            FROM subg sg
            JOIN "group" g on g.id = sg.child_group
            WHERE sg.parent_group = $1
        )
    )
GROUP BY p.year, p.priority
ORDER BY p.year
