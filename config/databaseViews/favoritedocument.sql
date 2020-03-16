CREATE OR REPLACE VIEW favoritedocument AS
  SELECT DISTINCT
    "document",
    "researchEntity"
  FROM authorship a
    JOIN document d ON a.document = d.id
  WHERE a.favorite = TRUE