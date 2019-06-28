SELECT d.year   AS year,
       count(*) AS value
FROM document d
         JOIN authorship a ON d.id = a.document
         JOIN source s ON d.source = s.id
WHERE a."researchEntity" = $1
  AND d.documenttype <> ALL ($3 :: INT[])
  AND s.type = $4
  AND exists(SELECT id
                 FROM affiliation
                 WHERE institute = $2
                   AND authorship = a.id
                   AND document = d.id)
GROUP BY d.year;