CREATE OR REPLACE VIEW user_data AS
SELECT
  red.id as id,
  red.profile,
  red.imported_data,
  u.id as "user",
  re.id as "research_entity"
FROM research_entity_data red
  JOIN research_entity re on red.research_entity = re.id
  JOIN "user" u on re.id = u.research_entity