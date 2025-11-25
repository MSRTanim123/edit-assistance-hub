import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentsList } from "@/components/AppointmentsList";
import { AppointmentForm } from "@/components/AppointmentForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

interface Patient {
  id: string;
  name: string;
  age: number;
}

export default function Appointments() {
  const navigate = useNavigate();
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, name, age")
        .order("name");

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error loading patients:", error);
      toast.error("Failed to load patients");
    }
  };

  const handleNewAppointment = () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first");
      return;
    }
    setShowNewAppointmentDialog(true);
  };

  const handleAppointmentSuccess = () => {
    setShowNewAppointmentDialog(false);
    setSelectedPatient(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="text-3xl font-bold flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity w-fit"
            onClick={() => navigate("/")}
          >
            <Calendar className="h-8 w-8" />
            Appointments
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage patient appointments and follow-ups
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule New Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select
                value={selectedPatient?.id || ""}
                onValueChange={(value) => {
                  const patient = patients.find(p => p.id === value);
                  setSelectedPatient(patient || null);
                }}
              >
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
            <Button onClick={handleNewAppointment} disabled={!selectedPatient}>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="all">All Appointments</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <AppointmentsList key={`upcoming-${refreshKey}`} showUpcomingOnly={true} />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <AppointmentsList key={`all-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <AppointmentsList key={`past-${refreshKey}`} />
        </TabsContent>
      </Tabs>

      <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <AppointmentForm
              patientId={selectedPatient.id}
              patientName={selectedPatient.name}
              onSuccess={handleAppointmentSuccess}
              onCancel={() => setShowNewAppointmentDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
