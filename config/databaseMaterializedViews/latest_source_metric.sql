DROP MATERIALIZED VIEW latest_source_metric CASCADE;
CREATE MATERIALIZED VIEW latest_source_metric AS
SELECT DISTINCT ON (sms.source, sm.name) sms.source,
                                         sm.name,
                                         sm.year::int,
                                         sm.value::numeric
FROM sourcemetric sm
         JOIN sourcemetricsource sms on sm.id = sms."sourceMetric"
WHERE sm.value ~ '[+-]?([0-9]*[.])?[0-9]+'
ORDER BY sms.source, sm.name, sm.year DESC;