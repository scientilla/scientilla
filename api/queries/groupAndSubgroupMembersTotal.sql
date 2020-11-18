SELECT count(*) AS count
FROM all_membership_group m
    WHERE m.active = TRUE AND m.group = $1;