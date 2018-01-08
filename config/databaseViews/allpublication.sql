CREATE OR REPLACE VIEW allpublication AS
  SELECT
    a."researchEntity",
    a.document
  FROM authorship a
    JOIN document d ON a.document = d.id
    JOIN source s ON d.source = s.id
    JOIN sourcetype st ON s.sourcetype = st.id
  WHERE a.public = TRUE
        AND st.section = ''