-- Alter encounters table to support larger vital sign values
-- Current NUMERIC(4,2) only allows up to 99.99, but temperature can be >100°F
-- Changing to NUMERIC(6,2) to support values up to 9999.99

ALTER TABLE encounters 
  ALTER COLUMN temperature TYPE NUMERIC(6,2),
  ALTER COLUMN blood_pressure_systolic TYPE NUMERIC(6,2),
  ALTER COLUMN blood_pressure_diastolic TYPE NUMERIC(6,2),
  ALTER COLUMN spo2 TYPE NUMERIC(6,2),
  ALTER COLUMN pulse TYPE NUMERIC(6,2);