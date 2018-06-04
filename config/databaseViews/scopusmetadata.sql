CREATE OR REPLACE VIEW scopusdocumentmetadata AS
  SELECT
    m.id      AS id,
    d.id   AS document,
    m.data AS "data"
  FROM document d
    JOIN externaldocumentmetadata m
      ON d."scopusId" = m."origin_id"
         AND m.origin = 'scopus' :: TEXT;
