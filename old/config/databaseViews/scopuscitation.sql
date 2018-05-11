CREATE OR REPLACE VIEW scopuscitation AS
  SELECT
    d.id AS document,
    c.id AS citation
  FROM document d
    JOIN citation c
      ON d."scopusId" = c."originId"
         AND c.origin = 'scopus' :: TEXT;
