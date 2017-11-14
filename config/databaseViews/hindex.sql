CREATE OR REPLACE VIEW hindex AS
  WITH cit AS (
      SELECT
        a."researchEntity",
        sct.document,
        sct.citations
      FROM authorship a
        JOIN scopuscitationtotal sct
          ON a.document = sct.document
      WHERE "researchEntity" IS NOT NULL
  ),
      max_cit AS (SELECT
                    "researchEntity",
                    max(citations) AS m
                  FROM cit
                  GROUP BY "researchEntity"
    )
  SELECT
    "researchEntity",
    max(n) AS hindex
  FROM (
         SELECT
           "researchEntity",
           generate_series(1, m) AS n
         FROM max_cit) v
  WHERE n <= (SELECT count(*)
              FROM cit
              WHERE citations >= n
                    AND v."researchEntity" = cit."researchEntity"
  )
  GROUP BY "researchEntity";