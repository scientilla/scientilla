CREATE OR REPLACE VIEW documentsuggestiongroup AS
SELECT DISTINCT document,
                "researchEntity"
FROM (
         SELECT a.document AS document,
                m.group    AS "researchEntity"
         FROM membership m
                  JOIN authorship a
                       ON m.user = a."researchEntity"
                  JOIN affiliation af
                       ON a.id = af.authorship
                  JOIN document d
                       ON a.document = d.id
         WHERE NOT EXISTS(
                 SELECT id
                 FROM authorshipgroup
                 WHERE "researchEntity" = m.group
                   AND document = a.document
             )
           AND NOT EXISTS(
                 SELECT dsg.id
                 FROM discardedgroup dsg
                 WHERE dsg."researchEntity" = m.group
                   AND dsg.document = a.document
             )
           --TODO: subsitute 1 with the default group id
           AND af.institute = 1
           AND m.active = true
           AND NULLIF(d.year, '') :: INT > 2006

         UNION

         SELECT d.id               AS document,
                e."researchEntity" AS "researchEntity"
         FROM externaldocumentgroup e
                  JOIN document d
                       ON e.document = d.id
         WHERE d.origin = 'scopus'
           AND NOT EXISTS(
                 SELECT d2.id
                 FROM document d2
                          JOIN authorshipgroup a2
                               ON d2.id = a2.document
                          JOIN "user" u2
                               ON a2."researchEntity" = u2.id
                 WHERE u2.id = e."researchEntity"
                   AND d2.kind = 'v'
                   AND d2.origin = e.origin
                   AND d2.origin = 'scopus'
                   AND d2."scopusId" = d."scopusId"
             )
           AND NOT EXISTS(
                 SELECT dsg.id
                 FROM discardedgroup dsg
                 WHERE dsg."researchEntity" = e."researchEntity"
                   AND dsg.document = d.id
             )

         UNION

         SELECT ag.document     AS document,
                mg.parent_group AS "researchEntity"
         FROM membershipgroup mg
                  JOIN authorshipgroup ag
                       ON mg.child_group = ag."researchEntity"
                  JOIN document d
                       ON ag.document = d.id
         WHERE NOT EXISTS(
                 SELECT ag2.id
                 FROM authorshipgroup ag2
                 WHERE ag2."researchEntity" = mg.parent_group
                   AND ag2.document = ag.document
             )
           AND NOT EXISTS(
                 SELECT dsg.id
                 FROM discardedgroup dsg
                 WHERE dsg."researchEntity" = mg.parent_group
                   AND dsg.document = ag.document
             )
     ) suggested;

