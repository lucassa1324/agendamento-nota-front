"use client";

import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { BookingCalendar } from "@/components/booking-calendar";
import { BookingConfirmation } from "@/components/booking-confirmation";
import { BookingForm } from "@/components/booking-form";
import { ServiceSelector } from "@/components/service-selector";
import { TimeSlotSelector } from "@/components/time-slot-selector";
import { Card } from "@/components/ui/card";
import type { Booking, Service } from "@/lib/booking-data";

type BookingStep = "service" | "date" | "time" | "form" | "confirmation";

export function BookingFlow() {
  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null,
  );

  const steps = [
    { id: "service", label: "Serviço", completed: selectedServices.length > 0 },
    { id: "date", label: "Data", completed: !!selectedDate },
    { id: "time", label: "Horário", completed: !!selectedTime },
    { id: "form", label: "Dados", completed: !!confirmedBooking },
  ];

  const handleServiceSelect = (services: Service[]) => {
    setSelectedServices(services);
    setCurrentStep("date");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setCurrentStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep("form");
  };

  const handleBookingConfirm = (booking: Booking) => {
    setConfirmedBooking(booking);
    setCurrentStep("confirmation");
  };

  const handleReset = () => {
    setCurrentStep("service");
    setSelectedServices([]);
    setSelectedDate("");
    setSelectedTime("");
    setConfirmedBooking(null);
  };

  const totalService = useMemo(() => {
    if (selectedServices.length === 0) return null;
    return {
      id: selectedServices.map((s) => s.id).join(","),
      name: selectedServices.map((s) => s.name).join(" + "),
      price: selectedServices.reduce((acc, s) => acc + s.price, 0),
      duration: selectedServices.reduce((acc, s) => acc + s.duration, 0),
      description: selectedServices.map((s) => s.name).join(", "),
    } as Service;
  }, [selectedServices]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      {currentStep !== "confirmation" && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      step.completed
                        ? "bg-accent border-accent text-accent-foreground"
                        : currentStep === step.id
                          ? "border-accent text-accent"
                          : "border-border text-muted-foreground"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-2 font-medium">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${step.completed ? "bg-accent" : "bg-border"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Step Content */}
      {currentStep === "service" && (
        <ServiceSelector
          onSelect={handleServiceSelect}
          selectedServices={selectedServices}
        />
      )}

      {currentStep === "date" && totalService && (
        <BookingCalendar
          service={totalService}
          onDateSelect={handleDateSelect}
          onBack={() => setCurrentStep("service")}
        />
      )}

      {currentStep === "time" && totalService && selectedDate && (
        <TimeSlotSelector
          service={totalService}
          date={selectedDate}
          onTimeSelect={handleTimeSelect}
          onBack={() => setCurrentStep("date")}
          onDateChange={(date) => setSelectedDate(date)}
        />
      )}

      {currentStep === "form" &&
        totalService &&
        selectedDate &&
        selectedTime && (
          <BookingForm
            service={totalService}
            date={selectedDate}
            time={selectedTime}
            onConfirm={handleBookingConfirm}
            onBack={() => setCurrentStep("time")}
          />
        )}

      {currentStep === "confirmation" && confirmedBooking && totalService && (
        <BookingConfirmation
          booking={confirmedBooking}
          service={totalService}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
