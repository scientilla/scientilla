CREATE OR REPLACE VIEW documentsuggestiongroup AS
WITH RECURSIVE subg(parent_group, child_group, level) AS
                   (SELECT mg.parent_group,
                           mg.child_group,
                           1 AS level
                    FROM membershipgroup mg
                    UNION
                    SELECT mg.parent_group,
                           sg.child_group,
                           level + 1 AS level
                    FROM membershipgroup mg
                             JOIN subg sg ON mg.child_group = sg.parent_group)
SELECT DISTINCT document,
                "researchEntity"
FROM (SELECT a.document AS document,
             m.group    AS "researchEntity"
      FROM membership m
               JOIN authorship a
                    ON m.user = a."researchEntity"
               JOIN affiliation af
                    ON a.id = af.authorship
               JOIN document d
                    ON a.document = d.id
      --TODO: subsitute 1 with the default group id
      WHERE af.institute = 1
        AND m.active = true
        AND NULLIF(d.year, '') :: INT
          > 2006

      UNION

      SELECT d.id AS document, e."researchEntity" AS "researchEntity"
      FROM externaldocumentgroup e
               JOIN document d
                    ON e.document = d.id
      WHERE d.origin = 'scopus'
        AND NOT EXISTS (SELECT d2.id
                        FROM document d2
                                 JOIN authorshipgroup a2
                                      ON d2.id = a2.document
                        WHERE a2."researchEntity" = e."researchEntity"
                          AND d2.kind = 'v'
                          AND d2.origin = e.origin
                          AND d2.origin = 'scopus'
                          AND d2."scopusId" = d."scopusId")

      UNION

      SELECT ag.document AS document, mg.parent_group AS "researchEntity"
      FROM subg mg
               JOIN authorshipgroup ag
                    ON mg.child_group = ag."researchEntity"
               JOIN document d
                    ON ag.document = d.id) as suggested
WHERE NOT EXISTS(SELECT id
                 FROM authorshipgroup
                 WHERE "researchEntity" = suggested."researchEntity"
                   AND document = suggested.document)
  AND NOT EXISTS(SELECT dsg.id
                 FROM discardedgroup dsg
                 WHERE dsg."researchEntity" = suggested."researchEntity"
                   AND dsg.document = suggested.document);
