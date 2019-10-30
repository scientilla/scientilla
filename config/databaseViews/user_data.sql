CREATE OR REPLACE VIEW user_data AS
SELECT red id,
       red.profile,
       red.imported_data,
       red.research_entity AS research_entity
FROM research_entity_data red
  JOIN research_entity re on red.research_entity = re.id