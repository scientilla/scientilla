CREATE OR REPLACE VIEW patent_family AS
SELECT p.family_id  as id,
       p.family_docket as docket,
       jsonb_agg(p) as patents
FROM patent p
GROUP BY p.family_id, p.family_docket;