CREATE OR REPLACE VIEW documentduplicate AS
  WITH dd AS (
    SELECT
      dd.id,
      dd.doi,
      dd."authorsStr",
      dd.title,
      dd."scopusId",
      dd.kind,
      g.id AS "researchEntity"
    FROM "group" g
      JOIN authorshipgroup a
        ON g.id = a."researchEntity"
      JOIN document dd
        ON a.document = dd.id
    UNION
    SELECT
      dd.id,
      dd.doi,
      dd."authorsStr",
      dd.title,
      dd."scopusId",
      dd.kind,
      g.id AS "researchEntity"
    FROM "group" g
      JOIN document dd
        ON g.id = dd."draftGroupCreator"
  )
  SELECT *
  FROM (
         SELECT
           d.id                AS document,
           dd.id               AS duplicate,
           dd.kind             AS "duplicateKind",
           dd."researchEntity" AS "researchEntity",
           'group'             AS "researchEntityType",
           1                   AS id
         FROM
           dd
           JOIN document d ON
                             lower(REPLACE(d."authorsStr", ' ', '')) =
                             lower(REPLACE(dd."authorsStr", ' ', ''))
                             AND
                             lower(replace(replace(d."title", ' ', ''), '-', '')) =
                             lower(replace(replace(dd."title", ' ', ''), '-', ''))
         WHERE
           d."authorsStr" != '' AND
           dd."authorsStr" != '' AND
           d.title != '' AND
           dd.title != ''
         UNION
         SELECT
           d.id                AS document,
           dd.id               AS duplicate,
           dd.kind             AS "duplicateKind",
           dd."researchEntity" AS "researchEntity",
           'group'             AS "researchEntityType",
           1                   AS id
         FROM
           dd
           JOIN document d
             ON
               lower(REPLACE(d."doi", ' ', '')) = lower(REPLACE(dd."doi", ' ', ''))
         WHERE
           d.doi != '' AND
           dd.doi != ''
         UNION
         SELECT
           d.id                AS document,
           dd.id               AS duplicate,
           dd.kind             AS "duplicateKind",
           dd."researchEntity" AS "researchEntity",
           'group'             AS "researchEntityType",
           1                   AS id
         FROM
           dd
           JOIN document d
             ON
               lower(REPLACE(d."scopusId", ' ', '')) = lower(REPLACE(dd."scopusId", ' ', ''))
         WHERE
           d."scopusId" != '' AND
           dd."scopusId" != ''
       ) tmp
  WHERE
    document <> duplicate
  UNION
  (WITH dd AS (
    SELECT
      dd.id,
      dd.doi,
      dd."authorsStr",
      dd.title,
      dd."scopusId",
      dd.kind,
      u.id AS "researchEntity"
    FROM "user" u
      JOIN authorship a
        ON u.id = a."researchEntity"
      JOIN document dd
        ON a.document = dd.id
    UNION
    SELECT
      dd.id,
      dd.doi,
      dd."authorsStr",
      dd.title,
      dd."scopusId",
      dd.kind,
      u.id AS "researchEntity"
    FROM "user" u
      JOIN document dd
        ON u.id = dd."draftCreator"
  )
  SELECT *
  FROM (
         SELECT
           d.id                AS document,
           dd.id               AS duplicate,
           dd.kind             AS "duplicateKind",
           dd."researchEntity" AS "researchEntity",
           'group'             AS "researchEntityType",
           1                   AS id
         FROM
           dd
           JOIN document d ON
                             lower(REPLACE(d."authorsStr", ' ', '')) =
                             lower(REPLACE(dd."authorsStr", ' ', ''))
                             AND
                             lower(replace(replace(d."title", ' ', ''), '-', '')) =
                             lower(replace(replace(dd."title", ' ', ''), '-', ''))
         WHERE
           d."authorsStr" != '' AND
           dd."authorsStr" != '' AND
           d.title != '' AND
           dd.title != ''
         UNION
         SELECT
           d.id                AS document,
           dd.id               AS duplicate,
           dd.kind             AS "duplicateKind",
           dd."researchEntity" AS "researchEntity",
           'group'             AS "researchEntityType",
           1                   AS id
         FROM
           dd
           JOIN document d
             ON
               lower(REPLACE(d."doi", ' ', '')) = lower(REPLACE(dd."doi", ' ', ''))
         WHERE
           d.doi != '' AND
           dd.doi != ''
         UNION
         SELECT
           d.id                AS document,
           dd.id               AS duplicate,
           dd.kind             AS "duplicateKind",
           dd."researchEntity" AS "researchEntity",
           'group'             AS "researchEntityType",
           1                   AS id
         FROM
           dd
           JOIN document d
             ON
               lower(REPLACE(d."scopusId", ' ', '')) = lower(REPLACE(dd."scopusId", ' ', ''))
         WHERE
           d."scopusId" != '' AND
           dd."scopusId" != ''
       ) tmp
  WHERE
    document <> duplicate
  )
