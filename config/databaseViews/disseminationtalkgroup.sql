CREATE OR REPLACE VIEW disseminationtalkgroup AS
  SELECT
    a."researchEntity",
    a.document
  FROM authorshipgroup a
    JOIN document d ON a.document = d.id
    JOIN sourcetype st ON d."sourceType" = st.key
  WHERE a.public = TRUE
        AND st.section = 'Dissemination'