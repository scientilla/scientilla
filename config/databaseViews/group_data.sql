CREATE OR REPLACE VIEW group_data AS
SELECT
  red.id as id,
  red.profile,
  red.imported_data,
  g.id as "group",
  g.slug as "slug",
  g.active as "active",
  re.id as "research_entity"
FROM research_entity_data red
  JOIN research_entity re on red.research_entity = re.id
  JOIN "group" g on re.id = g.research_entity;
