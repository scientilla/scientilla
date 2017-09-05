CREATE OR REPLACE VIEW documentmetric AS
  SELECT DISTINCT
    d.id  AS document,
    sm.id AS metric
  FROM document d
    JOIN "sourcemetric" sm
      ON sm.source = d.source
  WHERE sm.year = (SELECT max(year)
                   FROM sourcemetric sm2
                   WHERE sm.origin = sm2.origin)