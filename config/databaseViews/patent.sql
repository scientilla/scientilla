CREATE OR REPLACE VIEW patent AS
SELECT ri.id,
       ri.kind,
       ri.type,
       ri.draft_creator,
       rip.code,
       rip.authors_str,
       rip.patent_family_data ->> 'id'                             AS family_id,
       rip.patent_family_data ->> 'docket'                         AS family_docket,
       rip.patent_data ->> 'application'                           AS application,
       rip.patent_data ->> 'title'                                 AS title,
       rip.patent_data ->> 'inventors'                             AS inventors,
       (rip.patent_data ->> 'translation')::boolean                AS translation,
       (rip.patent_data ->> 'priority')::boolean                   AS priority,
       DATE_PART('year', (rip.patent_data ->> 'filingDate')::date) AS filing_year,
       DATE_PART('year', (rip.patent_data ->> 'issueDate')::date)  AS issue_year,
       CASE WHEN (rip.patent_data ->> 'translation')::boolean
            THEN DATE_PART('year', (rip.patent_data ->> 'issueDate')::date)
            ELSE DATE_PART('year', (rip.patent_data ->> 'filingDate')::date)
       END AS year,
       rip.patent_family_data,
       rip.patent_data,
       rip."createdAt",
       rip."updatedAt"
FROM research_item ri
         JOIN research_item_patent rip ON ri.id = rip.research_item;