"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  type BookingStepSettings,
  getBlockedPeriods,
  getWeekSchedule,
  type Service,
} from "@/lib/booking-data";

type BookingCalendarProps = {
  service: Service;
  onDateSelect: (date: string) => void;
  onBack: () => void;
  settings?: BookingStepSettings;
};

export function BookingCalendar({
  onDateSelect,
  onBack,
  settings,
}: Omit<BookingCalendarProps, "service">) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekSchedule = getWeekSchedule();
  const blockedPeriods = getBlockedPeriods();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentDate);

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected >= today && !isDateDisabled(day)) {
      const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      onDateSelect(dateString);
    }
  };

  const isDateDisabled = (day: number) => {
    const selected = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) return true;

    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Verificar se a data está bloqueada totalmente
    const isBlocked = blockedPeriods.some(
      (b) => b.date === dateString && !b.startTime && !b.endTime,
    );
    if (isBlocked) return true;

    const dayOfWeek = selected.getDay();
    const daySchedule = weekSchedule.find((d) => d.dayOfWeek === dayOfWeek);
    return !daySchedule || !daySchedule.isOpen;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} size="sm" className="h-9">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar para serviços
        </Button>
      </div>

      <h2
        className="text-3xl font-bold text-center mb-8"
        style={{
          color: settings?.titleColor || "var(--foreground)",
          fontFamily: settings?.titleFont || "var(--font-title)",
        }}
      >
        {settings?.title || "Escolha a Data"}
      </h2>

      <Card
        className="border-primary/20 overflow-hidden"
        style={{
          backgroundColor: settings?.cardBgColor || "#FFFFFF",
          borderColor: settings?.accentColor
            ? `${settings.accentColor}33`
            : undefined,
        }}
      >
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={previousMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3
              className="font-semibold text-lg"
              style={{
                color: settings?.titleColor || "var(--foreground)",
                fontFamily: settings?.titleFont || "var(--font-title)",
              }}
            >
              {monthNames[month]} {year}
            </h3>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground p-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startingDayOfWeek }).map((_, index) => {
              const uniqueKey = `empty-${month}-${year}-${index}`;
              return <div key={uniqueKey} />;
            })}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const disabled = isDateDisabled(day);
              return (
                <button
                  key={`${year}-${month}-${day}`}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={disabled}
                  className={`aspect-square p-2 rounded-lg text-sm font-medium transition-colors ${
                    disabled
                      ? "text-muted-foreground/30 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  style={{
                    backgroundColor: !disabled ? "transparent" : undefined,
                    color: !disabled
                      ? settings?.accentColor || "var(--primary)"
                      : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled) {
                      e.currentTarget.style.backgroundColor =
                        settings?.accentColor || "var(--primary)";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!disabled) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color =
                        settings?.accentColor || "var(--primary)";
                    }
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
