CREATE OR REPLACE VIEW externaldocument AS
  SELECT
    u.id AS "researchEntity",
    d.id AS "document"
  FROM "externalid" ei
    JOIN "document" d
      ON (ei.origin = 'scopus' AND d."scopusId" = ei.document)
         OR (ei.origin = 'publications' AND d."iitPublicationsId" = ei.document)
    JOIN "user" u
      ON (ei.origin = 'scopus' AND u."scopusId" = ei."researchEntity")
         OR (ei.origin = 'publications' AND u."username" = ei."researchEntity")
  WHERE
    d.kind = 'e'
