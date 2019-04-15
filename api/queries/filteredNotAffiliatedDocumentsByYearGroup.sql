SELECT d.year   AS year,
       count(*) AS value
FROM document d
         JOIN authorshipgroup ag ON d.id = ag.document
         JOIN source s ON d.source = s.id
WHERE ag."researchEntity" = $1
  AND d.documenttype <> ALL ($3 :: INT[])
  AND s.type = $4
  AND NOT exists(SELECT id
             FROM affiliation
             WHERE institute = $2
               AND document = d.id)
GROUP BY d.year;