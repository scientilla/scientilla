CREATE OR REPLACE VIEW scopuscitation AS
  SELECT DISTINCT
    d.id AS "document",
    c.id AS "citation"
  FROM "document" d
    JOIN (SELECT *
          FROM "citation"
          WHERE origin = 'scopus') c
      ON d."scopusId" = c."originId"