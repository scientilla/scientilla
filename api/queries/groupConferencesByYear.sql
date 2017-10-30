SELECT
  d.year,
  count(*)
FROM authorshipgroup a
  JOIN document d ON a.document = d.id
WHERE a."researchEntity" = $1
      AND type = 'conference_paper'
GROUP BY d.year