"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
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
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null,
  );

  const steps = [
    { id: "service", label: "Serviço", completed: !!selectedService },
    { id: "date", label: "Data", completed: !!selectedDate },
    { id: "time", label: "Horário", completed: !!selectedTime },
    { id: "form", label: "Dados", completed: !!confirmedBooking },
  ];

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
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
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setConfirmedBooking(null);
  };

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
        <ServiceSelector onSelect={handleServiceSelect} />
      )}

      {currentStep === "date" && selectedService && (
        <BookingCalendar
          service={selectedService}
          onDateSelect={handleDateSelect}
          onBack={() => setCurrentStep("service")}
        />
      )}

      {currentStep === "time" && selectedService && selectedDate && (
        <TimeSlotSelector
          service={selectedService}
          date={selectedDate}
          onTimeSelect={handleTimeSelect}
          onBack={() => setCurrentStep("date")}
        />
      )}

      {currentStep === "form" &&
        selectedService &&
        selectedDate &&
        selectedTime && (
          <BookingForm
            service={selectedService}
            date={selectedDate}
            time={selectedTime}
            onConfirm={handleBookingConfirm}
            onBack={() => setCurrentStep("time")}
          />
        )}

      {currentStep === "confirmation" &&
        confirmedBooking &&
        selectedService && (
          <BookingConfirmation
            booking={confirmedBooking}
            service={selectedService}
            onReset={handleReset}
          />
        )}
    </div>
  );
}
