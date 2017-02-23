SELECT
  d.type,
  count(*)
FROM authorshipgroup a
  JOIN document d ON a.document = d.id
WHERE a."researchEntity" = $1
GROUP BY d.type