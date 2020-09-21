SELECT
       v.research_entity as research_entity,
       rit.type as item_type,
       rit.key as item_key,
       count(a) as count,
       MIN(a.year) AS min,
       MAX(a.year) AS max
FROM verify v
       JOIN accomplishment a on v.research_item = a.id
       JOIN research_item_type rit ON a.type = rit.id
WHERE v.research_entity = $1 AND rit.type = $2
GROUP BY research_entity, item_key, item_type

UNION ALL

SELECT
       v.research_entity as research_entity,
       rit.type as item_type,
       'all' as item_key,
       count(a) as count,
       MIN(a.year) AS min,
       MAX(a.year) AS max
FROM verify v
       JOIN accomplishment a on v.research_item = a.id
       JOIN research_item_type rit ON a.type = rit.id
WHERE v.research_entity = $1 AND rit.type = $2
GROUP BY research_entity, item_type, item_key;