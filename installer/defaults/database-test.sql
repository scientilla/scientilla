SELECT EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'accesslog'
) as accesslog, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'affiliation'
) as affiliation, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'alias'
) as alias, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'attempt'
) as attempt, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'auth'
) as auth, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'authorship'
) as authorship, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'authorshipgroup'
) as authorshipgroup, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'chartdata'
) as chartdata, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'discarded_document'
) as discarded_document, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'discardedgroup'
) as discardedgroup, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'document'
) as document, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'documentnotduplicate'
) as documentnotduplicate, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'documentnotduplicategroup'
) as documentnotduplicategroup, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'documenttypesourcetype'
) as documenttypesourcetype, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'externaldocument'
) as externaldocument, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'externaldocumentgroup'
) as externaldocumentgroup, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'externaldocumentmetadata'
) as externaldocumentmetadata, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'group'
) as group, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'groupadministrator'
) as groupadministrator, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'institute'
) as institute, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'jwt'
) as jwt, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'membership'
) as membership, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'membershipgroup'
) as membershipgroup, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'principalinvestigator'
) as principalinvestigator, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'resettoken'
) as resettoken, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'settings'
) as settings, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'source'
) as source, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'sourcemetric'
) as sourcemetric, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'sourcemetricsource'
) as sourcemetricsource, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'sourcetype'
) as sourcetype, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'tag'
) as tag, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'taggroup'
) as taggroup, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'taglabel'
) as taglabel, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'use'
) as use, EXISTS(
    SELECT *
    FROM information_schema.tables
    WHERE
        table_schema = 'public' AND
        table_name = 'user'
) as "user";
