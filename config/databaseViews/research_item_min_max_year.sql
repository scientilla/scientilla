CREATE OR REPLACE VIEW research_item_min_max_year AS
SELECT
       1 as id,
       v.research_entity as research_entity,
       rit.type as item_type,
       rit.key as item_key,
       count(p) as count,
       MIN(p.start_date) AS min,
       MAX(p.start_date) AS max
FROM verify v
       JOIN project p on v.research_item = p.id
       JOIN research_item_type rit ON p.type = rit.id
GROUP BY research_entity, item_key, item_type

UNION ALL

SELECT
       1 as id,
       v.research_entity as research_entity,
       rit.type as item_type,
       'all' as item_key,
       count(p) as count,
       MIN(p.start_date) AS min,
       MAX(p.start_date) AS max
FROM verify v
       JOIN project p on v.research_item = p.id
       JOIN research_item_type rit ON p.type = rit.id
GROUP BY research_entity, item_type, item_key

UNION ALL

SELECT
        1 as id,
       v.research_entity as research_entity,
       rit.type as item_type,
       rit.key as item_key,
       count(a) as count,
       MIN(a.year) AS min,
       MAX(a.year) AS max
FROM verify v
       JOIN accomplishment a on v.research_item = a.id
       JOIN research_item_type rit ON a.type = rit.id
GROUP BY research_entity, item_key, item_type

UNION ALL

SELECT
        1 as id,
       v.research_entity as research_entity,
       rit.type as item_type,
       'all' as item_key,
       count(a) as count,
       MIN(a.year) AS min,
       MAX(a.year) AS max
FROM verify v
       JOIN accomplishment a on v.research_item = a.id
       JOIN research_item_type rit ON a.type = rit.id
GROUP BY research_entity, item_type, item_key;