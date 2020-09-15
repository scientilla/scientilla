CREATE OR REPLACE VIEW verified_group AS
SELECT research_item as research_item,
       g.id          as "group"
FROM verify v
         JOIN research_entity re on v.research_entity = re.id
         JOIN "group" g on re.id = g.research_entity;