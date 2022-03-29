CREATE OR REPLACE VIEW scopus_document_metadata AS
SELECT m.id         AS id,
       d.id         AS document,
       d."scopusId" as scopus_id,
       m.data       AS "data"
FROM document d
         JOIN externaldocumentmetadata m
              ON d."scopusId" = m."origin_id"
                  AND m.origin = 'scopus' :: TEXT;
