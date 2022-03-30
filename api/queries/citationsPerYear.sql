SELECT dc.year::int,
       sum(dc.value) AS value
FROM authorship a
         JOIN document d ON a.document = d.id
         JOIN document_scopus_citation dc ON d."scopusId" = dc.scopus_id
WHERE a."researchEntity" = $1
  AND d.documenttype <> ALL ($2 :: INT[])
GROUP BY dc.year