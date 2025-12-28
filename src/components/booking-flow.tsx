"use client";

import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookingCalendar } from "@/components/booking-calendar";
import { BookingConfirmation } from "@/components/booking-confirmation";
import { BookingForm } from "@/components/booking-form";
import { ServiceSelector } from "@/components/service-selector";
import { TimeSlotSelector } from "@/components/time-slot-selector";
import { Card } from "@/components/ui/card";
import { 
  type Booking, 
  type BookingStepSettings,
  defaultBookingConfirmationSettings,
  defaultBookingDateSettings,
  defaultBookingFormSettings,
  defaultBookingServiceSettings,
  defaultBookingTimeSettings,
  getBookingConfirmationSettings, 
  getBookingDateSettings,
  getBookingFormSettings,
  getBookingServiceSettings,
  getBookingTimeSettings,
  type Service 
} from "@/lib/booking-data";
import { SectionBackground } from "./admin/site_editor/components/SectionBackground";

type BookingStep = "service" | "date" | "time" | "form" | "confirmation";

export function BookingFlow() {
  const searchParams = useSearchParams();
  const only = searchParams.get("only");

  const [currentStep, setCurrentStep] = useState<BookingStep>(() => {
    if (only === "booking-service") return "service";
    if (only === "booking-date") return "date";
    if (only === "booking-time") return "time";
    if (only === "booking-form") return "form";
    if (only === "booking-confirmation") return "confirmation";
    return "service";
  });
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null,
  );

  // Settings states
  const [serviceSettings, setServiceSettings] = useState<BookingStepSettings>(defaultBookingServiceSettings);
  const [dateSettings, setDateSettings] = useState<BookingStepSettings>(defaultBookingDateSettings);
  const [timeSettings, setTimeSettings] = useState<BookingStepSettings>(defaultBookingTimeSettings);
  const [formSettings, setFormSettings] = useState<BookingStepSettings>(defaultBookingFormSettings);
  const [confirmationSettings, setConfirmationSettings] = useState<BookingStepSettings>(defaultBookingConfirmationSettings);

  // Load initial settings
  useEffect(() => {
    setServiceSettings(getBookingServiceSettings());
    setDateSettings(getBookingDateSettings());
    setTimeSettings(getBookingTimeSettings());
    setFormSettings(getBookingFormSettings());
    setConfirmationSettings(getBookingConfirmationSettings());
  }, []);

  // Listen for real-time updates from editor
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_BOOKING_SERVICE_SETTINGS") {
        setServiceSettings(event.data.settings);
      }
      if (event.data?.type === "UPDATE_BOOKING_DATE_SETTINGS") {
        setDateSettings(event.data.settings);
      }
      if (event.data?.type === "UPDATE_BOOKING_TIME_SETTINGS") {
        setTimeSettings(event.data.settings);
      }
      if (event.data?.type === "UPDATE_BOOKING_FORM_SETTINGS") {
        setFormSettings(event.data.settings);
      }
      if (event.data?.type === "UPDATE_BOOKING_CONFIRMATION_SETTINGS") {
        setConfirmationSettings(event.data.settings);
      }
      if (event.data?.type === "SCROLL_TO_SECTION" || event.data?.type === "SET_ISOLATED_SECTION") {
        const sectionId = event.data.sectionId;
        if (sectionId === "booking-service") setCurrentStep("service");
        if (sectionId === "booking-date") setCurrentStep("date");
        if (sectionId === "booking-time") setCurrentStep("time");
        if (sectionId === "booking-form") setCurrentStep("form");
        if (sectionId === "booking-confirmation") setCurrentStep("confirmation");
      }
    };

    const handleServiceUpdate = () => setServiceSettings(getBookingServiceSettings());
    const handleDateUpdate = () => setDateSettings(getBookingDateSettings());
    const handleTimeUpdate = () => setTimeSettings(getBookingTimeSettings());
    const handleFormUpdate = () => setFormSettings(getBookingFormSettings());
    const handleConfirmationUpdate = () => setConfirmationSettings(getBookingConfirmationSettings());

    window.addEventListener("message", handleMessage);
    window.addEventListener("bookingServiceSettingsUpdated", handleServiceUpdate);
    window.addEventListener("bookingDateSettingsUpdated", handleDateUpdate);
    window.addEventListener("bookingTimeSettingsUpdated", handleTimeUpdate);
    window.addEventListener("bookingFormSettingsUpdated", handleFormUpdate);
    window.addEventListener("bookingConfirmationSettingsUpdated", handleConfirmationUpdate);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("bookingServiceSettingsUpdated", handleServiceUpdate);
      window.removeEventListener("bookingDateSettingsUpdated", handleDateUpdate);
      window.removeEventListener("bookingTimeSettingsUpdated", handleTimeUpdate);
      window.removeEventListener("bookingFormSettingsUpdated", handleFormUpdate);
      window.removeEventListener("bookingConfirmationSettingsUpdated", handleConfirmationUpdate);
    };
  }, []);

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
    if (selectedServices.length === 0) {
      // Se estivermos em modo de isolamento no editor, fornecemos um serviço mock
      if (only?.startsWith("booking-")) {
        return {
          id: "mock-service",
          name: "Serviço de Exemplo",
          price: 100,
          duration: 60,
          description: "Este é um serviço de exemplo para visualização no editor.",
        } as Service;
      }
      return null;
    }
    return {
      id: selectedServices.map((s) => s.id).join(","),
      name: selectedServices.map((s) => s.name).join(" + "),
      price: selectedServices.reduce((acc, s) => acc + s.price, 0),
      duration: selectedServices.reduce((acc, s) => acc + s.duration, 0),
      description: selectedServices.map((s) => s.name).join(", "),
    } as Service;
  }, [selectedServices, only]);

  const effectiveDate = selectedDate || (only === "booking-time" || only === "booking-form" ? new Date().toISOString().split('T')[0] : "");
  const effectiveTime = selectedTime || (only === "booking-form" ? "09:00" : "");
  const effectiveBooking = confirmedBooking || (only === "booking-confirmation" ? {
    id: "mock-id",
    serviceId: "mock-service",
    serviceName: "Serviço de Exemplo",
    serviceDuration: 60,
    servicePrice: 100,
    date: effectiveDate || new Date().toISOString().split('T')[0],
    time: "09:00",
    clientName: "Cliente de Exemplo",
    clientEmail: "cliente@exemplo.com",
    clientPhone: "(11) 99999-9999",
    status: "confirmado",
    createdAt: new Date().toISOString(),
    notificationsSent: { email: true, whatsapp: true }
  } as Booking : null);

  const renderStepHeader = (settings: BookingStepSettings) => (
    <div className="text-center mb-12">
      <h2 
        className="text-4xl md:text-5xl font-bold mb-4 transition-all duration-300"
        style={{ 
          color: settings.titleColor || "var(--primary)",
          fontFamily: settings.titleFont || "var(--font-title)"
        }}
      >
        {settings.title}
      </h2>
      <p 
        className="text-lg opacity-80 max-w-2xl mx-auto transition-all duration-300"
        style={{ 
          color: settings.subtitleColor || "var(--foreground)",
          fontFamily: settings.subtitleFont || "var(--font-body)"
        }}
      >
        {settings.subtitle}
      </p>
    </div>
  );

  return (
    <div id="booking" className="w-full mx-auto">
      {/* Progress Steps */}
      {currentStep !== "confirmation" && (
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                      style={{
                        backgroundColor: (step.completed || (only && steps.findIndex(s => s.id === only.replace('booking-', '')) > index))
                          ? "var(--primary)"
                          : "transparent",
                        borderColor: (step.completed || (only && steps.findIndex(s => s.id === only.replace('booking-', '')) > index) || currentStep === step.id)
                          ? "var(--primary)"
                          : "var(--border)",
                        color: (step.completed || (only && steps.findIndex(s => s.id === only.replace('booking-', '')) > index))
                          ? "white"
                          : (currentStep === step.id ? "var(--primary)" : "var(--muted-foreground)")
                      }}
                    >
                      {step.completed || (only && steps.findIndex(s => s.id === only.replace('booking-', '')) > index) ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-xs mt-2 font-medium" style={{ color: currentStep === step.id || step.completed ? "var(--primary)" : "var(--muted-foreground)" }}>{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className="h-0.5 flex-1 mx-2 transition-all duration-300"
                      style={{
                        backgroundColor: (step.completed || (only && steps.findIndex(s => s.id === only.replace('booking-', '')) > index))
                          ? "var(--primary)"
                          : "var(--border)"
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Step Content */}
      <div className="relative min-h-150">
        {currentStep === "service" && (
          <section id="booking-service" className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            <SectionBackground settings={serviceSettings} />
            <div className="container mx-auto px-4 relative z-10">
              {renderStepHeader(serviceSettings)}
              <div className="max-w-4xl mx-auto">
                <ServiceSelector
                  onSelect={handleServiceSelect}
                  selectedServices={selectedServices}
                  settings={serviceSettings}
                />
              </div>
            </div>
          </section>
        )}

        {currentStep === "date" && totalService && (
          <section id="booking-date" className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            <SectionBackground settings={dateSettings} />
            <div className="container mx-auto px-4 relative z-10">
              {renderStepHeader(dateSettings)}
              <div className="max-w-4xl mx-auto">
                <BookingCalendar
                  service={totalService}
                  onDateSelect={handleDateSelect}
                  onBack={() => setCurrentStep("service")}
                  settings={dateSettings}
                />
              </div>
            </div>
          </section>
        )}

        {currentStep === "time" && totalService && effectiveDate && (
          <section id="booking-time" className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            <SectionBackground settings={timeSettings} />
            <div className="container mx-auto px-4 relative z-10">
              {renderStepHeader(timeSettings)}
              <div className="max-w-4xl mx-auto">
                <TimeSlotSelector
                  service={totalService}
                  date={effectiveDate}
                  onTimeSelect={handleTimeSelect}
                  onBack={() => setCurrentStep("date")}
                  onDateChange={(date) => setSelectedDate(date)}
                  settings={timeSettings}
                />
              </div>
            </div>
          </section>
        )}

        {currentStep === "form" &&
          totalService &&
          effectiveDate &&
          effectiveTime && (
            <section id="booking-form" className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
              <SectionBackground settings={formSettings} />
              <div className="container mx-auto px-4 relative z-10">
                {renderStepHeader(formSettings)}
                <div className="max-w-2xl mx-auto">
                  <BookingForm
                    service={totalService}
                    date={effectiveDate}
                    time={effectiveTime}
                    onConfirm={handleBookingConfirm}
                    onBack={() => setCurrentStep("time")}
                    settings={formSettings}
                  />
                </div>
              </div>
            </section>
          )}

        {currentStep === "confirmation" && effectiveBooking && totalService && (
          <section id="booking-confirmation" className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            <SectionBackground settings={confirmationSettings} />
            <div className="container mx-auto px-4 relative z-10">
              {renderStepHeader(confirmationSettings)}
              <div className="max-w-4xl mx-auto">
                <BookingConfirmation
                  booking={effectiveBooking}
                  service={totalService}
                  onReset={handleReset}
                  settings={confirmationSettings}
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
