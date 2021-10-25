SELECT (contributions ->> 'year') :: text as year,
    SUM((contributions ->> 'contribution') :: NUMERIC) as contribution
FROM "research_item_project_industrial" ripi
    JOIN verify v ON ripi.research_item = v.research_item
    JOIN "group" g ON v.research_entity = g.research_entity,
    jsonb_array_elements(ripi.project_data -> 'researchLines') as research_lines,
    jsonb_array_elements(research_lines -> 'annualContribution') as contributions
WHERE v.research_entity = $1 AND research_lines @> json_object(ARRAY['code', g.code])::jsonb
GROUP BY year
ORDER BY year
