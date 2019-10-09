SELECT
  sm.year,
  sm.name,
  count(*)
FROM sourcemetricsource sms
  JOIN sourcemetric sm ON sms."sourceMetric" = sm.id
GROUP BY sm.name, sm.year
ORDER BY sm.year DESC