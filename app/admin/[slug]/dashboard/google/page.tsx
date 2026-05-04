import { GoogleCalendarManager } from "@/components/admin/google-calendar-manager";

export default function GooglePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Google Calendar
        </h2>
        <p className="text-muted-foreground">
          Sincronize seus agendamentos com o Google
        </p>
      </div>
      <GoogleCalendarManager />
    </div>
  );
}
