DROP MATERIALIZED VIEW document_citation;
CREATE MATERIALIZED VIEW document_citation AS
SELECT sdm.document,
       (cit ->> 'year')::integer as year,
       (cit ->> 'value')::integer as value
FROM scopusdocumentmetadata sdm
         left join lateral jsonb_array_elements(sdm.data -> 'citations') cit on true
WHERE value IS NOT NULL