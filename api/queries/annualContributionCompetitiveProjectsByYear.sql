SELECT
    year,
    in_cash_contribution,
    in_kind_contribution,
    annual_contribution
FROM (
    SELECT
        1 as research_entity,
        icc.year as year,
        COALESCE(icc.in_cash_contribution, 0) as in_cash_contribution,
        COALESCE(ikc.in_kind_contribution, 0) AS in_kind_contribution,
        COALESCE(icc.in_cash_contribution, 0) + COALESCE(ikc.in_kind_contribution, 0) as annual_contribution
    FROM (
        SELECT
            year,
            SUM(in_cash_contribution) as in_cash_contribution
        FROM "research_item_project_competitive" ripc
            JOIN research_item ri ON ripc.research_item = ri.id
            JOIN (
                select
                    ripc.id as project_id,
                    ((jsonb_array_elements(jsonb_array_elements(ripc.project_data -> 'researchLines') -> 'annualContribution') ->> 'year') :: NUMERIC) as year,
                    ((jsonb_array_elements(jsonb_array_elements(ripc.project_data -> 'researchLines') -> 'annualContribution') ->> 'contribution') :: NUMERIC) as in_cash_contribution
                FROM "research_item_project_competitive" ripc
                ORDER BY year
            ) sub on project_id = ripc.id
        WHERE ri.kind = 'v' AND ripc.project_data ->> 'type' != 'In Kind'
        GROUP BY year
    ) icc
    LEFT JOIN (
        SELECT
            year,
            SUM(in_kind_contribution) as in_kind_contribution
        FROM "research_item_project_competitive" ripc
            JOIN research_item ri ON ripc.research_item = ri.id
            JOIN (
                select
                    ripc.id as project_id,
                    ((jsonb_array_elements(jsonb_array_elements(ripc.project_data -> 'researchLines') -> 'annualContribution') ->> 'year') :: NUMERIC) as year,
                    ((jsonb_array_elements(jsonb_array_elements(ripc.project_data -> 'researchLines') -> 'annualContribution') ->> 'contribution') :: NUMERIC) as in_kind_contribution
                FROM "research_item_project_competitive" ripc
                ORDER BY year
            ) sub on project_id = ripc.id
        WHERE ri.kind = 'v' AND ripc.project_data ->> 'type' = 'In Kind'
        GROUP BY year
    ) ikc ON icc.year = ikc.year

    UNION

    SELECT
        icc.research_entity as research_entity,
        icc.year,
        COALESCE(icc.in_cash_contribution, 0) as in_cash_contribution,
        COALESCE(ikc.in_kind_contribution, 0) AS in_kind_contribution,
        COALESCE(icc.in_cash_contribution, 0) + COALESCE(ikc.in_kind_contribution, 0) as annual_contribution
    FROM (
        SELECT
            v.research_entity as research_entity,
            (jsonb_array_elements(research_lines -> 'annualContribution') ->> 'year') :: NUMERIC as year,
            SUM((in_cash_contribution ->> 'contribution') :: NUMERIC) as in_cash_contribution
        FROM "research_item_project_competitive" ripc
            JOIN verify v ON ripc.research_item = v.research_item
            JOIN "group" g ON v.research_entity = g.research_entity
            JOIN (
                select
                    ripc.id as research_line_project,
                    jsonb_array_elements(ripc.project_data -> 'researchLines') as research_lines
                FROM "research_item_project_competitive" ripc
            ) sub on research_line_project = ripc.id
            CROSS JOIN jsonb_array_elements(research_lines -> 'annualContribution') as in_cash_contribution
        WHERE v.research_entity = $1 AND research_lines @> json_object(ARRAY['code', g.code])::jsonb AND ripc.project_data ->> 'type' != 'In Kind'
        GROUP BY year, v.research_entity
    ) icc
    LEFT JOIN (
        SELECT
            v.research_entity as research_entity,
            (jsonb_array_elements(research_lines -> 'annualContribution') ->> 'year') :: NUMERIC as year,
            SUM((in_kind_contribution ->> 'contribution') :: NUMERIC) as in_kind_contribution
        FROM "research_item_project_competitive" ripc
            JOIN verify v ON ripc.research_item = v.research_item
            JOIN "group" g ON v.research_entity = g.research_entity
            JOIN (
                select
                    ripc.id as research_line_project,
                    jsonb_array_elements(ripc.project_data -> 'researchLines') as research_lines
                FROM "research_item_project_competitive" ripc
            ) sub on research_line_project = ripc.id
            CROSS JOIN jsonb_array_elements(research_lines -> 'annualContribution') as in_kind_contribution
        WHERE v.research_entity = $1 AND research_lines @> json_object(ARRAY['code', g.code])::jsonb AND ripc.project_data ->> 'type' = 'In Kind'
        GROUP BY year, v.research_entity
    ) ikc ON icc.year = ikc.year
) all_contributions
WHERE research_entity = $1
ORDER BY year
