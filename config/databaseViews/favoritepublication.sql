CREATE OR REPLACE VIEW favoritepublication AS
  SELECT
    "researchEntity",
    document
  FROM authorship
  WHERE favorite = TRUE