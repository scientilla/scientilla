CREATE OR REPLACE VIEW public_project_verify AS
SELECT v.*
FROM verify v
WHERE v.public = TRUE;