create or replace view active_membership as
  select * from membership
  where active = true;