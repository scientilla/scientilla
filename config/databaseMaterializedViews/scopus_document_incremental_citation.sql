--citation count the document had in that year
DROP MATERIALIZED VIEW document_incremental_citation;
CREATE MATERIALIZED VIEW document_incremental_citation AS
SELECT dc.scopus_id, year_range AS year, sum(dc.value) AS value
FROM document_citation dc
         JOIN generate_series(
        (SELECT min(year) FROM document_citation),
        date_part('year', now())::int)
    AS year_range ON dc.year <= year_range
GROUP BY dc.scopus_id, year_range;
