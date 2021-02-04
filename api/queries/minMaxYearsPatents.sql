SELECT
       v.research_entity as research_entity,
       rit.type as item_type,
       rit.key as item_key,
       MIN(p.filing_year) AS min,
       MAX(p.filing_year) AS max
FROM verify v
       JOIN patent p on v.research_item = p.id
       JOIN research_item_type rit ON p.type = rit.id
WHERE v.research_entity = $1
GROUP BY research_entity, item_key, item_type;