CREATE OR REPLACE VIEW favoritedocumentgroup AS
  SELECT DISTINCT
    "document",
    "researchEntity"
  FROM authorshipgroup a
    JOIN document d ON a.document = d.id
  WHERE a.favorite = TRUE