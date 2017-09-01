CREATE OR REPLACE VIEW documentmetric AS
  SELECT DISTINCT
    d.id  AS document,
    sm.id AS "metric"
  FROM (SELECT
          document.*,
          source.issn,
          source.eissn
        FROM document
          JOIN source
            ON document.source = source.id) d
    JOIN "sourcemetric" sm
      ON d.issn = sm.issn OR d.eissn = sm.eissn
  WHERE sm.year = date_part('year', CURRENT_DATE)