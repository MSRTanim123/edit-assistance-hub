import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VideoConsultationRoomProps {
  videoConsultationId: string;
  roomUrl: string;
  patientName: string;
  isDoctor: boolean;
  onEndCall: () => void;
}

export function VideoConsultationRoom({
  videoConsultationId,
  roomUrl,
  patientName,
  isDoctor,
  onEndCall
}: VideoConsultationRoomProps) {
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [consultationNotes, setConsultationNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    // Update video consultation status to in_progress
    const updateStatus = async () => {
      const { error } = await supabase.functions.invoke('update-video-status', {
        body: {
          videoConsultationId,
          status: 'in_progress'
        }
      });
      
      if (error) {
        console.error('Error updating status:', error);
      }
    };

    updateStatus();
  }, [videoConsultationId]);

  const handleSaveNotes = async () => {
    if (!consultationNotes.trim()) {
      toast.error("Please enter consultation notes");
      return;
    }

    setIsSavingNotes(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from('consultation_notes')
        .insert({
          video_consultation_id: videoConsultationId,
          doctor_id: user.id,
          notes: consultationNotes
        });

      if (error) throw error;

      toast.success("Notes saved successfully");
      setConsultationNotes("");
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error("Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleEndCall = async () => {
    try {
      const { error } = await supabase.functions.invoke('update-video-status', {
        body: {
          videoConsultationId,
          status: 'completed'
        }
      });
      
      if (error) throw error;

      toast.success("Call ended successfully");
      onEndCall();
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error("Failed to end call");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <iframe
                ref={videoRef}
                src={roomUrl}
                allow="camera; microphone; fullscreen; display-capture"
                className="w-full h-full"
              />
            </div>
          </Card>

          {/* Controls */}
          <Card className="p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handleEndCall}
                variant="destructive"
                size="lg"
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                End Call
              </Button>
            </div>
          </Card>
        </div>

        {/* Notes Panel - Only visible for doctors */}
        {isDoctor && (
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Patient Information</h3>
              <p className="text-sm text-muted-foreground">{patientName}</p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Consultation Notes</h3>
              <Textarea
                placeholder="Enter consultation notes here..."
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                className="min-h-[300px]"
              />
              <Button
                onClick={handleSaveNotes}
                disabled={isSavingNotes || !consultationNotes.trim()}
                className="w-full mt-4"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSavingNotes ? "Saving..." : "Save Notes"}
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}