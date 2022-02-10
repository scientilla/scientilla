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
), unique_years AS (
    SELECT DISTINCT years.year
    FROM (
        SELECT
            substring(research_lines ->> 'startDate' from 1 for 4) :: NUMERIC as YEAR
        FROM "research_item_project_industrial" ripi
            JOIN verify v ON ripi.research_item = v.research_item
            JOIN "group" g ON v.research_entity = g.research_entity
            JOIN (
                select
                    ripi.id as project_id,
                    jsonb_array_elements(ripi.project_data -> 'researchLines') as research_lines
                FROM "research_item_project_industrial" ripi
                GROUP BY ripi.id
            ) sub on project_id = ripi.id
        WHERE (
            g.id = $1 OR
            g.research_entity = ANY(
                SELECT tmp_g.research_entity as research_entity
                FROM subg sg
                JOIN "group" tmp_g on tmp_g.id = sg.child_group
                WHERE sg.parent_group = g.id
            )
        ) AND (
            research_lines @> (
                select json_agg(codes) as codes
                from (
                    SELECT tmp_g.code as code
                    FROM subg sg
                    JOIN "group" tmp_g on tmp_g.id = sg.child_group
                    WHERE sg.parent_group = g.id
                ) codes
            )::jsonb OR
            research_lines @> json_build_object('code', g.code)::jsonb
        )

        UNION

        SELECT
            substring(research_lines ->> 'startDate' from 1 for 4) :: NUMERIC as YEAR
        FROM "research_item_project_industrial" ripi
            JOIN verify v ON ripi.research_item = v.research_item
            JOIN "group" g ON v.research_entity = g.research_entity
            JOIN (
                select
                    ripi.id as project_id,
                    jsonb_array_elements(ripi.project_data -> 'researchLines') as research_lines
                FROM "research_item_project_industrial" ripi
                GROUP BY ripi.id
            ) sub on project_id = ripi.id
        WHERE (
            g.id = $1 OR
            g.research_entity = ANY(
                SELECT tmp_g.research_entity as research_entity
                FROM subg sg
                JOIN "group" tmp_g on tmp_g.id = sg.child_group
                WHERE sg.parent_group = g.id
            )
        ) AND (
            research_lines @> ANY(
                ARRAY(
                    SELECT json_build_object('code', tmp_g.code)::jsonb as code
                    FROM subg sg
                    JOIN "group" tmp_g on tmp_g.id = sg.child_group
                    WHERE sg.parent_group = g.id
                )::jsonb[]
            ) OR
            research_lines @> json_build_object('code', g.code)::jsonb
        )
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
            substring(research_lines ->> 'startDate' from 1 for 4) :: NUMERIC as YEAR,
            (research_lines ->> 'inCashContribution') :: NUMERIC as in_cash_contribution
        FROM "research_item_project_industrial" ripi
            JOIN verify v ON ripi.research_item = v.research_item
            JOIN "group" g ON v.research_entity = g.research_entity
            JOIN (
                select
                    ripi.id as project_id,
                    jsonb_array_elements(ripi.project_data -> 'researchLines') as research_lines
                FROM "research_item_project_industrial" ripi
                GROUP BY ripi.id
            ) sub on project_id = ripi.id
        WHERE (
            g.id = $1 OR
            g.research_entity = ANY(
                SELECT tmp_g.research_entity as research_entity
                FROM subg sg
                JOIN "group" tmp_g on tmp_g.id = sg.child_group
                WHERE sg.parent_group = g.id
            )
        ) AND (
            research_lines @> ANY(
                ARRAY(
                    SELECT json_build_object('code', tmp_g.code)::jsonb as code
                    FROM subg sg
                    JOIN "group" tmp_g on tmp_g.id = sg.child_group
                    WHERE sg.parent_group = g.id
                )::jsonb[]
            ) OR
            research_lines @> json_build_object('code', g.code)::jsonb
        )
        GROUP BY YEAR, research_lines
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
            substring(research_lines ->> 'startDate' from 1 for 4) :: NUMERIC as YEAR,
            (research_lines ->> 'inKindContribution') :: NUMERIC as in_kind_contribution
        FROM "research_item_project_industrial" ripi
            JOIN verify v ON ripi.research_item = v.research_item
            JOIN "group" g ON v.research_entity = g.research_entity
            JOIN (
                select
                    ripi.id as project_id,
                    jsonb_array_elements(ripi.project_data -> 'researchLines') as research_lines
                FROM "research_item_project_industrial" ripi
                GROUP BY ripi.id
            ) sub on project_id = ripi.id
        WHERE (
            g.id = $1 OR
            g.research_entity = ANY(
                SELECT tmp_g.research_entity as research_entity
                FROM subg sg
                JOIN "group" tmp_g on tmp_g.id = sg.child_group
                WHERE sg.parent_group = g.id
            )
        ) AND (
            research_lines @> ANY(
                ARRAY(
                    SELECT json_build_object('code', tmp_g.code)::jsonb as code
                    FROM subg sg
                    JOIN "group" tmp_g on tmp_g.id = sg.child_group
                    WHERE sg.parent_group = g.id
                )::jsonb[]
            ) OR
            research_lines @> json_build_object('code', g.code)::jsonb
        )
        GROUP BY YEAR, research_lines
        ORDER BY YEAR
    ) ikc ON ikc.year = unique_years.year
    GROUP BY unique_years.year
    ORDER BY unique_years.year
) ikc ON ikc.year = unique_years.year
WHERE
    unique_years.year IS NOT NULL
GROUP BY unique_years.year
ORDER BY unique_years.year
