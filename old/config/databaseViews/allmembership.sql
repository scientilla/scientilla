CREATE OR REPLACE VIEW allmembership AS
  SELECT DISTINCT ON ("user", "group") *
  FROM (
         WITH RECURSIVE subg(parent_group, child_group, level) AS (
           SELECT
             mg.parent_group,
             mg.child_group,
             1 AS level
           FROM membershipgroup mg
           UNION
           SELECT
             mg.parent_group,
             sg.child_group,
             level + 1 AS level
           FROM membershipgroup mg
             JOIN subg sg ON mg.child_group = sg.parent_group
         )
         SELECT
           1              AS id,
           m."user"       AS "user",
           m."group"      AS "group",
           m.synchronized AS synchronized,
           m.active       AS active,
           m."group"      AS child_group,
           0              AS level
         FROM membership m
         UNION
         SELECT
           1               AS id,
           m."user"        AS "user",
           sg.parent_group AS "group",
           m.synchronized  AS synchronized,
           m.active        AS active,
           sg.child_group  AS child_group,
           sg.level        AS level
         FROM subg sg
           JOIN membership m ON m."group" = sg.child_group
         ORDER BY level ASC
       ) am;
