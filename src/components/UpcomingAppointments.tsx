import { useEffect, useState } from "react";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow, addDays, isWithinInterval, isPast } from "date-fns";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_type: string;
  status: string;
  patient: {
    name: string;
    age: number;
  };
}

export function UpcomingAppointments() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [overdueFollowUps, setOverdueFollowUps] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const now = new Date();
      const sevenDaysLater = addDays(now, 7);

      // Fetch upcoming appointments (next 7 days)
      const { data: upcoming, error: upcomingError } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_type,
          status,
          patient:patients(name, age)
        `)
        .eq("status", "scheduled")
        .gte("appointment_date", now.toISOString())
        .lte("appointment_date", sevenDaysLater.toISOString())
        .order("appointment_date", { ascending: true })
        .limit(5);

      if (upcomingError) throw upcomingError;

      // Fetch overdue follow-ups
      const { data: overdue, error: overdueError } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_type,
          status,
          patient:patients(name, age)
        `)
        .eq("status", "scheduled")
        .eq("appointment_type", "follow-up")
        .lt("appointment_date", now.toISOString())
        .order("appointment_date", { ascending: true })
        .limit(5);

      if (overdueError) throw overdueError;

      setUpcomingAppointments(upcoming as any || []);
      setOverdueFollowUps(overdue as any || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDateLabel = (date: string) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) return "Today";
    if (isTomorrow(appointmentDate)) return "Tomorrow";
    return format(appointmentDate, "MMM d");
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

  return (
    <div className="space-y-4">
      {/* Overdue Follow-ups */}
      {overdueFollowUps.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Overdue Follow-ups ({overdueFollowUps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueFollowUps.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold">{appointment.patient.name}</p>
                  <p className="text-sm text-muted-foreground">Age: {appointment.patient.age}</p>
                </div>
                <div className="text-right">
                  <Badge variant="destructive" className="mb-1">
                    {format(new Date(appointment.appointment_date), "MMM d, p")}
                  </Badge>
                  <p className="text-xs text-muted-foreground">Follow-up</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Appointments (Next 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No upcoming appointments</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{appointment.patient.name}</p>
                    <p className="text-sm text-muted-foreground">Age: {appointment.patient.age}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1">
                      {getDateLabel(appointment.appointment_date)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(appointment.appointment_date), "p")}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {appointment.appointment_type.replace("-", " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
