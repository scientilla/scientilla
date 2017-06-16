CREATE OR REPLACE VIEW documentduplicate AS
  SELECT
    d.id   AS document,
    dd.id  AS duplicate,
    u.id   AS "researchEntity",
    'user' AS "researchEntityType",
    1      AS id
  FROM document d,
        "user" u
    LEFT JOIN authorship a
      ON u.id = a."researchEntity"
    JOIN document dd
      ON a.document = dd.id
         OR u.id = dd."draftCreator"
  WHERE
         CASE WHEN d.type = 'invited_talk' OR dd.type = 'invited_talk'
           THEN (d."authorsStr" = dd."authorsStr") :: INT +
                (d.title = dd.title) :: INT +
                (d."itSource" = dd."itSource") :: INT > 1
         ELSE (d.doi = dd.doi) :: INT +
              (d."authorsStr" = dd."authorsStr") :: INT +
              (d.title = dd.title) :: INT +
              (d."scopusId" = dd."scopusId") :: INT > 1
         END
        AND d.id <> dd.id
        AND (
          (d.kind = 'd' AND dd.kind IN ('d', 'v'))
          OR
          (d.kind IN ('v', 'e') AND dd.kind = 'v'))
  UNION
  SELECT
    d.id    AS document,
    dd.id   AS duplicate,
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
      THEN (d."authorsStr" = dd."authorsStr") :: INT +
           (d.title = dd.title) :: INT +
           (d."itSource" = dd."itSource") :: INT > 1
         ELSE (d.doi = dd.doi) :: INT +
              (d."authorsStr" = dd."authorsStr") :: INT +
              (d.title = dd.title) :: INT +
              (d."scopusId" = dd."scopusId") :: INT > 1
         END
         AND D.id <> dd.id
         AND (
           (D.kind = 'd' AND dd.kind IN ('d', 'v'))
           OR
           (D.kind IN ('v', 'e') AND dd.kind = 'v'))