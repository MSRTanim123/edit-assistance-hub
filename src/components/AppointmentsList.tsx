import { useEffect, useState } from "react";
import { Calendar, Clock, User, FileText, Edit, Trash2, CheckCircle, XCircle, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isPast, isToday, isTomorrow, isWithinInterval, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_type: string;
  status: string;
  notes: string | null;
  patient: {
    id: string;
    name: string;
    age: number;
    village: string | null;
  };
}

interface AppointmentsListProps {
  patientId?: string;
  limit?: number;
  showUpcomingOnly?: boolean;
  onViewPatient?: (patientId: string) => void;
}

export function AppointmentsList({ patientId, limit, showUpcomingOnly = false, onViewPatient }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, [patientId, limit, showUpcomingOnly]);

  const fetchAppointments = async () => {
    try {
      let query = supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_type,
          status,
          notes,
          patient:patients(id, name, age, village)
        `)
        .order("appointment_date", { ascending: true });

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      if (showUpcomingOnly) {
        query = query.gte("appointment_date", new Date().toISOString());
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments(data as any || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;

      toast.success("Appointment status updated");
      fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment status");
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentId);

      if (error) throw error;

      toast.success("Appointment deleted");
      fetchAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Failed to delete appointment");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "default",
      completed: "secondary",
      cancelled: "destructive",
      "no-show": "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      consultation: "bg-blue-100 text-blue-800",
      "follow-up": "bg-green-100 text-green-800",
      emergency: "bg-red-100 text-red-800",
      "routine-checkup": "bg-purple-100 text-purple-800",
      "video-consultation": "bg-indigo-100 text-indigo-800",
    };
    return (
      <Badge variant="outline" className={colors[type]}>
        {type.replace("-", " ")}
      </Badge>
    );
  };

  const getDateLabel = (date: string) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) return "Today";
    if (isTomorrow(appointmentDate)) return "Tomorrow";
    if (isPast(appointmentDate)) return "Past";
    if (isWithinInterval(appointmentDate, { start: new Date(), end: addDays(new Date(), 7) })) {
      return "This Week";
    }
    return "Upcoming";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading appointments...</p>
        </CardContent>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No appointments scheduled</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {appointment.patient.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Age: {appointment.patient.age} {appointment.patient.village && `• ${appointment.patient.village}`}
                </p>
              </div>
              <div className="flex gap-2">
                {getStatusBadge(appointment.status)}
                {getTypeBadge(appointment.appointment_type)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(appointment.appointment_date), "PPP")}</span>
                <Badge variant="secondary" className="ml-2">{getDateLabel(appointment.appointment_date)}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(appointment.appointment_date), "p")}</span>
              </div>
            </div>

            {appointment.notes && (
              <div className="flex gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-muted-foreground">{appointment.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {appointment.appointment_type === "video-consultation" && appointment.status === "scheduled" && (
                <Button
                  size="sm"
                  onClick={() => navigate(`/video-call/${appointment.id}`)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Video className="h-4 w-4 mr-1" />
                  Join Video Call
                </Button>
              )}
              {appointment.status === "scheduled" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              )}
              {onViewPatient && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewPatient(appointment.patient.id)}
                >
                  View Patient
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteAppointment(appointment.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
