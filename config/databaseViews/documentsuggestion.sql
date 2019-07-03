CREATE OR REPLACE VIEW documentsuggestion AS
SELECT DISTINCT
  "document",
  "researchEntity"
FROM (
       SELECT
         d.id AS "document",
         u.id AS "researchEntity"
       FROM "user" u
              JOIN "document" d
                   ON d."authorsStr" ~* ANY (
                     SELECT '\y' || str || '(,\s|$)'
                     FROM alias
                     WHERE alias.user = u.id
                   )
       WHERE d.kind = 'v'
         AND NOT EXISTS(
           SELECT "authorship".id
           FROM "authorship"
           WHERE "authorship"."researchEntity" = u.id
             AND "authorship"."document" = d.id
         )
         AND NOT EXISTS(
           SELECT ds.id
           FROM "discarded_document" ds
           WHERE ds."researchEntity" = u.id
             AND ds."document" = d.id
         )
       UNION
       SELECT
         d.id               AS "document",
         e."researchEntity" AS "researchEntity"
       FROM externaldocument e
              JOIN "document" d
                   ON e.document = d.id
       WHERE
         d.origin = 'scopus'
         AND NOT EXISTS(
           SELECT d2.id
           FROM document d2
                  JOIN authorship a2
                       ON d2.id = a2.document
                  JOIN "user" u2
                       ON a2."researchEntity" = u2.id
           WHERE u2.id = e."researchEntity"
             AND d2.kind = 'v'
             AND d2.origin = e.origin
             AND d2.origin = 'scopus'
             AND d2."scopusId" = d."scopusId"
         )
         AND NOT EXISTS(
           SELECT ds.id
           FROM "discarded_document" ds
           WHERE ds."researchEntity" = e."researchEntity"
             AND ds."document" = d.id
         )
         -- keep this query synchronized with the top one
         AND NOT EXISTS(
           SELECT d3.id
           FROM "user" u3
                  JOIN "document" d3
                       ON d3."authorsStr" ~* ANY (
                         SELECT '\y' || str || '(,\s|$)'
                         FROM alias
                         WHERE alias.user = u3.id
                       )
           WHERE d.kind = 'v'
             AND u3.id = e."researchEntity"
             AND d3."scopusId" = d."scopusId"
             AND d3.synchronized = TRUE
             AND NOT EXISTS(
               SELECT "authorship".id
               FROM "authorship"
               WHERE "authorship"."researchEntity" = u3.id
                 AND "authorship"."document" = d3.id
             )
             AND NOT EXISTS(
               SELECT ds.id
               FROM "discarded_document" ds
               WHERE ds."researchEntity" = u3.id
                 AND ds."document" = d3.id
             )
         )
     ) suggested;