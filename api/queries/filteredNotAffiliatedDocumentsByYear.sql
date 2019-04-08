SELECT
  d.year   AS year,
  count(*) AS value
FROM document d
  JOIN authorship a ON d.id = a.document
  JOIN source s ON d.source = s.id
WHERE "researchEntity" = $1
      AND s.type = $4
      AND d.documenttype <> ALL ($3 :: INT [])
      AND d.id NOT IN (SELECT DISTINCT d2.id
                       FROM document d2
                         JOIN authorship a2 ON d2.id = a2.document
                         JOIN affiliation af ON af.authorship = a2.id
                       WHERE "researchEntity" = $1
                             AND af.institute = $2)
GROUP BY d.year