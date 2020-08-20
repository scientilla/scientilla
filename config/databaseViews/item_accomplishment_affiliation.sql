CREATE OR REPLACE VIEW item_autor_affiliation AS
SELECT aa.id,
       aa.author,
       aa.institute,
       a.research_item
FROM author_affiliation aa
         JOIN author a on aa.author = a.id;