CREATE OR REPLACE VIEW publication AS
  SELECT
    a."researchEntity",
    a.document
  FROM authorship a
    JOIN document d ON a.document = d.id
    LEFT JOIN source s ON d.source = s.id
    LEFT JOIN sourcetype st ON s.sourcetype = st.id
  WHERE a.public = TRUE
    AND d.type <> 'invited_talk';