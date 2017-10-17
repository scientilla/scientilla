CREATE OR REPLACE VIEW documentsuggestion AS
  SELECT DISTINCT
    d.id AS "document",
    u.id AS "researchEntity"
  FROM "user" u
    JOIN "document" d
      ON d."authorsStr" ~* ANY (
      SELECT '\y' || str || '(,\s|$)'
      FROM alias
      WHERE alias.user = u.id
    )
    JOIN (SELECT a.document
          FROM "authorship" a
          WHERE a."researchEntity" IS NOT NULL
          UNION
          SELECT a.document
          FROM authorshipgroup a
          WHERE a."researchEntity" IS NOT NULL
         ) AS verified
      ON d.id = verified.document
  WHERE
    d."id" NOT IN (
      SELECT "authorship"."document"
      FROM "authorship"
      WHERE "authorship"."researchEntity" = u.id
    )
    AND
    d."id" NOT IN (
      SELECT "discarded"."document"
      FROM "discarded"
      WHERE "discarded"."researchEntity" = u.id
    )