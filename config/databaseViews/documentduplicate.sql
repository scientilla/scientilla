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
  WHERE ((d.doi = dd.doi) :: INT +
         (d."authorsStr" = dd."authorsStr") :: INT +
         (d.title = dd.title) :: INT +
         (d."scopusId" = dd."scopusId") :: INT > 1)
        AND D.id <> dd.id
        AND (
          (D.kind = 'd' AND dd.kind IN ('d', 'v'))
          OR
          (D.kind in ('v','e') AND dd.kind = 'v'))
  UNION
  SELECT
    d.id    AS document,
    dd.id   AS duplicate,
    g.id    AS "researchEntity",
    'group' AS "researchEntityType",
    1       AS id
  FROM document d,
    "group" g
    LEFT JOIN authorshipgroup a
      ON g.id = a."researchEntity"
    JOIN document dd
      ON a.document = dd.id
         OR g.id = dd."draftGroupCreator"
  WHERE ((d.doi = dd.doi) :: INT +
         (d."authorsStr" = dd."authorsStr") :: INT +
         (d.title = dd.title) :: INT +
         (d."scopusId" = dd."scopusId") :: INT > 1)
        AND D.id <> dd.id
        AND (
          (D.kind = 'd' AND dd.kind IN ('d', 'v'))
          OR
          (D.kind in ('v','e') AND dd.kind = 'v'))