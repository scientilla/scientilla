CREATE OR REPLACE VIEW publicauthorship AS
  SELECT
    "researchEntity",
    document
  FROM authorship
  WHERE public = TRUE