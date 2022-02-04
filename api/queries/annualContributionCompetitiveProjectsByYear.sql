WITH RECURSIVE subg(parent_group, child_group, level) AS (
  SELECT
    mg.parent_group,
    mg.child_group,
    1 AS level
  FROM membershipgroup mg
  UNION
  SELECT
    mg.parent_group,
    sg.child_group,
    level + 1 AS level
  FROM membershipgroup mg
    JOIN subg sg ON mg.child_group = sg.parent_group
)
SELECT
    unique_years.year as year,
    COALESCE(SUM(icc.in_cash_contribution), 0) as in_cash_contribution,
    COALESCE(SUM(ikc.in_kind_contribution), 0) AS in_kind_contribution,
    COALESCE(SUM(icc.in_cash_contribution), 0) + COALESCE(SUM(ikc.in_kind_contribution), 0) as annual_contribution
FROM (
    SELECT DISTINCT years.year
    FROM (
        SELECT (in_cash_contribution ->> 'year') :: NUMERIC as year
        FROM "research_item_project_competitive" ripc
            JOIN verify v ON ripc.research_item = v.research_item
            JOIN "group" g ON v.research_entity = g.research_entity
            JOIN (
                select
                    ripc.id as project_id,
                    jsonb_array_elements(ripc.project_data -> 'researchLines') as research_lines
                FROM "research_item_project_competitive" ripc
            ) sub on project_id = ripc.id
            CROSS JOIN jsonb_array_elements(research_lines -> 'annualContribution') as in_cash_contribution
        WHERE (
            v.research_entity = $1 OR
            v.research_entity = ANY(
                SELECT g.research_entity as research_entity
                FROM subg sg
                JOIN "group" g on g.id = sg.child_group
                WHERE sg.parent_group = $1
            )
        ) AND (
            research_lines @> (
                select json_agg(codes) as codes
                from (
                    SELECT g.code as code
                    FROM subg sg
                    JOIN "group" g on g.id = sg.child_group
                    WHERE sg.parent_group = $1
                ) codes
            )::jsonb OR
            research_lines @> json_build_object('code', g.code)::jsonb
        ) AND ripc.project_data ->> 'type' != 'In Kind'

        UNION

        SELECT (in_kind_contribution ->> 'year') :: NUMERIC as year
        FROM "research_item_project_competitive" ripc
            JOIN verify v ON ripc.research_item = v.research_item
            JOIN "group" g ON v.research_entity = g.research_entity
            JOIN (
                select
                    ripc.id as project_id,
                    jsonb_array_elements(ripc.project_data -> 'researchLines') as research_lines
                FROM "research_item_project_competitive" ripc
            ) sub on project_id = ripc.id
            CROSS JOIN jsonb_array_elements(research_lines -> 'annualContribution') as in_kind_contribution
        WHERE (
            v.research_entity = $1 OR
            v.research_entity = ANY(
                SELECT g.research_entity as research_entity
                FROM subg sg
                JOIN "group" g on g.id = sg.child_group
                WHERE sg.parent_group = $1
            )
        ) AND (
            research_lines @> (
                select json_agg(codes) as codes
                from (
                    SELECT g.code as code
                    FROM subg sg
                    JOIN "group" g on g.id = sg.child_group
                    WHERE sg.parent_group = $1
                ) codes
            )::jsonb OR
            research_lines @> json_build_object('code', g.code)::jsonb
        ) AND ripc.project_data ->> 'type' = 'In Kind'
    ) years
) unique_years
FULL JOIN (
    SELECT
        (in_cash_contribution ->> 'year') :: NUMERIC as year,
        SUM((in_cash_contribution ->> 'contribution') :: NUMERIC) as in_cash_contribution
    FROM "research_item_project_competitive" ripc
        JOIN verify v ON ripc.research_item = v.research_item
        JOIN "group" g ON v.research_entity = g.research_entity
        JOIN (
            select
                ripc.id as project_id,
                jsonb_array_elements(ripc.project_data -> 'researchLines') as research_lines
            FROM "research_item_project_competitive" ripc
        ) sub on project_id = ripc.id
        CROSS JOIN jsonb_array_elements(research_lines -> 'annualContribution') as in_cash_contribution
    WHERE (
        v.research_entity = $1 OR
        v.research_entity = ANY(
            SELECT g.research_entity as research_entity
            FROM subg sg
            JOIN "group" g on g.id = sg.child_group
            WHERE sg.parent_group = $1
        )
    ) AND (
        research_lines @> (
            select json_agg(codes) as codes
            from (
                SELECT g.code as code
                FROM subg sg
                JOIN "group" g on g.id = sg.child_group
                WHERE sg.parent_group = $1
            ) codes
        )::jsonb OR
        research_lines @> json_build_object('code', g.code)::jsonb
    ) AND ripc.project_data ->> 'type' != 'In Kind'
    GROUP BY year
    ORDER BY YEAR
) icc ON icc.year = unique_years.year
FULL JOIN (
    SELECT
        (in_kind_contribution ->> 'year') :: NUMERIC as year,
        SUM((in_kind_contribution ->> 'contribution') :: NUMERIC) as in_kind_contribution
    FROM "research_item_project_competitive" ripc
        JOIN verify v ON ripc.research_item = v.research_item
        JOIN "group" g ON v.research_entity = g.research_entity
        JOIN (
            select
                ripc.id as project_id,
                jsonb_array_elements(ripc.project_data -> 'researchLines') as research_lines
            FROM "research_item_project_competitive" ripc
        ) sub on project_id = ripc.id
        CROSS JOIN jsonb_array_elements(research_lines -> 'annualContribution') as in_kind_contribution
    WHERE (
        v.research_entity = $1 OR
        v.research_entity = ANY(
            SELECT g.research_entity as research_entity
            FROM subg sg
            JOIN "group" g on g.id = sg.child_group
            WHERE sg.parent_group = $1
        )
    ) AND (
        research_lines @> (
            select json_agg(codes) as codes
            from (
                SELECT g.code as code
                FROM subg sg
                JOIN "group" g on g.id = sg.child_group
                WHERE sg.parent_group = $1
            ) codes
        )::jsonb OR
        research_lines @> json_build_object('code', g.code)::jsonb
    ) AND ripc.project_data ->> 'type' = 'In Kind'
    GROUP BY year
    ORDER BY YEAR
) ikc ON ikc.year = unique_years.year
WHERE
    unique_years.year IS NOT NULL
GROUP BY unique_years.year
ORDER BY unique_years.year
