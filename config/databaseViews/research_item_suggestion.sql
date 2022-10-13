CREATE OR REPLACE VIEW research_item_suggestion AS
WITH main_istitute_research_item AS
         (SELECT *
          FROM research_item ri
          WHERE kind = 'v'
            AND exists(SELECT *
                       FROM author a
                                JOIN author_affiliation aa on aa.author = a.id
                       WHERE a.research_item = ri.id
                         AND aa.institute = 1))
SELECT DISTINCT research_item,
                research_entity
FROM (SELECT ri.id             AS research_item,
             u.research_entity AS research_entity,
             ri.kind
      FROM "user" u
               JOIN research_item ri
                    ON exists(
                            SELECT *
                            FROM author au
                                     JOIN alias al ON lower(au.author_str) = lower(al.str)
                            WHERE au.research_item = ri.id
                              AND al.user = u.id
                        )
      UNION
      SELECT ri.id             AS research_item,
             g.research_entity AS research_entity,
             ri.kind
      FROM "group" g
               JOIN membership m on g.id = m."group"
               JOIN "user" gu on m."user" = gu.id
               JOIN verify guv on gu.research_entity = guv.research_entity
               JOIN main_istitute_research_item ri ON ri.id = guv.research_item
      UNION
      SELECT ri.id             AS research_item,
             g.research_entity AS research_entity,
             ri.kind
      FROM "group" g
               JOIN membershipgroup m on g.id = m.parent_group
               JOIN "group" g2 on m."child_group" = g2.id
               JOIN verify g2v on g2.research_entity = g2v.research_entity
               JOIN main_istitute_research_item ri ON ri.id = g2v.research_item) suggested
WHERE NOT exists(
        SELECT v.id
        FROM verify v
        WHERE v.research_item = suggested.research_item
          AND v.research_entity = suggested.research_entity
    )
  AND NOT exists(
        SELECT d.id
        FROM discarded d
        WHERE d.research_item = suggested.research_item
          AND d.research_entity = suggested.research_entity
    );