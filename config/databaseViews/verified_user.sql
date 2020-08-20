CREATE OR REPLACE VIEW verified_user AS
SELECT research_item as research_item,
       u.id          as "user"
FROM verify v
         JOIN research_entity re on v.research_entity = re.id
         JOIN "user" u on re.id = u.research_entity;