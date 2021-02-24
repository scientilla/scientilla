CREATE OR REPLACE VIEW project AS
SELECT ri.id,
       ri.kind,
       ri.type,
       rit.key,
       ri.draft_creator,
       ripc.project_data ->> 'code'                        AS code,
       ripc.project_data ->> 'acronym'                     AS acronym,
       ripc.project_data ->> 'title'                       AS title,
       ripc.project_data ->> 'abstract'                    AS abstract,
       ripc.project_data ->> 'instituteStartDate'          AS start_date,
       ripc.project_data ->> 'instituteEndDate'            AS end_date,
       ripc.project_data ->> 'type'                        AS project_type,
       ripc.project_data ->> 'type2'                       AS project_type_2,
       null                                                AS category,
       null                                                AS payment,
       ripc.project_data ->> 'instituteRole'               AS role,
       ripc.project_data ->> 'status'                      AS status,
       ripc.project_data ->> 'url'                         AS url,
       cast(ripc.project_data ->> 'members' as json)       AS members,
       cast(ripc.project_data ->> 'researchLines' as json) AS research_lines,
       cast(ripc.project_data ->> 'logos' as json)         AS logos,
       ripc.group,
       ripc.start_year,
       ripc.end_year,
       ripc.pi_str,
       ripc.project_data,
       ripc."createdAt",
       ripc."updatedAt"
FROM research_item ri
         JOIN research_item_project_competitive ripc ON ri.id = ripc.research_item
         JOIN research_item_type rit ON ri.type = rit.id

UNION ALL
SELECT ri.id,
       ri.kind,
       ri.type,
       rit.key,
       ri.draft_creator,
       ripi.project_data ->> 'code'                        AS code,
       ripi.project_data ->> 'acronym'                     AS acronym,
       ripi.project_data ->> 'title'                       AS title,
       ripi.project_data ->> 'abstract'                    AS abstract,
       ripi.project_data ->> 'startDate'                   AS start_date,
       ripi.project_data ->> 'endDate'                     AS end_date,
       ripi.project_data ->> 'type'                        AS project_type,
       ripi.project_data ->> 'type2'                       AS project_type_2,
       ripi.project_data ->> 'category'                    AS category,
       ripi.project_data ->> 'payment'                     AS payment,
       null                                                AS role,
       null                                                AS status,
       ripi.project_data ->> 'url'                         AS url,
       cast(ripi.project_data ->> 'members' as json)       AS members,
       cast(ripi.project_data ->> 'researchLines' as json) AS research_lines,
       null                                                AS logos,
       ripi.group,
       ripi.start_year,
       ripi.end_year,
       ripi.pi_str,
       ripi.project_data,
       ripi."createdAt",
       ripi."updatedAt"
FROM research_item ri
         JOIN research_item_project_industrial ripi on ri.id = ripi.research_item
         JOIN research_item_type rit ON ri.type = rit.id

UNION ALL

SELECT ri.id,
       ri.kind,
       ri.type,
       rit.key,
       ri.draft_creator,
       null                              AS code,
       null                              AS acronym,
       ripa.project_data ->> 'title'     AS title,
       ripa.project_data ->> 'subject'   AS abstract,
       ripa.project_data ->> 'startDate' AS start_date,
       ripa.project_data ->> 'endDate'   AS end_date,
       null                              AS project_type,
       null                              AS project_type_2,
       null                              AS category,
       null                              AS payment,
       null                              AS role,
       null                              AS status,
       null                              AS url,
       null                              AS members,
       null                              AS research_lines,
       null                              AS logos,
       ripa.group,
       ripa.start_year,
       ripa.end_year,
       ripa.pi_str,
       ripa.project_data,
       ripa."createdAt",
       ripa."updatedAt"
FROM research_item ri
         JOIN research_item_project_agreement ripa on ri.id = ripa.research_item
         JOIN research_item_type rit ON ri.type = rit.id;