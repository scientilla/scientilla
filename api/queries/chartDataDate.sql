SELECT max("updatedAt")
FROM chartdata
WHERE "researchEntity" = $1
      AND "researchEntityType" = $2