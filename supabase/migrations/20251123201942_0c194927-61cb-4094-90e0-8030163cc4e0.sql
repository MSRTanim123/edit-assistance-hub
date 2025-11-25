-- Fix encounters RLS policy to use created_by instead of user_id
-- This allows healthcare workers to create encounters for patients they created

-- Drop the existing policy that checks user_id
DROP POLICY IF EXISTS "Users can view their own patient encounters" ON encounters;

-- Create new policy that checks created_by
CREATE POLICY "Users can view encounters for patients they created"
ON encounters
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM patients
    WHERE patients.id = encounters.patient_id
    AND patients.created_by = auth.uid()
  )
);