CREATE OR REPLACE VIEW project_competitive AS
SELECT *
FROM project
WHERE key = 'project_competitive'
  AND kind = 'v';