WITH selected_group AS (SELECT *
                        FROM "group"
                        WHERE id = $1),
     institute_data AS (SELECT EXTRACT(YEAR FROM COALESCE(
             NULLIF(ripc.project_data ->> 'instituteStartDate', '')::date,
             '1970-01-01'::date)) AS year,

                               SUM(CASE
                                       WHEN COALESCE(ripc.project_data ->> 'type', '') <> 'In Kind'
                                           THEN COALESCE((ripc.project_data ->> 'instituteContribution')::numeric,
                                                         0)
                                       ELSE 0
                                   END
                               )  AS in_cash_contribution,

                               SUM(CASE
                                       WHEN COALESCE(ripc.project_data ->> 'type', '') = 'In Kind'
                                           THEN COALESCE((ripc.project_data ->> 'instituteContribution')::numeric,
                                                         0)
                                       ELSE 0
                                   END
                               )  AS in_kind_contribution

                        FROM selected_group sg
                                 JOIN verify v
                                      ON v.research_entity = sg.research_entity
                                 JOIN research_item_project_competitive ripc
                                      ON ripc.research_item = v.research_item

                        WHERE sg.type = 'Institute'
                        GROUP BY 1),

     group_hierarchy AS
         (WITH RECURSIVE cte
                             AS (SELECT g.id,
                                        g.code,
                                        g.research_entity
                                 FROM "group" g
                                 WHERE g.id = (SELECT id FROM selected_group)

                                 UNION ALL

                                 SELECT child.id,
                                        child.code,
                                        child.research_entity
                                 FROM membershipgroup mg
                                          JOIN "group" child
                                               ON child.id = mg.child_group
                                          JOIN cte
                                               ON mg.parent_group = cte.id)
          SELECT *
          FROM cte),

     non_institute_data AS
         (SELECT EXTRACT(YEAR FROM COALESCE(
                 NULLIF(line ->> 'startDate', '')::date,
                 '1970-01-01'::date)) AS year,

                 SUM(
                         CASE
                             WHEN COALESCE(ripc.project_data ->> 'type', '') <> 'In Kind'
                                 AND line ->> 'code' = gh.code
                                 THEN COALESCE((line ->> 'contribution')::numeric, 0)
                             ELSE 0
                             END
                 )                    AS in_cash_contribution,

                 SUM(
                         CASE
                             WHEN COALESCE(ripc.project_data ->> 'type', '') = 'In Kind'
                                 AND line ->> 'code' = gh.code
                                 THEN COALESCE((line ->> 'contribution')::numeric, 0)
                             ELSE 0
                             END
                 )                    AS in_kind_contribution

          FROM selected_group sg
                   JOIN group_hierarchy gh ON TRUE
                   JOIN verify v
                        ON v.research_entity = gh.research_entity
                   JOIN research_item_project_competitive ripc
                        ON ripc.research_item = v.research_item
                   CROSS JOIN LATERAL jsonb_array_elements(ripc.project_data -> 'researchLines') AS line

          WHERE sg.type != 'Institute'
          GROUP BY 1),

     union_data AS (SELECT *
                    FROM institute_data
                    UNION ALL
                    SELECT *
                    FROM non_institute_data),

     all_years AS (SELECT generate_series(
                                      (SELECT MIN(year) FROM union_data)::int,
                                      (SELECT MAX(year) FROM union_data)::int
                          ) AS year)
SELECT ay.year,
       COALESCE(ud.in_cash_contribution, 0)       AS in_cash_contribution,
       COALESCE(ud.in_kind_contribution, 0)       AS in_kind_contribution,
       COALESCE(ud.in_cash_contribution, 0)
           + COALESCE(ud.in_kind_contribution, 0) AS total_contribution
FROM all_years ay
         LEFT JOIN union_data ud
                   ON ay.year = ud.year
ORDER BY ay.year;
