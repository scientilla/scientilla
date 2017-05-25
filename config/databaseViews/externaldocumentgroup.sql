CREATE OR REPLACE VIEW externaldocumentgroup AS
  SELECT
    g.id AS "researchEntity",
    d.id AS "document"
  FROM "externalidgroup" ei
    JOIN "document" d
      ON d."scopusId" = ei.document
    JOIN "group" g
      ON (ei.origin = 'scopus' AND g."scopusId" = ei."researchEntity")
         OR (ei.origin = 'publications' AND g."publicationsAcronym" = ei."researchEntity")
  WHERE
    d.kind = 'e'