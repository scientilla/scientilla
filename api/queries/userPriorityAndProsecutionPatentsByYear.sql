SELECT
    p.year,
    p.priority,
    count(*)
FROM research_item_patent rip
    JOIN "patent" p ON rip.research_item = p.id
    JOIN "verify" v ON rip.research_item = v.research_item
    JOIN "user" u ON v.research_entity = u.research_entity
WHERE
    p.translation = false AND u.id = $1
GROUP BY p.year, p.priority
ORDER BY p.year
