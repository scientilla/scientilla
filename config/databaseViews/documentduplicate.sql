CREATE OR REPLACE VIEW documentduplicate AS
  SELECT
    d.id    AS document,
    dd.id   AS duplicate,
    dd.kind AS "duplicateKind",
    u.id    AS "researchEntity",
    'user'  AS "researchEntityType",
    1       AS id
  FROM "user" u
    LEFT JOIN authorship a
      ON u.id = a."researchEntity"
    JOIN document dd
      ON a.document = dd.id
         OR u.id = dd."draftCreator"
    JOIN document d
      ON CASE WHEN d.type = 'invited_talk' OR dd.type = 'invited_talk'
      THEN coalesce((d."authorsStr" = dd."authorsStr") :: INT, 0) +
           coalesce((d.title = dd.title) :: INT, 0) +
           coalesce((d."itSource" = dd."itSource") :: INT, 0) > 1
         ELSE coalesce((d.doi = dd.doi) :: INT, 0) +
              coalesce((d."authorsStr" = dd."authorsStr") :: INT, 0) +
              coalesce((d.title = dd.title) :: INT, 0) +
              coalesce((d."scopusId" = dd."scopusId") :: INT, 0) > 1
         END
         AND d.id <> dd.id
  UNION
  SELECT
    d.id    AS document,
    dd.id   AS duplicate,
    dd.kind AS "duplicateKind",
    g.id    AS "researchEntity",
    'group' AS "researchEntityType",
    1       AS id
  FROM "group" g
    LEFT JOIN authorshipgroup a
      ON g.id = a."researchEntity"
    JOIN document dd
      ON a.document = dd.id
         OR g.id = dd."draftGroupCreator"
    JOIN document d
      ON CASE WHEN d.type = 'invited_talk' OR dd.type = 'invited_talk'
      THEN coalesce((d."authorsStr" = dd."authorsStr") :: INT, 0) +
           coalesce((d.title = dd.title) :: INT, 0) +
           coalesce((d."itSource" = dd."itSource") :: INT, 0) > 1
         ELSE coalesce((d.doi = dd.doi) :: INT, 0) +
              coalesce((d."authorsStr" = dd."authorsStr") :: INT, 0) +
              coalesce((d.title = dd.title) :: INT, 0) +
              coalesce((d."scopusId" = dd."scopusId") :: INT, 0) > 1
         END
         AND D.id <> dd.id