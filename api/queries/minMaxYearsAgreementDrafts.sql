SELECT
       p.draft_creator as research_entity,
       rit.type as item_type,
       rit.key as item_key,
       MIN(p.start_year) AS min,
       MAX(p.start_year) AS max
FROM project p
       JOIN research_item_type rit ON p.type = rit.id
WHERE p.draft_creator = $1 AND rit.key = 'project_agreement'
GROUP BY research_entity, item_key, item_type