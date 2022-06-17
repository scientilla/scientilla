CREATE OR REPLACE VIEW person AS
SELECT u.id                                                                      AS id,
       u.username                                                                AS username,
       u.name                                                                    AS name,
       u.surname                                                                 AS surname,
       u.slug                                                                    AS slug,
       u."alreadyAccess"                                                         AS already_access,
       u."alreadyOpenedSuggested"                                                AS already_opened_suggested,
       u.already_changed_profile                                                 AS already_changed_profile,
       u.role                                                                    AS role,
       u."orcidId"                                                               AS orcid_id,
       u."scopusId"                                                              AS scopus_id,
       u."jobTitle"                                                              AS job_title,
       u.display_name                                                            AS display_name,
       u.display_surname                                                         AS display_surname,
       u.research_entity                                                         AS research_entity,
       u.active                                                                  AS active,
       ra.role_category                                                          AS role_category,
       (red.profile -> 'phone' ->> 'value') :: text                              AS phone,
       (red.profile -> 'gender' ->> 'value') :: text                             AS gender,
       (red.profile -> 'nationality' ->> 'value') :: text                        AS nationality,
       (
           SELECT ranges.label
           from (SELECT (red.profile -> 'dateOfBirth' ->> 'value') :: date as date) as birth_date
                    cross join (values ('<25', 25),
                                       ('25-29', 30),
                                       ('30-34', 35),
                                       ('35-44', 45),
                                       ('45-54', 55),
                                       ('>=55', 200)) AS ranges(label, max)
           WHERE birth_date.date > CURRENT_DATE - INTERVAL '1 year' * ranges.max
           ORDER BY ranges.max
           LIMIT 1
       )                                                                         AS age_range,
       (red.profile ->> 'groups') :: text                                        AS groups,
       (
           SELECT jsonb_object_agg(social.key, social.value ->> 'value')
           FROM jsonb_each(red.profile -> 'socials') as social
           WHERE social.value ->> 'value' <> ''
             AND social.value ->> 'privacy' in ('public', 'hidden')
       )                                                                         AS socials,
       CASE
           WHEN (red.profile -> 'image' ->> 'privacy') :: text in ('public', 'hidden')
               THEN NULLIF((red.profile -> 'image' ->> 'value') :: text, '') END AS image,
       (
           SELECT array_to_json(array_agg(titles ->> 'value'))
           FROM jsonb_array_elements(red.profile -> 'titles') titles
           WHERE titles ->> 'privacy' in ('public', 'hidden')
       )                                                                         AS titles,
       (
           SELECT (red.profile -> 'description' ->> 'value') :: text
           WHERE (red.profile -> 'description' ->> 'value') :: text IS NOT NULL
             AND (red.profile -> 'description' ->> 'value') :: text != ''
             AND (
                       (red.profile -> 'description' ->> 'privacy') :: text = 'public'
                   OR (red.profile -> 'description' ->> 'privacy') :: text = 'hidden'
               )
       )                                                                         AS description,
       (
           SELECT (red.profile -> 'role' ->> 'value') :: text
           WHERE (red.profile -> 'role' ->> 'value') :: text IS NOT NULL
             AND (red.profile -> 'role' ->> 'value') :: text != ''
             AND (
                       (red.profile -> 'role' ->> 'privacy') :: text = 'public'
                   OR (red.profile -> 'role' ->> 'privacy') :: text = 'hidden'
               )
       )                                                                         AS custom_role,
       (
           SELECT (red.profile -> 'website' ->> 'value') :: text
           WHERE (red.profile -> 'website' ->> 'value') :: text IS NOT NULL
             AND (red.profile -> 'website' ->> 'value') :: text != ''
             AND (
                       (red.profile -> 'website' ->> 'privacy') :: text = 'public'
                   OR (red.profile -> 'website' ->> 'privacy') :: text = 'hidden'
               )
       )                                                                         AS website,
       (
           SELECT (red.profile -> 'address' ->> 'value') :: text
           WHERE (red.profile -> 'address' ->> 'value') :: text IS NOT NULL
             AND (red.profile -> 'address' ->> 'value') :: text != ''
             AND (
                       (red.profile -> 'address' ->> 'privacy') :: text = 'public'
                   OR (red.profile -> 'address' ->> 'privacy') :: text = 'hidden'
               )
       )                                                                         AS address,
       (
           SELECT array_to_json(array_agg(interests ->> 'value'))
           FROM jsonb_array_elements(red.profile -> 'interests') interests
           WHERE interests ->> 'privacy' = 'public'
              OR interests ->> 'privacy' = 'hidden'
       )                                                                         AS interests,
       (
           SELECT array_to_json(
                          array_agg(
                                  json_strip_nulls(
                                          json_build_object(
                                                  'jobTitle',
                                                  experiences_external ->> 'jobTitle',
                                                  'from',
                                                  experiences_external ->> 'from',
                                                  'to',
                                                  experiences_external ->> 'to',
                                                  'company',
                                                  experiences_external ->> 'company',
                                                  'location',
                                                  experiences_external ->> 'location',
                                                  'country',
                                                  experiences_external ->> 'country'
                                              )
                                      )
                              )
                      )
           FROM jsonb_array_elements(red.profile -> 'experiencesExternal') experiences_external
           WHERE experiences_external ->> 'privacy' = 'public'
              OR experiences_external ->> 'privacy' = 'hidden'
       )                                                                         AS experiences_external,
       (
           SELECT array_to_json(
                          array_agg(
                                  json_strip_nulls(
                                          json_build_object(
                                                  'title', education ->> 'title',
                                                  'from', education ->> 'from',
                                                  'to', education ->> 'to',
                                                  'institute', education ->> 'institute',
                                                  'location', education ->> 'location',
                                                  'country', education ->> 'country'
                                              )
                                      )
                              )
                      )
           FROM jsonb_array_elements(red.profile -> 'education') education
           WHERE education ->> 'privacy' = 'public'
              OR education ->> 'privacy' = 'hidden'
       )                                                                         AS education,
       (
           SELECT array_to_json(
                          array_agg(
                                  json_strip_nulls(
                                          json_build_object(
                                                  'title',
                                                  certificates ->> 'title',
                                                  'description',
                                                  certificates ->> 'description',
                                                  'date',
                                                  certificates ->> 'date',
                                                  'favorite',
                                                  certificates ->> 'favorite'
                                              )
                                      )
                              )
                      )
           FROM jsonb_array_elements(red.profile -> 'certificates') certificates
           WHERE certificates ->> 'privacy' = 'public'
              OR certificates ->> 'privacy' = 'hidden'
       )                                                                         AS certificates,
       (
           SELECT array_to_json(
                          array_agg(
                                  json_strip_nulls(
                                          json_build_object(
                                                  'skills',
                                                  (
                                                      SELECT array_to_json(
                                                                     array_agg(
                                                                             json_strip_nulls(
                                                                                     json_build_object(
                                                                                             'value',
                                                                                             skills ->> 'value',
                                                                                             'favorite',
                                                                                             skills ->> 'favorite'
                                                                                         )
                                                                                 )
                                                                         )
                                                                 )
                                                      FROM jsonb_array_elements(categories -> 'skills') skills
                                                      WHERE skills ->> 'privacy' = 'public'
                                                         OR skills ->> 'privacy' = 'hidden'
                                                  ),
                                                  'categoryName',
                                                  categories ->> 'categoryName'
                                              )
                                      )
                              )
                      )
           FROM jsonb_array_elements(red.profile -> 'skillCategories') categories
           WHERE categories ->> 'privacy' = 'public'
              OR categories ->> 'privacy' = 'hidden'
       )                                                                         AS skill_categories,
       (red.profile ->> 'hidden') :: text                                        AS hidden,
       (
           SELECT array_to_json(
                          array_agg(
                                  json_strip_nulls(
                                          json_build_object(
                                                  'jobTitle',
                                                  experiences_internal ->> 'jobTitle',
                                                  'from',
                                                  experiences_internal ->> 'from',
                                                  'to',
                                                  experiences_internal ->> 'to',
                                                  'company',
                                                  experiences_internal ->> 'company',
                                                  'lines',
                                                  (
                                                      SELECT array_to_json(
                                                                     array_agg(
                                                                             json_strip_nulls(
                                                                                     json_build_object(
                                                                                             'code',
                                                                                             lines ->> 'code',
                                                                                             'name',
                                                                                             lines ->> 'name',
                                                                                             'office',
                                                                                             lines ->> 'office'
                                                                                         )
                                                                                 )
                                                                         )
                                                                 )
                                                      FROM jsonb_array_elements(experiences_internal -> 'lines') lines
                                                  )
                                              )
                                      )
                              )
                      )
           FROM jsonb_array_elements(red.profile -> 'experiencesInternal') experiences_internal
           WHERE experiences_internal ->> 'privacy' = 'public'
              OR experiences_internal ->> 'privacy' = 'hidden'
       )                                                                         AS experiences_internal,
       u."updatedAt"                                                             AS updated_at,
       concat(
               '-',
               array_to_string(
                       array(
                               SELECT DISTINCT m.group
                               FROM membership m
                               WHERE m.user = u.id
                                 AND active = true
                           ),
                       '-'
                   ),
               '-'
           )                                                                     AS active_memberships,
       concat(
               '-',
               array_to_string(
                       array(
                               SELECT DISTINCT m.group
                               FROM membership m
                               WHERE m.user = u.id
                           ),
                       '-'
                   ),
               '-'
           )                                                                     AS active_and_former_memberships,
       concat(
               '-',
               array_to_string(
                       array(
                               SELECT DISTINCT amg.group
                               FROM all_membership_group_without_id amg
                               WHERE amg.user = u.id
                                 AND active = true
                           ),
                       '-'
                   ),
               '-'
           )                                                                     AS active_memberships_including_subgroups,
       concat(
               '-',
               array_to_string(
                       array(
                               SELECT DISTINCT amg.group
                               FROM all_membership_group_without_id amg
                               WHERE amg.user = u.id
                           ),
                       '-'
                   ),
               '-'
           )                                                                     AS active_and_former_memberships_including_subgroups
FROM "user" u
         LEFT JOIN research_entity_data red ON red.research_entity = u.research_entity
         LEFT JOIN role_association ra ON LOWER(ra.original_role) = LOWER(
        (red.profile -> 'roleCategory' ->> 'value') :: text
    );