DROP MATERIALIZED VIEW document_scopus_citation CASCADE;
CREATE MATERIALIZED VIEW document_scopus_citation AS
SELECT distinct sdm.scopus_id,
                (cit ->> 'year')::integer  as year,
                (cit ->> 'value')::integer as value
FROM scopus_document_metadata sdm
         LEFT JOIN LATERAL jsonb_array_elements(sdm.data -> 'citations') cit ON TRUE
WHERE value IS NOT NULL;