SELECT
  d.year,
  count(*)
FROM authorshipgroup a
  JOIN document d ON a.document = d.id
  JOIN source s ON d.source = s.id
WHERE a."researchEntity" = $1
      AND s.type = 'bookseries'
GROUP BY d.year