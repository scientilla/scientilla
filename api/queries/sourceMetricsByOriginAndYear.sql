SELECT
  sm.year,
  sm.name,
  count(*)
FROM sourcemetric sm
GROUP BY sm.name, sm.year
ORDER BY sm.year DESC