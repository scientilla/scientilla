SELECT
       p.draft_creator as research_entity,
       rit.type as item_type,
       'draft_agreements' as item_key,
       MIN(p.start_year) AS min,
       MAX(p.start_year) AS max
FROM project p
       JOIN research_item_type rit ON p.type = rit.id
WHERE p.draft_creator = $1 AND rit.key = 'project_agreement'
GROUP BY research_entity, item_key, item_type

UNION ALL

SELECT
       v.research_entity as research_entity,
       rit.type as item_type,
       'verified_agreements' as item_key,
       MIN(p.start_year) AS min,
       MAX(p.start_year) AS max
FROM verify v
       JOIN project p on v.research_item = p.id
       JOIN research_item_type rit ON p.type = rit.id
WHERE v.research_entity = $1 AND rit.key = 'project_agreement'
GROUP BY research_entity, item_key, item_type
