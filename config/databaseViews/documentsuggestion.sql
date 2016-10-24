CREATE OR REPLACE VIEW documentsuggestion AS
  SELECT
    "reference"."id" AS "document",
    "user"."id"      AS "researchEntity"
  FROM "user"
    JOIN "reference"
      ON "reference"."authorsStr" ILIKE '%' :: TEXT || "user"."surname" || '%' :: TEXT
  WHERE "reference"."draft" = FALSE
        AND
        "reference"."id" NOT IN (
          SELECT "authorship"."document"
          FROM "authorship"
          WHERE "authorship"."researchEntity" = "user"."id"
        )
        AND
        "reference"."id" NOT IN (
          SELECT "reference_discardedcoauthors__user_discardedreferences"."reference_discardedCoauthors"
          FROM "reference_discardedcoauthors__user_discardedreferences"
          WHERE "reference_discardedcoauthors__user_discardedreferences"."user_discardedReferences" = "user"."id"
        )