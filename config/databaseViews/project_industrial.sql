CREATE OR REPLACE VIEW project_industrial AS
SELECT *
FROM project
WHERE key = 'project_industrial'
  AND kind = 'v';