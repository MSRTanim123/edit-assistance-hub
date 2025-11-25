import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VirtualWaitingRoom } from "@/components/VirtualWaitingRoom";
import { VideoConsultationRoom } from "@/components/VideoConsultationRoom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function VideoCall() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inWaitingRoom, setInWaitingRoom] = useState(true);
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [videoConsultation, setVideoConsultation] = useState<any>(null);

  useEffect(() => {
    loadAppointmentData();
  }, [appointmentId]);

  const loadAppointmentData = async () => {
    try {
      if (!appointmentId) {
        throw new Error("No appointment ID provided");
      }

      // Get appointment details
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (
            name
          )
        `)
        .eq('id', appointmentId)
        .single();

      if (appointmentError) throw appointmentError;

      setAppointmentData(appointment);

      // Check if video consultation already exists
      const { data: existingVideo, error: videoError } = await supabase
        .from('video_consultations')
        .select('*')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      if (videoError && videoError.code !== 'PGRST116') throw videoError;

      if (existingVideo) {
        setVideoConsultation(existingVideo);
      } else if (isAdmin) {
        // Create video consultation room (only admins/doctors can create)
        const { data: videoData, error: createError } = await supabase.functions.invoke('create-video-room', {
          body: { appointmentId }
        });

        if (createError) throw createError;

        setVideoConsultation(videoData.videoConsultation);
      } else {
        throw new Error("Video consultation room not created yet. Please wait for the doctor.");
      }

    } catch (error) {
      console.error('Error loading appointment:', error);
      toast.error(error instanceof Error ? error.message : "Failed to load appointment");
      navigate('/appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCall = () => {
    setInWaitingRoom(false);
  };

  const handleEndCall = () => {
    navigate('/appointments');
  };

  const handleCancel = () => {
    navigate('/appointments');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!appointmentData || !videoConsultation) {
    return null;
  }

  if (inWaitingRoom) {
    return (
      <VirtualWaitingRoom
        appointmentDetails={{
          patientName: appointmentData.patients.name,
          appointmentType: appointmentData.appointment_type,
          appointmentDate: appointmentData.appointment_date
        }}
        onJoinCall={handleJoinCall}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <VideoConsultationRoom
      videoConsultationId={videoConsultation.id}
      roomUrl={videoConsultation.room_url}
      patientName={appointmentData.patients.name}
      isDoctor={isAdmin}
      onEndCall={handleEndCall}
    />
  );
}