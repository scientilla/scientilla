SELECT
  d.year,
  count(*)
FROM authorshipgroup a
  JOIN document d ON a.document = d.id
  JOIN sourcetype st ON d."sourceType" = st.key
WHERE a."researchEntity" = $1
      AND d.type = 'invited_talk'
      AND st.section = 'Scientific Event'
GROUP BY d.year