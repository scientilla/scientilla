SELECT d.year::int,
       round(sum(lsm.value), 2) AS value
FROM authorship a
         JOIN document d ON a.document = d.id
         JOIN latest_source_metric lsm ON d.source = lsm.source
WHERE a."researchEntity" = $1
  AND lsm.name = $2
GROUP BY d.year