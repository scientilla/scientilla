--citation count the document had in that year
DROP MATERIALIZED VIEW document_incremental_citation;
CREATE MATERIALIZED VIEW document_incremental_citation AS
SELECT dc2.document, year_range AS year, sum(dc2.value) AS value
FROM document_citation dc2
         JOIN generate_series(
        (SELECT min(year) FROM document_citation dc),
        date_part('year', now())::int)
    AS year_range ON dc2.year <= year_range
GROUP BY dc2.document, year_range;
