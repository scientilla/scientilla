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
      THEN (coalesce(d."authorsStr", '') != '' AND coalesce(dd."authorsStr", '') != '' AND d."authorsStr" = dd."authorsStr") :: INT +
           (coalesce(d.title, '') != '' AND coalesce(dd.title, '') != '' AND d.title = dd.title) :: INT +
           (coalesce(d."itSource", '') != '' AND coalesce(dd."itSource", '') != '' AND d."itSource" = dd."itSource") :: INT > 1
         ELSE (coalesce(d.doi, '') != '' AND coalesce(dd.doi, '') != '' AND d.doi = dd.doi) :: INT + +
              (coalesce(d."authorsStr", '') != '' AND coalesce(dd."authorsStr", '') != '' AND d."authorsStr" = dd."authorsStr") :: INT +
              (coalesce(d.title, '') != '' AND coalesce(dd.title, '') != '' AND d.title = dd.title) :: INT +
              (coalesce(d."scopusId", '') != '' AND coalesce(dd."scopusId", '') != '' AND d."scopusId" = dd."scopusId") :: INT > 1
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
      THEN (coalesce(d."authorsStr", '') != '' AND coalesce(dd."authorsStr", '') != '' AND d."authorsStr" = dd."authorsStr") :: INT +
           (coalesce(d.title, '') != '' AND coalesce(dd.title, '') != '' AND d.title = dd.title) :: INT +
           (coalesce(d."itSource", '') != '' AND coalesce(dd."itSource", '') != '' AND d."itSource" = dd."itSource") :: INT > 1
         ELSE (coalesce(d.doi, '') != '' AND coalesce(dd.doi, '') != '' AND d.doi = dd.doi) :: INT + +
              (coalesce(d."authorsStr", '') != '' AND coalesce(dd."authorsStr", '') != '' AND d."authorsStr" = dd."authorsStr") :: INT +
              (coalesce(d.title, '') != '' AND coalesce(dd.title, '') != '' AND d.title = dd.title) :: INT +
              (coalesce(d."scopusId", '') != '' AND coalesce(dd."scopusId", '') != '' AND d."scopusId" = dd."scopusId") :: INT > 1
         END
         AND D.id <> dd.id