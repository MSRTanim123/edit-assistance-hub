-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'other')),
  weight DECIMAL(5,2) CHECK (weight > 0),
  village TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create encounters table
CREATE TABLE IF NOT EXISTS public.encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  symptoms TEXT NOT NULL,
  temperature DECIMAL(4,2),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  spo2 INTEGER CHECK (spo2 >= 0 AND spo2 <= 100),
  pulse INTEGER CHECK (pulse >= 0),
  diagnosis_result JSONB,
  red_flags JSONB,
  triage_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for rural healthcare workers)
CREATE POLICY "Allow public read access to patients"
  ON public.patients FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to patients"
  ON public.patients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to patients"
  ON public.patients FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read access to encounters"
  ON public.encounters FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to encounters"
  ON public.encounters FOR INSERT
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for patients
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_patients_created_at ON public.patients(created_at DESC);
CREATE INDEX idx_encounters_patient_id ON public.encounters(patient_id);
CREATE INDEX idx_encounters_created_at ON public.encounters(created_at DESC);