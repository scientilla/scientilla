CREATE OR REPLACE VIEW accomplishment_verified_group AS
SELECT research_item as accomplishment,
       g.id          as "group"
FROM verify v
         JOIN research_entity re on v.research_entity = re.id
         JOIN "group" g on re.id = g.research_entity