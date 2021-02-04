SELECT
       v.research_entity as research_entity,
       rit.type as item_type,
       rit.key as item_key,
       MIN(p.start_year) AS min,
       MAX(p.start_year) AS max
FROM verify v
       JOIN project p on v.research_item = p.id
       JOIN research_item_type rit ON p.type = rit.id
WHERE v.research_entity = $1
GROUP BY research_entity, item_key, item_type

UNION ALL

SELECT
       v.research_entity as research_entity,
       rit.type as item_type,
       'all' as item_key,
       MIN(p.start_year) AS min,
       MAX(p.start_year) AS max
FROM verify v
       JOIN project p on v.research_item = p.id
       JOIN research_item_type rit ON p.type = rit.id
WHERE v.research_entity = $1
GROUP BY research_entity, item_type, item_key;