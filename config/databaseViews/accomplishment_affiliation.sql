CREATE OR REPLACE VIEW accomplishment_affiliation AS
SELECT aa.id,
       aa.author,
       aa.institute,
       a.research_item AS accomplishment
FROM author_affiliation aa
         JOIN author a on aa.author = a.id