CREATE OR REPLACE VIEW research_item_favorite AS
  SELECT
    v.research_entity,
    v.research_item
  FROM verify v
    JOIN research_item ri ON v.research_item = ri.id
  WHERE v.favorite = TRUE
    AND ri.kind = 'v'