CREATE OR REPLACE VIEW all_membership_group AS
  SELECT DISTINCT ON (id, "user", "group", "child_group")
  	row_number() OVER ()::int AS id,
	amgwi."user" as "user",
    amgwi."group" as "group",
    amgwi.synchronized as synchronized,
    amgwi.active as active,
    amgwi.child_group as child_group,
    amgwi.level as level
  FROM all_membership_group_without_id amgwi;