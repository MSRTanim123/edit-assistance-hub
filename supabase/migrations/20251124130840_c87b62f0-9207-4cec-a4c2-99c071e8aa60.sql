-- Create video_consultations table to store video call sessions
CREATE TABLE public.video_consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  meeting_room_id TEXT NOT NULL,
  room_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'waiting', 'in_progress', 'completed', 'cancelled')),
  recording_consent_given BOOLEAN DEFAULT false,
  recording_url TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consultation_notes table for notes during video calls
CREATE TABLE public.consultation_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_consultation_id UUID NOT NULL REFERENCES public.video_consultations(id) ON DELETE CASCADE,
  encounter_id UUID REFERENCES public.encounters(id) ON DELETE SET NULL,
  doctor_id UUID NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctor_status table to track online/offline status
CREATE TABLE public.doctor_status (
  user_id UUID NOT NULL PRIMARY KEY,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_consultations
CREATE POLICY "Users can view their own video consultations"
ON public.video_consultations
FOR SELECT
USING (
  appointment_id IN (
    SELECT id FROM public.appointments WHERE patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  )
  OR auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
);

CREATE POLICY "Admins can manage video consultations"
ON public.video_consultations
FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- RLS Policies for consultation_notes
CREATE POLICY "Users can view their consultation notes"
ON public.consultation_notes
FOR SELECT
USING (
  video_consultation_id IN (
    SELECT id FROM public.video_consultations WHERE appointment_id IN (
      SELECT id FROM public.appointments WHERE patient_id IN (
        SELECT id FROM public.patients WHERE user_id = auth.uid()
      )
    )
  )
  OR auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
);

CREATE POLICY "Admins can manage consultation notes"
ON public.consultation_notes
FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- RLS Policies for doctor_status
CREATE POLICY "Anyone can view doctor status"
ON public.doctor_status
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own status"
ON public.doctor_status
FOR ALL
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_video_consultations_updated_at
BEFORE UPDATE ON public.video_consultations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultation_notes_updated_at
BEFORE UPDATE ON public.consultation_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_status_updated_at
BEFORE UPDATE ON public.doctor_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_video_consultations_appointment_id ON public.video_consultations(appointment_id);
CREATE INDEX idx_video_consultations_status ON public.video_consultations(status);
CREATE INDEX idx_consultation_notes_video_consultation_id ON public.consultation_notes(video_consultation_id);
CREATE INDEX idx_doctor_status_is_online ON public.doctor_status(is_online);