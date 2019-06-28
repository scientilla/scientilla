CREATE OR REPLACE VIEW accomplishment_verify AS
SELECT v.id,
       v.public,
       v.favorite,
       v.research_item AS accomplishment,
       v.research_entity
FROM verify v