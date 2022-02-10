WITH unique_years AS (
    SELECT DISTINCT years.year
    FROM (
        SELECT
            substring(ripi.project_data ->> 'startDate' from 1 for 4) :: NUMERIC as YEAR
        FROM "research_item_project_industrial" ripi
            JOIN verify v ON ripi.research_item = v.research_item
            JOIN "user" u ON v.research_entity = u.research_entity
            JOIN (
                select
                    ripi.id as project_id,
                    jsonb_array_elements(ripi.project_data -> 'members') as members
                FROM "research_item_project_industrial" ripi
                GROUP BY ripi.id
            ) sub on project_id = ripi.id
        WHERE u.id = $1 AND members @> json_build_object('email', u.username)::jsonb

        UNION

        SELECT
            substring(ripi.project_data ->> 'startDate' from 1 for 4) :: NUMERIC as YEAR
        FROM "research_item_project_industrial" ripi
            JOIN verify v ON ripi.research_item = v.research_item
            JOIN "user" u ON v.research_entity = u.research_entity
            JOIN (
                select
                    ripi.id as project_id,
                    jsonb_array_elements(ripi.project_data -> 'members') as members
                FROM "research_item_project_industrial" ripi
                GROUP BY ripi.id
            ) sub on project_id = ripi.id
        WHERE u.id = $1 AND members @> json_build_object('email', u.username)::jsonb
    ) years
)

SELECT
    unique_years.year as year,
    COALESCE(SUM(icc.in_cash_contribution), 0) as in_cash_contribution,
    COALESCE(SUM(ikc.in_kind_contribution), 0) AS in_kind_contribution,
    COALESCE(SUM(icc.in_cash_contribution), 0) + COALESCE(SUM(ikc.in_kind_contribution), 0) as contribution
FROM unique_years
FULL JOIN (
    select
        unique_years.year as year,
        COALESCE(SUM(icc.in_cash_contribution), 0) as in_cash_contribution
    from unique_years
    JOIN (
        SELECT
            substring(ripi.project_data ->> 'startDate' from 1 for 4) :: NUMERIC as YEAR,
            (members ->> 'inCashContribution') :: NUMERIC as in_cash_contribution
        FROM "research_item_project_industrial" ripi
            JOIN verify v ON ripi.research_item = v.research_item
            JOIN "user" u ON v.research_entity = u.research_entity
            JOIN (
                select
                    ripi.id as project_id,
                    jsonb_array_elements(ripi.project_data -> 'members') as members
                FROM "research_item_project_industrial" ripi
                GROUP BY ripi.id
            ) sub on project_id = ripi.id
        WHERE u.id = $1 AND members @> json_build_object('email', u.username)::jsonb
        GROUP BY YEAR, members
        ORDER BY YEAR
    ) icc ON icc.year = unique_years.year
    GROUP BY unique_years.year
) icc ON icc.year = unique_years.year
FULL JOIN (
    SELECT
        unique_years.year as year,
        COALESCE(SUM(ikc.in_kind_contribution), 0) AS in_kind_contribution
    FROM unique_years
    JOIN (
        SELECT
            substring(ripi.project_data ->> 'startDate' from 1 for 4) :: NUMERIC as YEAR,
            (members ->> 'inKindContribution') :: NUMERIC as in_kind_contribution
        FROM "research_item_project_industrial" ripi
            JOIN verify v ON ripi.research_item = v.research_item
            JOIN "user" u ON v.research_entity = u.research_entity
            JOIN (
                select
                    ripi.id as project_id,
                    jsonb_array_elements(ripi.project_data -> 'members') as members
                FROM "research_item_project_industrial" ripi
                GROUP BY ripi.id
            ) sub on project_id = ripi.id
        WHERE u.id = $1 AND members @> json_build_object('email', u.username)::jsonb
        GROUP BY YEAR, members
        ORDER BY YEAR
    ) ikc ON ikc.year = unique_years.year
    GROUP BY unique_years.year
    ORDER BY unique_years.year
) ikc ON ikc.year = unique_years.year
WHERE
    unique_years.year IS NOT NULL
GROUP BY unique_years.year
ORDER BY unique_years.year
