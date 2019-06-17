CREATE OR REPLACE VIEW accomplishment_verified_user AS
SELECT research_item as accomplishment,
       u.id          as "user"
FROM verify v
         JOIN research_entity re on v.research_entity = re.id
         JOIN "user" u on re.id = u.research_entity