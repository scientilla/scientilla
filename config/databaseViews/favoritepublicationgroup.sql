CREATE OR REPLACE VIEW favoritepublicationgroup AS
  SELECT
    a."researchEntity",
    a.document
  FROM authorshipgroup a
    JOIN document d ON a.document = d.id
    JOIN source s ON d.source = s.id
    JOIN sourcetype st ON s.sourcetype = st.id
  WHERE a.favorite = TRUE
        AND a.public = TRUE
        AND st.type = 'publication'