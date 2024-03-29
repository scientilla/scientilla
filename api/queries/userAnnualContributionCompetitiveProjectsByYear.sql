WITH unique_years AS (
    SELECT DISTINCT years.year
    FROM (
        SELECT (in_cash_contribution ->> 'year') :: NUMERIC as year
        FROM "research_item_project_competitive" ripc
            JOIN verify v ON ripc.research_item = v.research_item
            JOIN "user" u ON v.research_entity = u.research_entity
            JOIN (
                select
                    ripc.id as project_id,
                    jsonb_array_elements(ripc.project_data -> 'members') as members
                FROM "research_item_project_competitive" ripc
            ) sub on project_id = ripc.id
            CROSS JOIN jsonb_array_elements(members -> 'annualContribution') as in_cash_contribution
        WHERE
            u.id = $1 AND
            members @> json_build_object('email', u.username)::jsonb AND
            ripc.project_data ->> 'type' != 'In Kind'

        UNION

        SELECT (in_kind_contribution ->> 'year') :: NUMERIC as year
        FROM "research_item_project_competitive" ripc
            JOIN verify v ON ripc.research_item = v.research_item
            JOIN "user" u ON v.research_entity = u.research_entity
            JOIN (
                select
                    ripc.id as project_id,
                    jsonb_array_elements(ripc.project_data -> 'members') as members
                FROM "research_item_project_competitive" ripc
            ) sub on project_id = ripc.id
            CROSS JOIN jsonb_array_elements(members -> 'annualContribution') as in_kind_contribution
        WHERE
            u.id = $1 AND
            members @> json_build_object('email', u.username)::jsonb AND
            ripc.project_data ->> 'type' = 'In Kind'
    ) years
)

SELECT
    unique_years.year as year,
    COALESCE(SUM(icc.in_cash_contribution), 0) as in_cash_contribution,
    COALESCE(SUM(ikc.in_kind_contribution), 0) AS in_kind_contribution,
    COALESCE(SUM(icc.in_cash_contribution), 0) + COALESCE(SUM(ikc.in_kind_contribution), 0) as annual_contribution
FROM unique_years
FULL JOIN (
    SELECT
        (in_cash_contribution ->> 'year') :: NUMERIC as year,
        SUM((in_cash_contribution ->> 'contribution') :: NUMERIC) as in_cash_contribution
    FROM "research_item_project_competitive" ripc
        JOIN verify v ON ripc.research_item = v.research_item
        JOIN "user" u ON v.research_entity = u.research_entity
        JOIN (
            select
                ripc.id as project_id,
                jsonb_array_elements(ripc.project_data -> 'members') as members
            FROM "research_item_project_competitive" ripc
        ) sub on project_id = ripc.id
        CROSS JOIN jsonb_array_elements(members -> 'annualContribution') as in_cash_contribution
    WHERE
        u.id = $1 AND
        members @> json_build_object('email', u.username)::jsonb AND
        ripc.project_data ->> 'type' != 'In Kind'
    GROUP BY year
    ORDER BY YEAR
) icc ON icc.year = unique_years.year
FULL JOIN (
    SELECT
        (in_kind_contribution ->> 'year') :: NUMERIC as year,
        SUM((in_kind_contribution ->> 'contribution') :: NUMERIC) as in_kind_contribution
    FROM "research_item_project_competitive" ripc
        JOIN verify v ON ripc.research_item = v.research_item
        JOIN "user" u ON v.research_entity = u.research_entity
        JOIN (
            select
                ripc.id as project_id,
                jsonb_array_elements(ripc.project_data -> 'members') as members
            FROM "research_item_project_competitive" ripc
        ) sub on project_id = ripc.id
        CROSS JOIN jsonb_array_elements(members -> 'annualContribution') as in_kind_contribution
    WHERE
        u.id = $1 AND
        members @> json_build_object('email', u.username)::jsonb AND
        ripc.project_data ->> 'type' = 'In Kind'
    GROUP BY year
    ORDER BY YEAR
) ikc ON ikc.year = unique_years.year
WHERE
    unique_years.year IS NOT NULL
GROUP BY unique_years.year
ORDER BY unique_years.year
