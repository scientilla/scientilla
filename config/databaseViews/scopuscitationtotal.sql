CREATE OR REPLACE VIEW scopuscitationtotal AS (
  SELECT
    sc.document      AS document,
    sum(c.citations) AS citations
  FROM scopuscitation sc
    JOIN citation c
      ON sc.citation = c.id
  GROUP BY sc.document
);