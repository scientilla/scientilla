SELECT DISTINCT partners->>'institute'::TEXT as institute
FROM project p,
    jsonb_array_elements(p.project_data->'partners') partners
WHERE p.type = 7;
