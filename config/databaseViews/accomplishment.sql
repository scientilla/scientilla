CREATE OR REPLACE VIEW accomplishment AS
  SELECT ri.id,
         ri.kind,
         ri.type,
         ri.draft_creator,
         ia.title,
         ia.authors_str,
         ia.year,
         ia.issuer,
         NULL AS year_to,
         NULL AS medium,
         NULL AS editor_in_chief,
         NULL AS event_type,
         NULL AS place,
         NULL AS description
  FROM research_item ri
         JOIN item_award ia on ri.id = ia.research_item
  UNION
  SELECT ri.id,
         ri.kind,
         ri.type,
         ri.draft_creator,
         ie.title,
         ie.authors_str,
         ie.year_from AS year,
         NULL         AS issuer,
         ie.year_to,
         ie.medium,
         ie.editor_in_chief,
         NULL         AS event_type,
         NULL         AS place,
         NULL         AS description
  FROM research_item ri
         JOIN item_editor ie on ri.id = ie.research_item
  UNION
  SELECT ri.id,
         ri.kind,
         ri.type,
         ri.draft_creator,
         ieo.title,
         ieo.authors_str,
         ieo.year,
         NULL     AS issuer,
         NULL     AS year_to,
         NULL     AS medium,
         NULL     AS editor_in_chief,
         ieo.event_type,
         ieo.place,
         ieo.description
  FROM research_item ri
         JOIN item_event_organization ieo on ri.id = ieo.research_item