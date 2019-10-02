CREATE OR REPLACE VIEW openaire_document_metadata AS
SELECT m.id   AS id,
       d.id   AS document,
       m.data AS "data"
FROM document d
         JOIN externaldocumentmetadata m
              ON d.doi = m.origin_id
                  AND m.origin = 'openaire' :: TEXT;
