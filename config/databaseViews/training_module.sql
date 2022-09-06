CREATE OR REPLACE VIEW training_module AS
SELECT ri.id,
       ri.kind,
       ri.type,
       ri.draft_creator,
       ritm.title,
       ritm.authors_str,
       ritm.referent,
       ritm.institute,
       ritm.phd_course,
       ritm.year,
       ritm.issuer,
       ritm.description,
       ritm.hours,
       ritm.lectures,
       ritm.research_domains,
       ritm.location,
       ritm.delivery,
       ritm."createdAt",
       ritm."updatedAt"
FROM research_item ri
         JOIN research_item_training_module ritm on ri.id = ritm.research_item;