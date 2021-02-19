CREATE OR REPLACE VIEW patent_family_verify AS
SELECT distinct p.family_id as patent_family,
                re.id    as research_entity
FROM verify v
         JOIN research_entity re on v.research_entity = re.id
         JOIN patent p on v.research_item = p.id;