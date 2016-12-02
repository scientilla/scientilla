CREATE OR REPLACE VIEW documentsuggestiongroup AS
  SELECT
    "authorship"."document"  AS "document",
    "membership"."group" AS "researchEntity"
  FROM "membership"
  JOIN "authorship" ON "membership"."user" = "authorship"."researchEntity"
  WHERE NOT EXISTS (
    SELECT * FROM "authorshipgroup" WHERE "researchEntity" = "membership"."group" AND "document" = "authorship"."document"
  )
  AND NOT EXISTS (
    SELECT * FROM "discardedgroup" WHERE "researchEntity" = "membership"."group" AND "document" = "authorship"."document"
  )

