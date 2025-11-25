import { useState, useEffect } from "react";
import { Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppointmentForm } from "./AppointmentForm";
import { supabase } from "@/integrations/supabase/client";

interface Patient {
  id: string;
  name: string;
  age: number;
}

export function TelemedicineCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("id, name, age")
      .order("name");

    if (error) {
      console.error("Error loading patients:", error);
      return;
    }

    setPatients(data || []);
  };

  const handleSchedule = () => {
    setIsOpen(true);
  };

  const handleSuccess = () => {
    setIsOpen(false);
    setSelectedPatient("");
  };

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            <CardTitle>Telemedicine</CardTitle>
          </div>
          <CardDescription>
            Virtual consultations with patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleSchedule}
            className="w-full"
          >
            <Video className="h-4 w-4 mr-2" />
            Schedule Video Call
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Video Consultation</DialogTitle>
          </DialogHeader>
          {!selectedPatient ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select a patient to schedule a video consultation</p>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} (Age: {patient.age})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <AppointmentForm
              patientId={selectedPatient}
              patientName={selectedPatientData?.name || ""}
              onSuccess={handleSuccess}
              onCancel={() => setIsOpen(false)}
              defaultType="video-consultation"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}