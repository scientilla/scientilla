CREATE OR REPLACE VIEW patent AS
SELECT ri.id,
       ri.kind,
       ri.type,
       ri.draft_creator,
       rip.code,
       rip.authors_str,
       rip.patent_family_data ->> 'docket' AS family_docket,
       rip.patent_data ->> 'application'   AS application,
       rip.patent_data ->> 'title'         AS title,
       rip.patent_data ->> 'inventors'     AS inventors,
       rip.patent_family_data,
       rip.patent_data,
       rip."createdAt",
       rip."updatedAt"
FROM research_item ri
         JOIN research_item_patent rip ON ri.id = rip.research_item;