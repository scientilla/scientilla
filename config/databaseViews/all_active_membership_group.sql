create or replace view all_active_membership_group as
  select "user", "group" from all_membership_group
  where active = true
  group by "user", "group";
