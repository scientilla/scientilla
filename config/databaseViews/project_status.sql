CREATE OR REPLACE VIEW project_status AS
  SELECT row_number() OVER () AS id, status
  FROM project
  WHERE status IS NOT NULL
  GROUP BY status;