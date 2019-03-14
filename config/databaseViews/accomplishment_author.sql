CREATE OR REPLACE VIEW accomplishment_author AS
SELECT id,
       "position",
       author_str,
       corresponding,
       first_coauthor,
       last_coauthor,
       oral_presentation,
       research_item AS accomplishment,
       verify
FROM author