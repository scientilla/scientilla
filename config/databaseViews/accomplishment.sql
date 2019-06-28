CREATE OR REPLACE VIEW accomplishment AS
    SELECT ri.id,
           ri.kind,
           ri.type,
           ri.draft_creator,
           ria.title,
           ria.authors_str,
           ria.year,
           ria.issuer,
           NULL AS year_to,
           NULL AS source,
           NULL AS editorship_role,
           NULL AS event_type,
           NULL AS place,
           NULL AS description
    FROM research_item ri
             JOIN research_item_award ria on ri.id = ria.research_item
    UNION
    SELECT ri.id,
           ri.kind,
           ri.type,
           ri.draft_creator,
           rie.title,
           rie.authors_str,
           rie.year_from AS year,
           NULL          AS issuer,
           rie.year_to,
           rie.source,
           rie.editorship_role,
           NULL          AS event_type,
           NULL          AS place,
           NULL          AS description
    FROM research_item ri
             JOIN research_item_editorship rie on ri.id = rie.research_item
    UNION
    SELECT ri.id,
           ri.kind,
           ri.type,
           ri.draft_creator,
           rieo.title,
           rieo.authors_str,
           rieo.year,
           NULL AS issuer,
           NULL AS year_to,
           NULL AS source,
           NULL AS editorship_role,
           rieo.event_type,
           rieo.place,
           rieo.description
    FROM research_item ri
             JOIN research_item_event_organization rieo on ri.id = rieo.research_item