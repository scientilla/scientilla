CREATE OR REPLACE VIEW documentsuggestiongroup AS
  SELECT
    "verifiedDocument"."id"  AS "document",
    "groupMembership"."group" AS "researchEntity"
  FROM (
         SELECT *
         FROM "membership"
       ) AS "groupMembership",
    (SELECT *
     FROM "document"
     WHERE "draft" = FALSE) AS "verifiedDocument"
  WHERE "verifiedDocument"."id" IN (
    SELECT "document"
    FROM "authorship"
    WHERE "researchEntity" IN (
      SELECT "user"
      FROM "membership"
      WHERE "group" = "groupMembership"."id")
          AND
          "verifiedDocument"."id" NOT IN (
            SELECT "document_discardedGroups"
            FROM "document_discardedgroups__group_discardeddocuments"
            WHERE "group_discardedDocuments" = "groupMembership"."group"
          )
          AND
          "verifiedDocument"."id" NOT IN (
            SELECT "authorshipgroup"."document"
            FROM "authorshipgroup"
            WHERE "authorshipgroup"."researchEntity" = "groupMembership"."group"
          )
  )

