CREATE OR REPLACE VIEW favoritepublicationgroup AS
  SELECT
    "researchEntity",
    document
  FROM authorshipgroup
  WHERE favorite = TRUE