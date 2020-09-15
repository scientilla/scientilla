CREATE OR REPLACE VIEW patent_family AS
SELECT p.family_docket         as docket,
       json_agg(p) as patents
FROM patent p
GROUP BY p.family_docket;