import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Video, Mic, MicOff, VideoOff } from "lucide-react";
import { toast } from "sonner";

interface VirtualWaitingRoomProps {
  appointmentDetails: {
    patientName: string;
    appointmentType: string;
    appointmentDate: string;
  };
  onJoinCall: () => void;
  onCancel: () => void;
}

export function VirtualWaitingRoom({ 
  appointmentDetails, 
  onJoinCall, 
  onCancel 
}: VirtualWaitingRoomProps) {
  const [isTestingDevices, setIsTestingDevices] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    testDevices();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const testDevices = async () => {
    setIsTestingDevices(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      toast.success("Camera and microphone are working");
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Failed to access camera or microphone");
    } finally {
      setIsTestingDevices(false);
    }
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !micEnabled;
      });
      setMicEnabled(!micEnabled);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !cameraEnabled;
      });
      setCameraEnabled(!cameraEnabled);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Video className="h-6 w-6" />
            Virtual Waiting Room
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Appointment Details</h3>
            <div className="bg-muted p-4 rounded-lg space-y-1">
              <p><span className="font-medium">Patient:</span> {appointmentDetails.patientName}</p>
              <p><span className="font-medium">Type:</span> {appointmentDetails.appointmentType}</p>
              <p><span className="font-medium">Time:</span> {new Date(appointmentDetails.appointmentDate).toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Device Check</h3>
            <div className="flex gap-4">
              <Button
                variant={micEnabled ? "default" : "secondary"}
                onClick={toggleMic}
                disabled={isTestingDevices || !stream}
              >
                {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                <span className="ml-2">{micEnabled ? "Mute" : "Unmute"}</span>
              </Button>
              <Button
                variant={cameraEnabled ? "default" : "secondary"}
                onClick={toggleCamera}
                disabled={isTestingDevices || !stream}
              >
                {cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                <span className="ml-2">{cameraEnabled ? "Stop Video" : "Start Video"}</span>
              </Button>
            </div>
            {isTestingDevices && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Testing devices...
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-4">
            <Button
              onClick={onJoinCall}
              disabled={isTestingDevices || !stream}
              className="flex-1"
              size="lg"
            >
              <Video className="h-5 w-5 mr-2" />
              Join Video Call
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}