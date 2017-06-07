CREATE OR REPLACE VIEW documentsuggestion AS
  SELECT DISTINCT
    d."id"      AS "document",
    "user"."id" AS "researchEntity"
  FROM "user"
    JOIN "document" d
      ON d."authorsStr" ILIKE '%' :: TEXT || "user"."surname" || '%' :: TEXT
    JOIN (SELECT a.document
          FROM "authorship" a
          WHERE a."researchEntity" IS NOT NULL
          UNION
          SELECT a.document
          FROM "authorshipgroup" a
          WHERE a."researchEntity" IS NOT NULL
         ) AS verified
      ON d.id = verified.document
  WHERE
    d."id" NOT IN (
      SELECT "authorship"."document"
      FROM "authorship"
      WHERE "authorship"."researchEntity" = "user"."id"
    )
    AND
    d."id" NOT IN (
      SELECT "discarded"."document"
      FROM "discarded"
      WHERE "discarded"."researchEntity" = "user"."id"
    )