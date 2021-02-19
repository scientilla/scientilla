SELECT max("updatedAt")
FROM chartdata
WHERE key = 'totalIfPerYear'
  AND "researchEntity" = $1
  AND "researchEntityType" = $2