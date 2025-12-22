"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getWeekSchedule, type Service } from "@/lib/booking-data";

type BookingCalendarProps = {
  service: Service;
  onDateSelect: (date: string) => void;
  onBack: () => void;
};

export function BookingCalendar({
  service,
  onDateSelect,
  onBack,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekSchedule = getWeekSchedule();

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

    const dayOfWeek = selected.getDay();
    const daySchedule = weekSchedule.find((d) => d.dayOfWeek === dayOfWeek);
    return !daySchedule || !daySchedule.isOpen;
  };

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Card className="border-accent/20 bg-accent/5 p-4">
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <span className="font-semibold">{service.name}</span>
              <span className="text-muted-foreground">
                {" "}
                - R$ {service.price}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <h2 className="font-serif text-2xl font-bold mb-6 text-center">
        Escolha a Data
      </h2>

      <Card>
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={previousMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="font-semibold text-lg">
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
                      : "hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  }`}
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
