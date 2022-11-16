SELECT
       ris.research_entity as research_entity,
       rit.type as item_type,
       rit.key as item_key,
       MIN(p.start_year) AS min,
       MAX(p.start_year) AS max
FROM "research_item_suggestion" ris
       JOIN project p on ris.research_item = p.id
       JOIN research_item_type rit ON p.type = rit.id
WHERE ris.research_entity = $1 AND rit.key IN ('project_competitive', 'project_industrial')
GROUP BY research_entity, item_key, item_type

UNION ALL

SELECT
       ris.research_entity as research_entity,
       rit.type as item_type,
       'all' as item_key,
       MIN(p.start_year) AS min,
       MAX(p.start_year) AS max
FROM "research_item_suggestion" ris
       JOIN project p on ris.research_item = p.id
       JOIN research_item_type rit ON p.type = rit.id
WHERE ris.research_entity = $1 AND rit.key IN ('project_competitive', 'project_industrial')
GROUP BY research_entity, item_type, item_key;
