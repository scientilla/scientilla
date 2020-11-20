create or replace view all_active_membership as
  select * from allmembership
  where active = true;
