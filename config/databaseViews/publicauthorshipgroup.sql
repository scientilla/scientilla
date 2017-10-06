CREATE OR REPLACE VIEW publicauthorshipgroup AS
  SELECT
    "researchEntity",
    document
  FROM authorshipgroup
  WHERE public = TRUE