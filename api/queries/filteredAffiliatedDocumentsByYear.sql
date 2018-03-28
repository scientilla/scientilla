SELECT
  docs.year AS year,
  count(*)  AS value
FROM (SELECT DISTINCT d.*
      FROM document d
        JOIN authorship a ON d.id = a.document
        JOIN affiliation af ON d.id = af.document
        JOIN source s ON d.source = s.id
      WHERE "researchEntity" = $1
            AND af.institute = $2
            AND d.documenttype <> ALL ($3 :: INT [])
            AND s.type = $4
     ) docs
GROUP BY docs.year