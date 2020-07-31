CREATE OR REPLACE VIEW project_status AS
SELECT id, status
FROM project
WHERE status IS NOT NULL
GROUP BY status;