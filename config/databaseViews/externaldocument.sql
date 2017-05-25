CREATE OR REPLACE VIEW externaldocument AS
  SELECT
    u.id AS "researchEntity",
    d.id AS "document"
  FROM "externalid" ei
    JOIN "document" d
      ON d."scopusId" = ei.document
    JOIN "user" u
      ON (ei.origin = 'scopus' AND u."scopusId" = ei."researchEntity")
         OR (ei.origin = 'orcid' AND u."orcidId" = ei."researchEntity")
         OR (ei.origin = 'publications' AND u."username" = ei."researchEntity")
  WHERE
    d.kind = 'e'
