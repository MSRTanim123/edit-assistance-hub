-- Update the appointments INSERT policy to allow admins
DROP POLICY IF EXISTS "Users can create appointments for their patients" ON appointments;

CREATE POLICY "Users can create appointments for their patients" 
ON appointments FOR INSERT 
WITH CHECK (
  auth.uid() = created_by 
  AND (
    -- Allow admins to create appointments for any patient
    public.is_admin(auth.uid())
    OR
    -- Allow users to create appointments for patients they created
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = appointments.patient_id 
      AND patients.created_by = auth.uid()
    )
  )
);