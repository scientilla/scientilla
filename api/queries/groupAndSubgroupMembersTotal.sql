SELECT count(*) AS count
FROM (SELECT "user", "group" FROM all_membership_group m WHERE m.active = true AND m.group = $1 GROUP BY m.user, m.group) as m
 JOIN "user" u ON m.user = u.id
WHERE u.active = true;