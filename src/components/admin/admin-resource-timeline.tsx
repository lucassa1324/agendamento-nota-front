"use client";

import { format, parseISO, startOfDay } from "date-fns";
import { useState } from "react";
import { SuggestedAppointmentCard } from "@/components/admin/suggested-appointment-card";
import type { Appointment } from "@/lib/api-appointments";
import { parseDuration } from "@/lib/booking-data";
import { cn } from "@/lib/utils";

type StaffMember = {
  id: string;
  name: string;
};

type AdminResourceTimelineProps = {
  date: string;
  professionals: StaffMember[];
  appointments: Appointment[];
  onDropAssignment: (appointment: Appointment, staffId: string) => Promise<void>;
};

const SLOT_MINUTES = 30;
const START_MINUTE = 8 * 60;
const END_MINUTE = 21 * 60;

const toMinuteOfDay = (isoDate: string) => {
  const date = parseISO(isoDate);
  return date.getHours() * 60 + date.getMinutes();
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export function AdminResourceTimeline({
  date,
  professionals,
  appointments,
  onDropAssignment,
}: AdminResourceTimelineProps) {
  const timelineMinutes = END_MINUTE - START_MINUTE;
  const slotCount = timelineMinutes / SLOT_MINUTES;
  const slots = Array.from({ length: slotCount + 1 }, (_, index) => {
    const minute = START_MINUTE + index * SLOT_MINUTES;
    const hh = Math.floor(minute / 60)
      .toString()
      .padStart(2, "0");
    const mm = (minute % 60).toString().padStart(2, "0");
    return `${hh}:${mm}`;
  });

  const selectedDate = startOfDay(new Date(`${date}T12:00:00`));
  const dailyAppointments = appointments.filter((item) => {
    const when = parseISO(item.scheduledAt);
    return when.toDateString() === selectedDate.toDateString();
  });

  const [draggingId, setDraggingId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <div className="min-w-275">
        <div className="grid grid-cols-[220px_1fr] border-b bg-muted/30">
          <div className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
            Profissionais
          </div>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${slotCount + 1}, minmax(0, 1fr))` }}>
            {slots.map((slot) => (
              <div key={slot} className="border-l px-1 py-2 text-center text-[10px] font-medium text-muted-foreground">
                {slot}
              </div>
            ))}
          </div>
        </div>

        {professionals.map((professional) => {
          const rows = dailyAppointments.filter((item) => item.staffId === professional.id);
          return (
            <div
              key={professional.id}
              className="grid grid-cols-[220px_1fr] border-b"
              onDragOver={(event) => event.preventDefault()}
              onDrop={async () => {
                const appt = dailyAppointments.find((item) => item.id === draggingId);
                if (!appt) return;
                await onDropAssignment(appt, professional.id);
                setDraggingId(null);
              }}
            >
              <div className="flex items-center border-r px-3 py-3 text-sm font-medium">
                {professional.name}
              </div>
              <div
                className="relative h-22"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to right, transparent 0, transparent calc((100% / 26) - 1px), rgba(148, 163, 184, 0.25) calc((100% / 26) - 1px), rgba(148, 163, 184, 0.25) calc(100% / 26))",
                }}
              >
                {rows.map((appointment) => {
                  const startMinute = clamp(
                    toMinuteOfDay(appointment.scheduledAt),
                    START_MINUTE,
                    END_MINUTE,
                  );
                  const duration = Math.max(30, parseDuration(appointment.serviceDurationSnapshot));
                  const left = ((startMinute - START_MINUTE) / timelineMinutes) * 100;
                  const width = (duration / timelineMinutes) * 100;
                  return (
                    <div
                      key={`${appointment.id}-${appointment.version ?? 1}-wrapper`}
                      className="absolute top-2"
                      style={{ left: `${left}%`, width: `${Math.max(12, width)}%` }}
                    >
                      <SuggestedAppointmentCard
                        appointment={appointment}
                        timeLabel={format(parseISO(appointment.scheduledAt), "HH:mm")}
                        onDragStart={(item) => setDraggingId(item.id)}
                        className={cn(draggingId === appointment.id && "opacity-60")}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
