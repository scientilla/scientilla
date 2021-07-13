SELECT
       v.research_entity as research_entity,
       rit.type as item_type,
       'prosecutions' as item_key,
       CAST(MIN(p.filing_year) AS text) AS min,
       CAST(MAX(p.filing_year) AS text) AS max
FROM verify v
       JOIN patent p on v.research_item = p.id
       JOIN research_item_type rit ON p.type = rit.id
WHERE p.translation = false AND priority = false AND v.research_entity = $1
GROUP BY research_entity, item_type, item_key

UNION ALL

SELECT
       v.research_entity as research_entity,
       rit.type as item_type,
       'priorities' as item_key,
       CAST(MIN(p.filing_year) AS text) AS min,
       CAST(MAX(p.filing_year) AS text) AS max
FROM verify v
       JOIN patent p on v.research_item = p.id
       JOIN research_item_type rit ON p.type = rit.id
WHERE p.translation = false AND priority = true AND v.research_entity = $1
GROUP BY research_entity, item_type, item_key

UNION ALL

SELECT
       v.research_entity as research_entity,
       rit.type as item_type,
       'all' as item_key,
       CAST(MIN(p.filing_year) AS text) AS min,
       CAST(MAX(p.filing_year) AS text) AS max
FROM verify v
       JOIN patent p on v.research_item = p.id
       JOIN research_item_type rit ON p.type = rit.id
WHERE p.translation = false AND v.research_entity = $1
GROUP BY research_entity, item_type, item_key

UNION ALL

SELECT
       research_entity,
       item_type,
       item_key,
       MIN(subquery.min) AS min,
       MAX(subquery.max) AS max
FROM (
       SELECT
              v.research_entity as research_entity,
              rit.type as item_type,
              'all_translations' as item_key,
              CAST(LEAST(p.filing_year, p.issue_year) AS text) AS min,
              CAST(GREATEST(p.filing_year, p.issue_year) AS text) AS max
	FROM verify v
              JOIN patent p on v.research_item = p.id
              JOIN research_item_type rit ON p.type = rit.id
       WHERE v.research_entity = $1
) subquery
GROUP BY research_entity, item_type, item_key;