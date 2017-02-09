CREATE OR REPLACE VIEW documentsuggestiongroup AS
  SELECT
    "authorship"."document" AS "document",
    "membership"."group"    AS "researchEntity"
  FROM "membership"
    JOIN "authorship"
      ON "membership"."user" = "authorship"."researchEntity"
    JOIN "affiliation"
      ON "authorship"."id" = "affiliation"."authorship"
  WHERE
    NOT EXISTS(
        SELECT *
        FROM "authorshipgroup"
        WHERE "researchEntity" = "membership"."group"
              AND "document" = "authorship"."document"
    )
    AND NOT EXISTS(
        SELECT *
        FROM "discardedgroup"
        WHERE "researchEntity" = "membership"."group"
              AND "document" = "authorship"."document"
    )
    AND "affiliation"."institute" = 1
--TODO: subsitute 1 with the default group id

