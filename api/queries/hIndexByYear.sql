SELECT research_entity,
       year,
       max(h) as h
FROM (
         SELECT "researchEntity"                                                  AS research_entity,
                dic.value                                                         AS value,
                dic.year                                                          AS year,
                row_number() OVER
                    (PARTITION BY "researchEntity", dic.year ORDER BY value DESC) AS h
         FROM authorship a
                  JOIN document d ON a.document = d.id
                  JOIN document_incremental_citation dic
                       ON a.document = dic.document AND NULLIF(d.year, '')::int <= dic.year
                  JOIN generate_series(1900,
                                       date_part('year', now())::int) AS year_range
                       ON dic.year = year_range
         WHERE a."researchEntity" IS NOT NULL
     ) AS index
WHERE h <= value
  AND research_entity = $1
group by research_entity, year;