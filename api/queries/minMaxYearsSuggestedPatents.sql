SELECT
    ris.research_entity as research_entity,
    rit.type as item_type,
    'prosecutions' as item_key,
    CAST(MIN(p.filing_year) AS text) AS min,
    CAST(MAX(p.filing_year) AS text) AS max
FROM "research_item_suggestion" ris
    JOIN patent p ON p.id = ris.research_item
    JOIN research_item_type rit ON p.type = rit.id
WHERE p.translation = false AND p.priority = false AND ris.research_entity = $1
GROUP BY research_entity, item_type, item_key

UNION ALL

SELECT
    ris.research_entity as research_entity,
    rit.type as item_type,
    'priorities' as item_key,
    CAST(MIN(p.filing_year) AS text) AS min,
    CAST(MAX(p.filing_year) AS text) AS max
FROM "research_item_suggestion" ris
    JOIN patent p ON p.id = ris.research_item
    JOIN research_item_type rit ON p.type = rit.id
WHERE p.translation = false AND p.priority = TRUE AND ris.research_entity = $1
GROUP BY research_entity, item_type, item_key

UNION ALL

SELECT
    ris.research_entity as research_entity,
    rit.type as item_type,
    'all' as item_key,
    CAST(MIN(p.filing_year) AS text) AS min,
    CAST(MAX(p.filing_year) AS text) AS max
FROM "research_item_suggestion" ris
    JOIN patent p ON p.id = ris.research_item
    JOIN research_item_type rit ON p.type = rit.id
WHERE p.translation = false AND ris.research_entity = $1
GROUP BY research_entity, item_type, item_key

UNION ALL

SELECT
    research_entity,
    item_type,
    item_key,
    MIN(subquery.min) AS min,
    MAX(subquery.max) AS max
FROM (
    SELECT
        ris.research_entity as research_entity,
        rit.type as item_type,
        'all_translations' as item_key,
        CAST(LEAST(p.filing_year, p.issue_year) AS text) AS min,
        CAST(GREATEST(p.filing_year, p.issue_year) AS text) AS max
    FROM "research_item_suggestion" ris
        JOIN patent p ON p.id = ris.research_item
        JOIN research_item_type rit ON p.type = rit.id
    WHERE ris.research_entity = $1
) subquery
GROUP BY research_entity, item_type, item_key;
