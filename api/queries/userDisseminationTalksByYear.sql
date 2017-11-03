SELECT
  d.year,
  count(*)
FROM authorship a
  JOIN document d ON a.document = d.id
  JOIN sourcetype st ON d."sourceType" = st.key
WHERE a."researchEntity" = $1
      AND d.type = 'invited_talk'
      AND st.section = 'Dissemination'
GROUP BY d.year