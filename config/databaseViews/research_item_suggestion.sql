CREATE OR REPLACE VIEW research_item_suggestion AS
SELECT DISTINCT research_item,
                research_entity
FROM (
         SELECT ri.id             AS research_item,
                u.research_entity AS research_entity,
                ri.kind
         FROM "user" u
                  JOIN research_item ri
                       ON exists(
                               SELECT au.id
                               FROM author au
                                        JOIN alias al ON lower(au.author_str) = lower(al.str)
                               WHERE au.research_item = ri.id
                                 AND al.user = u.id
                           )
         UNION
         SELECT ri.id             AS accomplishment,
                g.research_entity AS research_entity,
                ri.kind
         FROM "group" g
                  JOIN membership m on g.id = m."group"
                  JOIN "user" gu on m."user" = gu.id
                  JOIN research_item ri ON exists(
                 SELECT guv.id
                 FROM verify guv
                 WHERE gu.research_entity = guv.research_entity
                   AND ri.id = guv.research_item
             )
         WHERE exists(SELECT a.id
                      FROM author a
                               JOIN author_affiliation aa on aa.author = a.id
                      WHERE a.research_item = ri.id
                        AND aa.institute = 1)
     ) suggested

WHERE kind = 'v'
  AND NOT exists(
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