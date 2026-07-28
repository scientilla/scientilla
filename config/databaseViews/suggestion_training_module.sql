CREATE OR REPLACE VIEW suggestion_training_module AS
SELECT DISTINCT research_item,
                research_entity
FROM (
    SELECT ri.id             AS research_item,
           u.research_entity AS research_entity
    FROM "user" u
             JOIN alias al ON al.user = u.id
             JOIN author au ON lower(au.author_str) = lower(al.str)
             JOIN research_item ri ON au.research_item = ri.id
             JOIN research_item_type rit ON ri.type = rit.id
    WHERE ri.kind = 'v'
      AND rit.key IN ('training_module_phd_lecture', 'training_module_summer_winter_school_lecture')

    UNION

    SELECT ri.id             AS research_item,
           g.research_entity AS research_entity
    FROM "group" g
             JOIN membership m ON g.id = m."group" AND m.active = true
             JOIN "user" gu ON m."user" = gu.id
             JOIN verify guv ON gu.research_entity = guv.research_entity
             JOIN research_item ri ON ri.id = guv.research_item
             JOIN research_item_type rit ON ri.type = rit.id
    WHERE ri.kind = 'v'
      AND rit.key IN ('training_module_phd_lecture', 'training_module_summer_winter_school_lecture')
      AND EXISTS (
          SELECT 1
          FROM author a
                   JOIN author_affiliation aa ON aa.author = a.id
          WHERE a.research_item = ri.id
            AND aa.institute = 1
      )

    UNION

    SELECT ri.id             AS research_item,
           g.research_entity AS research_entity
    FROM "group" g
             JOIN membershipgroup m ON g.id = m.parent_group AND m.active = true
             JOIN "group" g2 ON m."child_group" = g2.id
             JOIN verify g2v ON g2.research_entity = g2v.research_entity
             JOIN research_item ri ON ri.id = g2v.research_item
             JOIN research_item_type rit ON ri.type = rit.id
    WHERE ri.kind = 'v'
      AND rit.key IN ('training_module_phd_lecture', 'training_module_summer_winter_school_lecture')
      AND EXISTS (
          SELECT 1
          FROM author a
                   JOIN author_affiliation aa ON aa.author = a.id
          WHERE a.research_item = ri.id
            AND aa.institute = 1
      )
) suggested
WHERE NOT EXISTS (
    SELECT 1
    FROM verify v
    WHERE v.research_item = suggested.research_item
      AND v.research_entity = suggested.research_entity
)
  AND NOT EXISTS (
    SELECT 1
    FROM discarded d
    WHERE d.research_item = suggested.research_item
      AND d.research_entity = suggested.research_entity
);
