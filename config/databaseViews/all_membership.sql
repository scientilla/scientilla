CREATE OR REPLACE VIEW all_membership AS
    SELECT DISTINCT ON ("user", "group") * FROM all_membership_group;