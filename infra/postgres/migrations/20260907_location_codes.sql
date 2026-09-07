ALTER TABLE jobs ADD COLUMN IF NOT EXISTS country_code varchar(2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS state_code varchar(10);
ALTER TABLE application_eligibility ADD COLUMN IF NOT EXISTS current_country_code varchar(2);
ALTER TABLE application_eligibility ADD COLUMN IF NOT EXISTS current_state_code varchar(10);

UPDATE jobs SET country_code = CASE lower(regexp_replace(country, '[^a-zA-Z]', '', 'g'))
  WHEN 'india' THEN 'IN' WHEN 'unitedstates' THEN 'US' WHEN 'unitedkingdom' THEN 'GB'
  ELSE country_code END WHERE country_code IS NULL;
