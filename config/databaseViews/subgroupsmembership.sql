CREATE OR REPLACE VIEW subgroupsmembership AS
  WITH RECURSIVE subg(parent_group, child_group) AS (
    SELECT
      mg.parent_group,
      mg.child_group
    FROM membershipgroup mg
    UNION ALL
    SELECT
      mg.parent_group,
      sg.child_group
    FROM membershipgroup mg
      JOIN subg sg on mg.child_group = sg.parent_group
  )
  SELECT
    sg.parent_group AS "group",
    m."user"        AS "user",
    m.synchronized AS synchronized,
    m.active AS active
  FROM subg sg
    JOIN membership m ON m."group" = sg.child_group;