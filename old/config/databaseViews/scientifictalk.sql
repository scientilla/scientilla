CREATE OR REPLACE VIEW scientifictalk AS
  SELECT
    a."researchEntity",
    a.document
  FROM authorship a
    JOIN document d ON a.document = d.id
    JOIN sourcetype st ON d."sourceType" = st.key
  WHERE a.public = TRUE
        AND st.section = 'Scientific Event'