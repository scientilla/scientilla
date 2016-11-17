CREATE OR REPLACE VIEW documentsuggestion AS
  SELECT
    "document"."id" AS "document",
    "user"."id"      AS "researchEntity"
  FROM "user"
    JOIN "document"
      ON "document"."authorsStr" ILIKE '%' :: TEXT || "user"."surname" || '%' :: TEXT
  WHERE "document"."draft" = FALSE
        AND
        "document"."id" NOT IN (
          SELECT "authorship"."document"
          FROM "authorship"
          WHERE "authorship"."researchEntity" = "user"."id"
        )
        AND
        "document"."id" NOT IN (
          SELECT "document_discardedcoauthors__user_discardeddocuments"."document_discardedCoauthors"
          FROM "document_discardedcoauthors__user_discardeddocuments"
          WHERE "document_discardedcoauthors__user_discardeddocuments"."user_discardedDocuments" = "user"."id"
        )