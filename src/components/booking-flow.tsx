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
import { useStudio } from "@/context/studio-context";
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
  parseDuration,
  type Service,
  saveBlockedPeriods,
  saveWeekSchedule,
} from "@/lib/booking-data";
import { businessService } from "@/lib/business-service";
import { SectionBackground } from "./admin/site_editor/components/SectionBackground";

type BookingStep = "service" | "date" | "time" | "form" | "confirmation";

interface StudioConfig {
  weekly?: unknown[];
  interval?: string | number;
  slotInterval?: string | number;
  appointmentFlow?: {
    weekly?: unknown[];
    interval?: string | number;
    slotInterval?: string | number;
    step3Times?: {
      weekly?: unknown[];
      interval?: string | number;
    };
  };
  appointment_flow?: {
    weekly?: unknown[];
    interval?: string | number;
    slotInterval?: string | number;
    step3_times?: {
      weekly?: unknown[];
      interval?: string | number;
    };
  };
}

export function BookingFlow() {
  const { studio } = useStudio();
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
  const [serviceSettings, setServiceSettings] = useState<BookingStepSettings>(
    defaultBookingServiceSettings,
  );
  const [dateSettings, setDateSettings] = useState<BookingStepSettings>(
    defaultBookingDateSettings,
  );
  const [timeSettings, setTimeSettings] = useState<BookingStepSettings>(
    defaultBookingTimeSettings,
  );
  const [formSettings, setFormSettings] = useState<BookingStepSettings>(
    defaultBookingFormSettings,
  );
  const [confirmationSettings, setConfirmationSettings] =
    useState<BookingStepSettings>(defaultBookingConfirmationSettings);

  // Sincronizar Horários e Intervalo do Backend
  useEffect(() => {
    if (!studio?.id) return;

    const syncSchedule = async () => {
      try {
        console.log(">>> [BOOKING_FLOW] Sincronizando horários do backend para studio:", studio.id);
        const [settings, blocks] = await Promise.all([
          businessService.getSettings(studio.id),
          businessService.getBlocks(studio.id),
        ]);

        // Fallback para dados vindos do Studio Context se a API de settings falhar (401)
        const studioFallback = (studio as unknown || {}) as StudioConfig;
        const configFallback = (studio?.config as unknown || {}) as StudioConfig;

        const weeklyData = (settings?.weekly ||
          studioFallback.weekly ||
          configFallback.weekly ||
          configFallback.appointmentFlow?.weekly ||
          configFallback.appointment_flow?.weekly ||
          configFallback.appointmentFlow?.step3Times?.weekly ||
          configFallback.appointment_flow?.step3_times?.weekly) as unknown[] | undefined;
        const intervalData = (settings?.interval ||
          studioFallback.interval ||
          studioFallback.slotInterval ||
          configFallback.interval ||
          configFallback.appointmentFlow?.interval ||
          configFallback.appointmentFlow?.step3Times?.interval ||
          configFallback.appointment_flow?.step3_times?.interval ||
          configFallback.appointmentFlow?.slotInterval) as string | number | undefined;

        console.log(">>> [BOOKING_FLOW] Dados recebidos:", {
          hasWeekly: !!weeklyData,
          interval: intervalData,
          hasBlocks: !!blocks
        });

        if (weeklyData && Array.isArray(weeklyData) && weeklyData.length > 0) {
          const dayNames = [
            "Domingo",
            "Segunda-feira",
            "Terça-feira",
            "Quarta-feira",
            "Quinta-feira",
            "Sexta-feira",
            "Sábado",
          ];

          const currentInterval = parseDuration(intervalData) || 30;

          const finalSchedule = Array.from({ length: 7 }, (_, i) => {
            const dayData = weeklyData.find((d) => {
              const day = d as Record<string, unknown>;
              // Tenta dayOfWeek ou day_of_week
              const dayIndex = day.dayOfWeek !== undefined ? Number(day.dayOfWeek) : Number(day.day_of_week);
              return dayIndex === i;
            }) as Record<string, unknown> | undefined;

            if (dayData) {
              const isOpen = dayData.status === "OPEN" || dayData.isOpen === true || dayData.is_open === true;
              return {
                dayOfWeek: i,
                dayName: dayNames[i],
                isOpen,
                openTime: (dayData.morningStart ||
                  dayData.openTime ||
                  dayData.open_time ||
                  "08:00") as string,
                lunchStart: (dayData.morningEnd ||
                  dayData.lunchStart ||
                  dayData.lunch_start ||
                  "12:00") as string,
                lunchEnd: (dayData.afternoonStart ||
                  dayData.lunchEnd ||
                  dayData.lunch_end ||
                  "13:00") as string,
                closeTime: (dayData.afternoonEnd ||
                  dayData.closeTime ||
                  dayData.close_time ||
                  "18:00") as string,
                interval: currentInterval,
              };
            }
            return {
              dayOfWeek: i,
              dayName: dayNames[i],
              isOpen: false,
              openTime: "08:00",
              lunchStart: "12:00",
              lunchEnd: "13:00",
              closeTime: "18:00",
              interval: currentInterval,
            };
          });

          console.log(
            ">>> [BOOKING_FLOW] Intervalo sincronizado:",
            currentInterval,
          );
          saveWeekSchedule(finalSchedule);

          if (blocks) {
            saveBlockedPeriods(blocks);
          }

          console.log(">>> [BOOKING_FLOW] Schedule e Intervalo sincronizados com sucesso!");
          // Forçar re-renderização disparando evento
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("bookingTimeUpdate")); // Novo evento para forçar atualização do calendário
        }
      } catch (error) {
        console.error(">>> [BOOKING_FLOW] Erro ao sincronizar horários:", error);
      }
    };

    syncSchedule();
  }, [studio]);

  // Load initial settings
  useEffect(() => {
    console.log('>>> [BOOKING_DEBUG] Studio data recebido:', {
      hasStudio: !!studio,
      hasConfig: !!studio?.config,
      hasBookingSteps: !!studio?.config?.bookingSteps,
      bookingSteps: studio?.config?.bookingSteps
    });

    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    if (studio?.config?.bookingSteps) {
      const steps = studio.config.bookingSteps as Record<string, unknown>;
      
      console.log('>>> [DEBUG_RAW] Estrutura completa bookingSteps:', steps);
      
      // Função para sanitizar cores
      const sanitizeColor = (color: string | undefined): string | undefined => {
        if (!color) return undefined;
        const trimmed = color.trim();
        if (trimmed.startsWith('#') || trimmed.startsWith('rgb') || trimmed.startsWith('hsl')) {
          return trimmed;
        }
        return `#${trimmed}`;
      };

      const getStepSettings = (stepData: Record<string, unknown> | undefined): BookingStepSettings => {
        if (!stepData) return {} as BookingStepSettings;
        
        // Prioridade absoluta para backgroundColor conforme normalização do back-end
        const rawColor = (stepData.backgroundColor as string) ||
                         ((stepData.cardConfig as Record<string, unknown>)?.backgroundColor as string) || 
                         ((stepData.card_config as Record<string, unknown>)?.background_color as string) ||
                         (stepData.cardBgColor as string) || 
                         (stepData.card_bg_color as string);
        
        const finalColor = sanitizeColor(rawColor);
        
        if (finalColor) {
          console.log('>>> [COLOR_APPLIED] Cor detectada:', finalColor);
        }

        return {
          ...stepData,
          cardBgColor: finalColor || "#FFFFFF",
          bgColor: (stepData.bgColor as string) || finalColor || "transparent",
        } as BookingStepSettings;
      };

      // Mapeamento priorizando chaves no plural conforme normalização (step1Services, step2Dates, etc)
      const serviceSettingsData = getStepSettings((steps.step1Services || steps.step1Service || steps.service) as Record<string, unknown> | undefined);
      const dateSettingsData = getStepSettings((steps.step2Dates || steps.step2Date || steps.date) as Record<string, unknown> | undefined);
      const timeSettingsData = getStepSettings((steps.step3Times || steps.step3Time || steps.time) as Record<string, unknown> | undefined);
      const formSettingsData = getStepSettings((steps.step4Form || steps.form) as Record<string, unknown> | undefined);
      const confirmationSettingsData = getStepSettings((steps.step5Confirmation || steps.step4Confirmation || steps.confirmation) as Record<string, unknown> | undefined);

      // Adicionar o intervalo global ao timeSettings se disponível no config do studio
      if (studio?.config?.interval || studio?.config?.slotInterval) {
        timeSettingsData.interval = studio.config.interval || studio.config.slotInterval;
      }

      console.log('>>> [BOOKING_DEBUG] Aplicando cores do Studio (Mapeado):', {
        serviceCardBg: serviceSettingsData.cardBgColor,
        dateCardBg: dateSettingsData.cardBgColor,
        timeCardBg: timeSettingsData.cardBgColor,
        formCardBg: serviceSettingsData.cardBgColor, // Fallback pro form se necessário
        confirmationCardBg: confirmationSettingsData.cardBgColor,
      });

      setServiceSettings(serviceSettingsData);
      setDateSettings(dateSettingsData);
      setTimeSettings(timeSettingsData);
      setFormSettings(formSettingsData);
      setConfirmationSettings(confirmationSettingsData);
    } else {
      console.log('>>> [BOOKING_DEBUG] Studio sem config, usando padrões/storage');
      setServiceSettings(getBookingServiceSettings());
      setDateSettings(getBookingDateSettings());
      setTimeSettings(getBookingTimeSettings());
      setFormSettings(getBookingFormSettings());
      setConfirmationSettings(getBookingConfirmationSettings());
    }
  }, [studio]);

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
      if (
        event.data?.type === "SCROLL_TO_SECTION" ||
        event.data?.type === "SET_ISOLATED_SECTION"
      ) {
        const sectionId = event.data.sectionId;
        if (sectionId === "booking-service") setCurrentStep("service");
        if (sectionId === "booking-date") setCurrentStep("date");
        if (sectionId === "booking-time") setCurrentStep("time");
        if (sectionId === "booking-form") setCurrentStep("form");
        if (sectionId === "booking-confirmation")
          setCurrentStep("confirmation");
      }
    };

    const handleServiceUpdate = () =>
      setServiceSettings(getBookingServiceSettings());
    const handleDateUpdate = () => setDateSettings(getBookingDateSettings());
    const handleTimeUpdate = () => setTimeSettings(getBookingTimeSettings());
    const handleFormUpdate = () => setFormSettings(getBookingFormSettings());
    const handleConfirmationUpdate = () =>
      setConfirmationSettings(getBookingConfirmationSettings());

    window.addEventListener("message", handleMessage);
    window.addEventListener(
      "bookingServiceSettingsUpdated",
      handleServiceUpdate,
    );
    window.addEventListener("bookingDateSettingsUpdated", handleDateUpdate);
    window.addEventListener("bookingTimeSettingsUpdated", handleTimeUpdate);
    window.addEventListener("bookingFormSettingsUpdated", handleFormUpdate);
    window.addEventListener(
      "bookingConfirmationSettingsUpdated",
      handleConfirmationUpdate,
    );

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener(
        "bookingServiceSettingsUpdated",
        handleServiceUpdate,
      );
      window.removeEventListener(
        "bookingDateSettingsUpdated",
        handleDateUpdate,
      );
      window.removeEventListener(
        "bookingTimeSettingsUpdated",
        handleTimeUpdate,
      );
      window.removeEventListener(
        "bookingFormSettingsUpdated",
        handleFormUpdate,
      );
      window.removeEventListener(
        "bookingConfirmationSettingsUpdated",
        handleConfirmationUpdate,
      );
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
          description:
            "Este é um serviço de exemplo para visualização no editor.",
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

  const effectiveDate =
    selectedDate ||
    (only === "booking-time" || only === "booking-form"
      ? new Date().toISOString().split("T")[0]
      : "");
  const effectiveTime =
    selectedTime || (only === "booking-form" ? "09:00" : "");
  const effectiveBooking =
    confirmedBooking ||
    (only === "booking-confirmation"
      ? ({
          id: "mock-id",
          serviceId: "mock-service",
          serviceName: "Serviço de Exemplo",
          serviceDuration: 60,
          servicePrice: 100,
          date: effectiveDate || new Date().toISOString().split("T")[0],
          time: "09:00",
          clientName: "Cliente de Exemplo",
          clientEmail: "cliente@exemplo.com",
          clientPhone: "(11) 99999-9999",
          status: "confirmado",
          createdAt: new Date().toISOString(),
          notificationsSent: { email: true, whatsapp: true },
        } as Booking)
      : null);

  const renderStepHeader = (settings: BookingStepSettings) => (
    <div className="text-center mb-12">
      <h2
        className="text-4xl md:text-5xl font-bold mb-4 transition-all duration-300"
        style={{
          color: settings.titleColor || "var(--primary)",
          fontFamily: settings.titleFont || "var(--font-title)",
        }}
      >
        {settings.title}
      </h2>
      <p
        className="text-lg opacity-80 max-w-2xl mx-auto transition-all duration-300"
        style={{
          color: settings.subtitleColor || "var(--foreground)",
          fontFamily: settings.subtitleFont || "var(--font-body)",
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
                        backgroundColor:
                          step.completed ||
                          (only &&
                            steps.findIndex(
                              (s) => s.id === only.replace("booking-", ""),
                            ) > index)
                            ? "var(--primary)"
                            : "transparent",
                        borderColor:
                          step.completed ||
                          (only &&
                            steps.findIndex(
                              (s) => s.id === only.replace("booking-", ""),
                            ) > index) ||
                          currentStep === step.id
                            ? "var(--primary)"
                            : "var(--border)",
                        color:
                          step.completed ||
                          (only &&
                            steps.findIndex(
                              (s) => s.id === only.replace("booking-", ""),
                            ) > index)
                            ? "white"
                            : currentStep === step.id
                              ? "var(--primary)"
                              : "var(--muted-foreground)",
                      }}
                    >
                      {step.completed ||
                      (only &&
                        steps.findIndex(
                          (s) => s.id === only.replace("booking-", ""),
                        ) > index) ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className="text-xs mt-2 font-medium"
                      style={{
                        color:
                          currentStep === step.id || step.completed
                            ? "var(--primary)"
                            : "var(--muted-foreground)",
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className="h-0.5 flex-1 mx-2 transition-all duration-300"
                      style={{
                        backgroundColor:
                          step.completed ||
                          (only &&
                            steps.findIndex(
                              (s) => s.id === only.replace("booking-", ""),
                            ) > index)
                            ? "var(--primary)"
                            : "var(--border)",
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
          <section
            id="booking-service"
            className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
          >
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
          <section
            id="booking-date"
            className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
          >
            <SectionBackground settings={dateSettings} />
            <div className="container mx-auto px-4 relative z-10">
              {renderStepHeader(dateSettings)}
              <div className="max-w-4xl mx-auto">
                <BookingCalendar
                  onDateSelect={handleDateSelect}
                  onBack={() => setCurrentStep("service")}
                  settings={dateSettings}
                />
              </div>
            </div>
          </section>
        )}

        {currentStep === "time" && totalService && effectiveDate && (
          <section
            id="booking-time"
            className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
          >
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
            <section
              id="booking-form"
              className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
            >
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
          <section
            id="booking-confirmation"
            className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
          >
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
