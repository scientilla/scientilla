CREATE OR REPLACE VIEW oralpresentationgroup AS
  SELECT
    ag."researchEntity",
    ag.document
  FROM authorshipgroup ag
    JOIN document d ON ag.document = d.id
    JOIN source s ON d.source = s.id
    JOIN sourcetype st ON s.sourcetype = st.id
  WHERE exists(
    SELECT *
    FROM authorship a
    WHERE a.document = d.id AND oral_presentation = TRUE
  )
  AND ag.public = TRUE
  AND st.type = 'publication'