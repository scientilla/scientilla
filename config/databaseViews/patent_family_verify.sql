CREATE OR REPLACE VIEW patent_family_verify AS
SELECT distinct rip.code as patent_family,
                re.id    as research_entity
FROM verify v
         JOIN research_entity re on v.research_entity = re.id
         JOIN research_item_patent rip on v.research_item = rip.research_item;