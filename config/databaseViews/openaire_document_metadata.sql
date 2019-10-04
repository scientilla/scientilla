CREATE OR REPLACE VIEW openaire_document_metadata AS
SELECT m.id   AS id,
       d.id   AS document,
       m.data AS "data"
FROM document d
         JOIN externaldocumentmetadata m
              ON LOWER(d.doi) = LOWER(m.origin_id)
                  AND m.origin = 'openaire' :: TEXT;
