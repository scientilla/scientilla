CREATE OR REPLACE VIEW documentduplicate AS
  SELECT DISTINCT
    d.id AS document,
    dd.id AS duplicate
  FROM document d
    LEFT JOIN authorship a
      ON d.id = a.document
    LEFT JOIN "user" u
      ON a."researchEntity" = u.id
         OR d."draftCreator" = u.id
    LEFT JOIN authorshipgroup ag
      ON d.id = ag.document
    LEFT JOIN "group" g
      ON ag."researchEntity" = g.id
         OR d."draftGroupCreator" = g.id
    LEFT JOIN authorship a2
      ON u.id = a2."researchEntity"
    LEFT JOIN authorshipgroup ag2
      ON g.id = ag2."researchEntity"
    JOIN document dd
      ON a2.document = dd.id
         OR ag2.document = dd.id
         OR u.id = dd."draftCreator"
         OR g.id = dd."draftGroupCreator"
  WHERE ((d.doi = dd.doi) :: INT
         + (d."authorsStr" = dd."authorsStr") :: INT
         + (d.title = dd.title) :: INT
         + (d."scopusId" = dd."scopusId") :: INT > 1)
        AND d.id <> dd.id
        AND (
          (d.kind = 'd' AND dd.kind IN ('d', 'v'))
          OR
          (d.kind = 'v' AND dd.kind = 'v'))