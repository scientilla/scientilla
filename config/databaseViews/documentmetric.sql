CREATE OR REPLACE VIEW documentmetric AS
  SELECT DISTINCT
    d.id  AS document,
    sm.id AS metric
  FROM document d
    JOIN sourcemetricsource sms
      ON sms.source = d.source
    JOIN sourcemetric sm
      ON sms."sourceMetric" = sm.id;