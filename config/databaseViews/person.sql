DROP VIEW IF EXISTS person CASCADE
CREATE OR REPLACE VIEW person AS
SELECT u.id                                              AS id,
       u.username                                        AS username,
       u.name                                            AS name,
       u.surname                                         AS surname,
       u.slug                                            AS slug,
       u."alreadyAccess"                                 AS already_access,
       u."alreadyOpenedSuggested"                        AS already_opened_suggested,
       u.already_changed_profile                         AS already_changed_profile,
       u.role                                            AS role,
       u."orcidId"                                       AS orcid_id,
       u."scopusId"                                      AS scopus_id,
       u."jobTitle"                                      AS job_title,
       u.display_name                                    AS display_name,
       u.display_surname                                 AS display_surname,
       u.research_entity                                 AS research_entity,
       u.active                                          AS active,
       ra.role_category                                  AS role_category,
       (red.profile -> 'phone' ->> 'value')::text        AS phone,
       (red.profile -> 'gender' ->> 'value')::text       AS gender,
       (red.profile -> 'nationality' ->> 'value')::text  AS nationality,
       (
           CASE
               WHEN DATE_PART('year', (red.profile -> 'dateOfBirth' ->> 'value')::date) >=
                    (DATE_PART('year', CURRENT_DATE) - 24) THEN '<25'
               WHEN DATE_PART('year', (red.profile -> 'dateOfBirth' ->> 'value')::date) >=
                    (DATE_PART('year', CURRENT_DATE) - 29) AND
                    DATE_PART('year', (red.profile -> 'dateOfBirth' ->> 'value')::date) <=
                    (DATE_PART('year', CURRENT_DATE) - 25) THEN '25-29'
               WHEN DATE_PART('year', (red.profile -> 'dateOfBirth' ->> 'value')::date) >=
                    (DATE_PART('year', CURRENT_DATE) - 34) AND
                    DATE_PART('year', (red.profile -> 'dateOfBirth' ->> 'value')::date) <=
                    (DATE_PART('year', CURRENT_DATE) - 30) THEN '30-34'
               WHEN DATE_PART('year', (red.profile -> 'dateOfBirth' ->> 'value')::date) >=
                    (DATE_PART('year', CURRENT_DATE) - 44) AND
                    DATE_PART('year', (red.profile -> 'dateOfBirth' ->> 'value')::date) <=
                    (DATE_PART('year', CURRENT_DATE) - 35) THEN '35-44'
               WHEN DATE_PART('year', (red.profile -> 'dateOfBirth' ->> 'value')::date) >=
                    (DATE_PART('year', CURRENT_DATE) - 54) AND
                    DATE_PART('year', (red.profile -> 'dateOfBirth' ->> 'value')::date) <=
                    (DATE_PART('year', CURRENT_DATE) - 45) THEN '45-54'
               WHEN DATE_PART('year', (red.profile -> 'dateOfBirth' ->> 'value')::date) <=
                    (DATE_PART('year', CURRENT_DATE) - 55) THEN '>=55'
               END
           )                                             AS age_range,
       (red.profile ->> 'groups')::text                  AS groups,
       (
           SELECT json_strip_nulls(
                          json_build_object(
                                  'linkedin',
                                  (
                                      SELECT (red.profile -> 'socials' -> 'linkedin' ->> 'value')::text
                                      WHERE (red.profile -> 'socials' -> 'linkedin' ->> 'value')::text IS NOT NULL
                                        AND (red.profile -> 'socials' -> 'linkedin' ->> 'value')::text != ''
                                        AND (
                                              (red.profile -> 'socials' -> 'linkedin' ->> 'privacy')::text = 'public' OR
                                              (red.profile -> 'socials' -> 'linkedin' ->> 'privacy')::text = 'hidden'
                                          )
                                  ),
                                  'twitter', (
                                      SELECT (red.profile -> 'socials' -> 'twitter' ->> 'value')::text
                                      WHERE (red.profile -> 'socials' -> 'twitter' ->> 'value')::text IS NOT NULL
                                        AND (red.profile -> 'socials' -> 'twitter' ->> 'value')::text != ''
                                        AND (
                                              (red.profile -> 'socials' -> 'twitter' ->> 'privacy')::text = 'public' OR
                                              (red.profile -> 'socials' -> 'twitter' ->> 'privacy')::text = 'hidden'
                                          )
                                  ),
                                  'facebook', (
                                      SELECT (red.profile -> 'socials' -> 'facebook' ->> 'value')::text
                                      WHERE (red.profile -> 'socials' -> 'facebook' ->> 'value')::text IS NOT NULL
                                        AND (red.profile -> 'socials' -> 'facebook' ->> 'value')::text != ''
                                        AND (
                                              (red.profile -> 'socials' -> 'facebook' ->> 'privacy')::text = 'public' OR
                                              (red.profile -> 'socials' -> 'facebook' ->> 'privacy')::text = 'hidden'
                                          )
                                  ),
                                  'instagram', (
                                      SELECT (red.profile -> 'socials' -> 'instagram' ->> 'value')::text
                                      WHERE (red.profile -> 'socials' -> 'instagram' ->> 'value')::text IS NOT NULL
                                        AND (red.profile -> 'socials' -> 'instagram' ->> 'value')::text != ''
                                        AND (
                                              (red.profile -> 'socials' -> 'instagram' ->> 'privacy')::text = 'public' OR
                                              (red.profile -> 'socials' -> 'instagram' ->> 'privacy')::text = 'hidden'
                                          )
                                  ),
                                  'researchgate', (
                                      SELECT (red.profile -> 'socials' -> 'researchgate' ->> 'value')::text
                                      WHERE (red.profile -> 'socials' -> 'researchgate' ->> 'value')::text IS NOT NULL
                                        AND (red.profile -> 'socials' -> 'researchgate' ->> 'value')::text != ''
                                        AND (
                                                  (red.profile -> 'socials' -> 'researchgate' ->> 'privacy')::text =
                                                  'public' OR
                                                  (red.profile -> 'socials' -> 'researchgate' ->> 'privacy')::text =
                                                  'hidden'
                                          )
                                  ),
                                  'google_scholar', (
                                      SELECT (red.profile -> 'socials' -> 'google_scholar' ->> 'value')::text
                                      WHERE (red.profile -> 'socials' -> 'google_scholar' ->> 'value')::text IS NOT NULL
                                        AND (red.profile -> 'socials' -> 'google_scholar' ->> 'value')::text != ''
                                        AND (
                                                  (red.profile -> 'socials' -> 'google_scholar' ->> 'privacy')::text =
                                                  'public' OR
                                                  (red.profile -> 'socials' -> 'google_scholar' ->> 'privacy')::text =
                                                  'hidden'
                                          )
                                  ),
                                  'github', (
                                      SELECT (red.profile -> 'socials' -> 'github' ->> 'value')::text
                                      WHERE (red.profile -> 'socials' -> 'github' ->> 'value')::text IS NOT NULL
                                        AND (red.profile -> 'socials' -> 'github' ->> 'value')::text != ''
                                        AND (
                                              (red.profile -> 'socials' -> 'github' ->> 'privacy')::text = 'public' OR
                                              (red.profile -> 'socials' -> 'github' ->> 'privacy')::text = 'hidden'
                                          )
                                  ),
                                  'bitbucket', (
                                      SELECT (red.profile -> 'socials' -> 'bitbucket' ->> 'value')::text
                                      WHERE (red.profile -> 'socials' -> 'bitbucket' ->> 'value')::text IS NOT NULL
                                        AND (red.profile -> 'socials' -> 'bitbucket' ->> 'value')::text != ''
                                        AND (
                                              (red.profile -> 'socials' -> 'bitbucket' ->> 'privacy')::text = 'public' OR
                                              (red.profile -> 'socials' -> 'bitbucket' ->> 'privacy')::text = 'hidden'
                                          )
                                  ),
                                  'youtube', (
                                      SELECT (red.profile -> 'socials' -> 'youtube' ->> 'value')::text
                                      WHERE (red.profile -> 'socials' -> 'youtube' ->> 'value')::text IS NOT NULL
                                        AND (red.profile -> 'socials' -> 'youtube' ->> 'value')::text != ''
                                        AND (
                                              (red.profile -> 'socials' -> 'youtube' ->> 'privacy')::text = 'public' OR
                                              (red.profile -> 'socials' -> 'youtube' ->> 'privacy')::text = 'hidden'
                                          )
                                  ),
                                  'flickr', (
                                      SELECT (red.profile -> 'socials' -> 'flickr' ->> 'value')::text
                                      WHERE (red.profile -> 'socials' -> 'flickr' ->> 'value')::text IS NOT NULL
                                        AND (red.profile -> 'socials' -> 'flickr' ->> 'value')::text != ''
                                        AND (
                                              (red.profile -> 'socials' -> 'flickr' ->> 'privacy')::text = 'public' OR
                                              (red.profile -> 'socials' -> 'flickr' ->> 'privacy')::text = 'hidden'
                                          )
                                  )
                              ))
       )                                                 AS socials,
       (
           SELECT (red.profile -> 'image' ->> 'value')::text
           WHERE (red.profile -> 'image' ->> 'value')::text IS NOT NULL
             AND (red.profile -> 'image' ->> 'value')::text != ''
             AND (
                   (red.profile -> 'image' ->> 'privacy')::text = 'public' OR
                   (red.profile -> 'image' ->> 'privacy')::text = 'hidden'
               )
       )                                                 AS image,
       (
           SELECT array_to_json(array_agg(titles ->> 'value'))
           FROM json_array_elements(red.profile -> 'titles') titles
           WHERE titles ->> 'privacy' = 'public'
              OR titles ->> 'privacy' = 'hidden'
       )                                                 AS titles,
       (
           SELECT (red.profile -> 'description' ->> 'value')::text
           WHERE (red.profile -> 'description' ->> 'value')::text IS NOT NULL
             AND (red.profile -> 'description' ->> 'value')::text != ''
             AND (
                   (red.profile -> 'description' ->> 'privacy')::text = 'public' OR
                   (red.profile -> 'description' ->> 'privacy')::text = 'hidden'
               )
       )                                                 AS description,
       (
           SELECT (red.profile -> 'role' ->> 'value')::text
           WHERE (red.profile -> 'role' ->> 'value')::text IS NOT NULL
             AND (red.profile -> 'role' ->> 'value')::text != ''
             AND (
                   (red.profile -> 'role' ->> 'privacy')::text = 'public' OR
                   (red.profile -> 'role' ->> 'privacy')::text = 'hidden'
               )
       )                                                 AS custom_role,
       (
           SELECT (red.profile -> 'website' ->> 'value')::text
           WHERE (red.profile -> 'website' ->> 'value')::text IS NOT NULL
             AND (red.profile -> 'website' ->> 'value')::text != ''
             AND (
                   (red.profile -> 'website' ->> 'privacy')::text = 'public' OR
                   (red.profile -> 'website' ->> 'privacy')::text = 'hidden'
               )
       )                                                 AS website,
       (
           SELECT (red.profile -> 'address' ->> 'value')::text
           WHERE (red.profile -> 'address' ->> 'value')::text IS NOT NULL
             AND (red.profile -> 'address' ->> 'value')::text != ''
             AND (
                   (red.profile -> 'address' ->> 'privacy')::text = 'public' OR
                   (red.profile -> 'address' ->> 'privacy')::text = 'hidden'
               )
       )                                                 AS address,
       (
           SELECT array_to_json(array_agg(interests ->> 'value'))
           FROM json_array_elements(red.profile -> 'interests') interests
           WHERE interests ->> 'privacy' = 'public'
              OR interests ->> 'privacy' = 'hidden'
       )                                                 AS interests,
       (
           SELECT array_to_json(
                          array_agg(
                                  json_strip_nulls(
                                          json_build_object(
                                                  'jobTitle', experiences_external ->> 'jobTitle',
                                                  'from', experiences_external ->> 'from',
                                                  'to', experiences_external ->> 'to',
                                                  'company', experiences_external ->> 'company',
                                                  'location', experiences_external ->> 'location',
                                                  'country', experiences_external ->> 'country'
                                              )
                                      )
                              )
                      )
           FROM json_array_elements(red.profile -> 'experiencesExternal') experiences_external
           WHERE experiences_external ->> 'privacy' = 'public'
              OR experiences_external ->> 'privacy' = 'hidden'
       )                                                 AS experiences_external,
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
           FROM json_array_elements(red.profile -> 'education') education
           WHERE education ->> 'privacy' = 'public'
              OR education ->> 'privacy' = 'hidden'
       )                                                 AS education,
       (
           SELECT array_to_json(
                          array_agg(
                                  json_strip_nulls(
                                          json_build_object(
                                                  'title', certificates ->> 'title',
                                                  'description', certificates ->> 'description',
                                                  'date', certificates ->> 'date',
                                                  'favorite', certificates ->> 'favorite'
                                              )
                                      )
                              )
                      )
           FROM json_array_elements(red.profile -> 'certificates') certificates
           WHERE certificates ->> 'privacy' = 'public'
              OR certificates ->> 'privacy' = 'hidden'
       )                                                 AS certificates,
       (
           SELECT array_to_json(
                          array_agg(
                                  json_strip_nulls(
                                          json_build_object(
                                                  'skills', (
                                              SELECT array_to_json(
                                                             array_agg(
                                                                     json_strip_nulls(
                                                                             json_build_object(
                                                                                     'value', skills ->> 'value',
                                                                                     'favorite', skills ->> 'favorite'
                                                                                 )
                                                                         )
                                                                 )
                                                         )
                                              FROM json_array_elements(categories -> 'skills') skills
                                              WHERE skills ->> 'privacy' = 'public'
                                                 OR skills ->> 'privacy' = 'hidden'
                                          ),
                                                  'categoryName', categories ->> 'categoryName'
                                              )
                                      )
                              )
                      )
           FROM json_array_elements(red.profile -> 'skillCategories') categories
           WHERE categories ->> 'privacy' = 'public'
              OR categories ->> 'privacy' = 'hidden'
       )                                                 AS skill_categories,
       (red.profile ->> 'hidden')::text                  AS hidden,
       (
           SELECT array_to_json(
                          array_agg(
                                  json_strip_nulls(
                                          json_build_object(
                                                  'jobTitle', experiences_internal ->> 'jobTitle',
                                                  'from', experiences_internal ->> 'from',
                                                  'to', experiences_internal ->> 'to',
                                                  'company', experiences_internal ->> 'company',
                                                  'lines', (
                                                      SELECT array_to_json(
                                                                     array_agg(
                                                                             json_strip_nulls(
                                                                                     json_build_object(
                                                                                             'code', lines ->> 'code',
                                                                                             'name', lines ->> 'name',
                                                                                             'office',
                                                                                             lines ->> 'office'
                                                                                         )
                                                                                 )
                                                                         )
                                                                 )
                                                      FROM json_array_elements(experiences_internal -> 'lines') lines
                                                  )
                                              )
                                      )
                              )
                      )
           FROM json_array_elements(red.profile -> 'experiencesInternal') experiences_internal
           WHERE experiences_internal ->> 'privacy' = 'public'
              OR experiences_internal ->> 'privacy' = 'hidden'
       )                                                 AS experiences_internal,
       u."updatedAt"                                     AS updated_at
FROM "user" u
         JOIN research_entity_data red ON red.research_entity = u.research_entity
         JOIN role_association ra ON ra.original_role = (red.profile -> 'roleCategory' ->> 'value')::text;