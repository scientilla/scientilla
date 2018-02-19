CREATE OR REPLACE VIEW oralpresentation AS
  SELECT
    "researchEntity",
    document
  FROM authorship
  WHERE oral_presentation = TRUE