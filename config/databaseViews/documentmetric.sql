CREATE OR REPLACE VIEW documentmetric AS
  SELECT DISTINCT
    d.id  AS document,
    sm.id AS metric
  FROM document d
    JOIN sourcemetricsource sms
      ON sms.source = d.source
    JOIN sourcemetric sm
      ON sms."sourceMetric" = sm.id
  WHERE sm.year = (SELECT max(year)
                   FROM sourcemetric sm2
                   WHERE sm.origin IS NOT DISTINCT FROM sm2.origin
                         AND sm."sourceOriginId" IS NOT DISTINCT FROM sm2."sourceOriginId"
                         AND sm.issn IS NOT DISTINCT FROM sm2.issn
                         AND sm.eissn IS NOT DISTINCT FROM sm2.eissn
                         AND sm."sourceTitle" IS NOT DISTINCT FROM sm2."sourceTitle"
                         AND sm.name IS NOT DISTINCT FROM sm2.name)