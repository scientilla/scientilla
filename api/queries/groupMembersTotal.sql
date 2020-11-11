select count(*) as count
from membership m
    JOIN "group" g ON g.id = m.group
    WHERE m.active = true and g.id = $1;