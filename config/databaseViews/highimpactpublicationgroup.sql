CREATE OR REPLACE VIEW highimpactpublicationgroup AS
  SELECT
    a."researchEntity",
    a.document
  FROM authorshipgroup a
    JOIN document d ON a.document = d.id
    JOIN documenttype dt ON d.documenttype = dt.id
    JOIN source s ON d.source = s.id
    JOIN sourcetype st ON s.sourcetype = st.id
  WHERE a.public = TRUE
        AND st.section = ''
        AND dt.highimpact = TRUE