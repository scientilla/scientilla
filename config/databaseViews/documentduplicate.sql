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
  WHERE (
          (d.doi = dd.doi AND (
            d."authorsStr" = dd."authorsStr"
            OR d.title = dd.title
            OR d."scopusId" = dd."scopusId"))
          OR (
            d."authorsStr" = dd."authorsStr" AND (
              d.doi = dd.doi
              OR d.title = dd.title
              OR d."scopusId" = dd."scopusId"))
          OR (
            d.title = dd.title AND (
              d.doi = dd.doi
              OR d."authorsStr" = dd."authorsStr"
              OR d."scopusId" = dd."scopusId"))
        )
        AND D.id <> dd.id
        AND (
          (D.kind = 'd' AND dd.kind IN ('d', 'v'))
          OR
          (D.kind = 'v' AND dd.kind = 'v'))
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
  WHERE (
          (d.doi = dd.doi AND (
            d."authorsStr" = dd."authorsStr"
            OR d.title = dd.title
            OR d."scopusId" = dd."scopusId"))
          OR (
            d."authorsStr" = dd."authorsStr" AND (
              d.doi = dd.doi
              OR d.title = dd.title
              OR d."scopusId" = dd."scopusId"))
          OR (
            d.title = dd.title AND (
              d.doi = dd.doi
              OR d."authorsStr" = dd."authorsStr"
              OR d."scopusId" = dd."scopusId"))
        )
        AND D.id <> dd.id
        AND (
          (D.kind = 'd' AND dd.kind IN ('d', 'v'))
          OR
          (D.kind = 'v' AND dd.kind = 'v'))
