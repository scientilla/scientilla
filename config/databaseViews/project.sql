CREATE OR REPLACE VIEW project AS
SELECT ri.id,
       ri.kind,
       ri.type,
       rit.key,
       ri.draft_creator,
       ripc.project_data ->> 'code'                          AS code,
       ripc.project_data ->> 'acronym'                       AS acronym,
       ripc.project_data ->> 'title'                         AS title,
       ripc.project_data ->> 'abstract'                      AS abstract,
       ripc.project_data ->> 'instituteStartDate'            AS start_date,
       ripc.project_data ->> 'instituteEndDate'              AS end_date,
       ripc.project_data ->> 'type'                          AS project_type,
       ripc.project_data ->> 'type2'                         AS project_type_2,
       null                                                  AS category,
       null                                                  AS payment,
       ripc.project_data ->> 'instituteRole'                 AS role,
       ripc.project_data ->> 'status'                        AS status,
       ripc.project_data ->> 'url'                           AS url,
       cast(ripc.project_data ->> 'members' as json)         AS members,
       cast(ripc.project_data ->> 'researchLines' as json)   AS research_lines,
       cast(ripc.project_data ->> 'logos' as json)           AS logos,
       split_part(ripc.project_data ->> 'startDate', '-', 1) AS start_year,
       split_part(ripc.project_data ->> 'endDate', '-', 1)   AS end_year,
       members_str.str                                       AS pi_str,
       ripc.project_data,
       ripc."createdAt",
       ripc."updatedAt"
FROM research_item ri
         JOIN research_item_project_competitive ripc ON ri.id = ripc.research_item
         JOIN research_item_type rit ON ri.type = rit.id
         LEFT JOIN (SELECT research_item AS id,
                           string_agg(
                                   concat(lat.memebers_arr ->> 'email', ' ',
                                          lat.memebers_arr ->> 'name', ' ',
                                          lat.memebers_arr ->> 'surname'),
                                   ', ') AS str
                    FROM research_item_project_competitive ripc2,
                         LATERAL (SELECT json_array_elements(ripc2.project_data -> 'members') memebers_arr) lat
                    WHERE lat.memebers_arr ->> 'role' IN ('pi', 'co_pi')
                    GROUP BY research_item) AS members_str ON ri.id = members_str.id
UNION ALL
SELECT ri.id,
       ri.kind,
       ri.type,
       rit.key,
       ri.draft_creator,
       ripi.project_data ->> 'code'                          AS code,
       ripi.project_data ->> 'acronym'                       AS acronym,
       ripi.project_data ->> 'title'                         AS title,
       ripi.project_data ->> 'abstract'                      AS abstract,
       ripi.project_data ->> 'startDate'                     AS start_date,
       ripi.project_data ->> 'endDate'                       AS end_date,
       ripi.project_data ->> 'type'                          AS project_type,
       ripi.project_data ->> 'type2'                         AS project_type_2,
       ripi.project_data ->> 'category'                      AS category,
       ripi.project_data ->> 'payment'                       AS payment,
       null                                                  AS role,
       null                                                  AS status,
       ripi.project_data ->> 'url'                           AS url,
       cast(ripi.project_data ->> 'members' as json)         AS members,
       cast(ripi.project_data ->> 'researchLines' as json)   AS research_lines,
       null                                                  AS logos,
       split_part(ripi.project_data ->> 'startDate', '-', 1) AS start_year,
       split_part(ripi.project_data ->> 'endDate', '-', 1)   AS end_year,
       members_str.str                                       AS pi_str,
       ripi.project_data,
       ripi."createdAt",
       ripi."updatedAt"
FROM research_item ri
         JOIN research_item_project_industrial ripi on ri.id = ripi.research_item
         JOIN research_item_type rit ON ri.type = rit.id
         LEFT JOIN (SELECT research_item AS id,
                           string_agg(
                                   concat(lat.memebers_arr ->> 'email', ' ',
                                          lat.memebers_arr ->> 'name', ' ',
                                          lat.memebers_arr ->> 'surname'),
                                   ', ') AS str
                    FROM research_item_project_industrial ripi2,
                         LATERAL (SELECT json_array_elements(ripi2.project_data -> 'members') memebers_arr) lat
                    WHERE lat.memebers_arr ->> 'role' IN ('pi', 'co_pi')
                    GROUP BY research_item) AS members_str ON ri.id = members_str.id;