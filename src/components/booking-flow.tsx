"use client";

import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  defaultColorSettings,
  getBookingConfirmationSettings,
  getBookingDateSettings,
  getBookingFormSettings,
  getBookingServiceSettings,
  getBookingTimeSettings,
  normalizeStepSettings,
  parseDuration,
  type Service,
  saveBlockedPeriods,
  saveWeekSchedule,
} from "@/lib/booking-data";
import { businessService } from "@/lib/business-service";
import type { SiteConfigData } from "@/lib/site-config-types";
import {
  SectionBackground,
  type SectionBackgroundSettings,
} from "./admin/site_editor/components/SectionBackground";

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
  const { studio, isLoading } = useStudio();
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
  const [previewOverrides, setPreviewOverrides] = useState<
    Partial<Record<BookingStep, BookingStepSettings>>
  >({});

  // Debug visibility and state
  useEffect(() => {
    const pageVisibility =
      ((studio?.config as Record<string, unknown>)?.pageVisibility as Record<
        string,
        boolean
      >) || {};
    console.log(">>> [BOOKING_FLOW] Renderizando com:", {
      isLoading,
      hasStudio: !!studio,
      only,
      currentStep,
      selectedServicesCount: selectedServices.length,
      pageVisibility,
      agendarVisible: pageVisibility.agendar !== false,
    });
  }, [isLoading, studio, only, currentStep, selectedServices.length]);

  // Force re-render on storage or specific events
  const [tick, setTick] = useState(0);
  const handleRefresh = useCallback(() => setTick((t) => t + 1), []);
  const relevantStorageSuffixes = useMemo(
    () => [
      "bookingServiceSettings",
      "bookingDateSettings",
      "bookingTimeSettings",
      "bookingFormSettings",
      "bookingConfirmationSettings",
      "last_draft_update",
      "layoutGlobal",
      "current_admin_id",
    ],
    [],
  );
  const handleStorageRefresh = useCallback(
    (event: StorageEvent) => {
      const key = event.key || "";
      if (!key) return;
      if (key === "studio-preview-cache" || key === "studio-local-draft") {
        return;
      }
      const shouldRefresh = relevantStorageSuffixes.some(
        (suffix) => key === suffix || key.endsWith(`_${suffix}`),
      );
      if (shouldRefresh) {
        handleRefresh();
      }
    },
    [handleRefresh, relevantStorageSuffixes],
  );

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

    // Se houver apenas um serviço, retorna ele diretamente para evitar perda de propriedades (como conflictingServiceIds)
    if (selectedServices.length === 1) {
      return selectedServices[0];
    }

    // Se houver múltiplos, cria o aglomerado
    return {
      id: selectedServices.map((s) => s.id).join(","),
      name: selectedServices.map((s) => s.name).join(", "),
      price: selectedServices.reduce(
        (acc, s) => acc + (Number(s.price) || 0),
        0,
      ),
      duration: selectedServices.reduce(
        (acc, s) => acc + parseDuration(s.duration),
        0,
      ),
      description: selectedServices.map((s) => s.name).join(", "),
      conflictingServiceIds: selectedServices.flatMap(
        (s) => s.conflictingServiceIds || [],
      ),
      advancedRules: {
        conflicts: selectedServices.flatMap((s) => {
          const advRules = s.advancedRules || s.advanced_rules;
          if (Array.isArray(advRules)) return advRules;
          return advRules?.conflicts || [];
        }),
      },
    } as Service;
  }, [selectedServices, only]);

  // Settings states
  const globalColors = useMemo(() => {
    const config = studio?.config as SiteConfigData | undefined;
    const siteCustomization =
      config?.siteCustomization || config?.site_customization;
    const layoutGlobal =
      siteCustomization?.layoutGlobal || siteCustomization?.layout_global;
    const siteColors = (layoutGlobal as Record<string, unknown>)?.siteColors as
      | Record<string, string>
      | undefined;

    const appointmentFlow = (config?.appointmentFlow ||
      config?.appointment_flow) as Record<string, unknown> | undefined;
    const appointmentFlowColors = (appointmentFlow?.colors ||
      appointmentFlow?.cores) as Record<string, string> | undefined;

    return {
      background:
        appointmentFlowColors?.background ||
        siteColors?.background ||
        ((layoutGlobal as Record<string, unknown>)?.background as string) ||
        config?.colors?.background ||
        defaultColorSettings.background,
      text:
        siteColors?.text || config?.colors?.text || defaultColorSettings.text,
    };
  }, [studio?.config]);

  const applyGlobalFallbacks = useCallback(
    (settings: BookingStepSettings) => {
      const appearance = settings.appearance || {};
      return {
        ...settings,
        bgColor:
          settings.bgColor ||
          appearance.backgroundColor ||
          globalColors.background,
        titleColor:
          settings.titleColor || appearance.titleColor || globalColors.text,
        subtitleColor:
          settings.subtitleColor ||
          appearance.subtitleColor ||
          globalColors.text,
        appearance: {
          ...appearance,
          backgroundColor:
            appearance.backgroundColor ||
            settings.bgColor ||
            globalColors.background,
          titleColor:
            appearance.titleColor || settings.titleColor || globalColors.text,
          subtitleColor:
            appearance.subtitleColor ||
            settings.subtitleColor ||
            globalColors.text,
        },
      };
    },
    [globalColors.background, globalColors.text],
  );

  const serviceSettings = useMemo(() => {
    void tick;
    const base = getBookingServiceSettings(
      studio?.config as Record<string, unknown>,
    );
    const override = previewOverrides.service;
    const merged = override
      ? normalizeStepSettings(override as Record<string, unknown>, base)
      : base;
    return applyGlobalFallbacks(merged);
  }, [studio?.config, tick, applyGlobalFallbacks, previewOverrides.service]);

  const dateSettings = useMemo(() => {
    void tick;
    const base = getBookingDateSettings(studio?.config as SiteConfigData);
    const override = previewOverrides.date;
    const merged = override
      ? normalizeStepSettings(override as Record<string, unknown>, base)
      : base;
    return applyGlobalFallbacks(merged);
  }, [studio?.config, tick, applyGlobalFallbacks, previewOverrides.date]);

  const timeSettings = useMemo(() => {
    void tick;
    const base = getBookingTimeSettings(studio?.config as SiteConfigData);
    const override = previewOverrides.time;
    const merged = override
      ? normalizeStepSettings(override as Record<string, unknown>, base)
      : base;
    if (studio?.config?.interval || studio?.config?.slotInterval) {
      merged.interval = studio.config.interval || studio.config.slotInterval;
    }
    return applyGlobalFallbacks(merged);
  }, [studio?.config, tick, applyGlobalFallbacks, previewOverrides.time]);

  const formSettings = useMemo(() => {
    void tick;
    const base = getBookingFormSettings(studio?.config as SiteConfigData);
    const override = previewOverrides.form;
    const merged = override
      ? normalizeStepSettings(override as Record<string, unknown>, base)
      : base;
    return applyGlobalFallbacks(merged);
  }, [studio?.config, tick, applyGlobalFallbacks, previewOverrides.form]);

  const confirmationSettings = useMemo(() => {
    void tick;
    const base = getBookingConfirmationSettings(
      studio?.config as SiteConfigData,
    );
    const override = previewOverrides.confirmation;
    const merged = override
      ? normalizeStepSettings(override as Record<string, unknown>, base)
      : base;
    return applyGlobalFallbacks(merged);
  }, [
    studio?.config,
    tick,
    applyGlobalFallbacks,
    previewOverrides.confirmation,
  ]);

  // Sincronizar Horários e Intervalo do Backend
  useEffect(() => {
    if (!studio?.id) return;

    const syncSchedule = async () => {
      try {
        console.log(
          ">>> [BOOKING_FLOW] Sincronizando horários do backend para studio:",
          studio.id,
        );
        const [settings, blocks] = await Promise.all([
          businessService.getSettings(studio.id),
          businessService.getBlocks(studio.id),
        ]);

        // Fallback para dados vindos do Studio Context se a API de settings falhar (401)
        const studioFallback = ((studio as unknown) || {}) as StudioConfig;
        const configFallback = ((studio?.config as unknown) ||
          {}) as StudioConfig;

        const weeklyData = (settings?.weekly ||
          studioFallback.weekly ||
          configFallback.weekly ||
          configFallback.appointmentFlow?.weekly ||
          configFallback.appointment_flow?.weekly ||
          configFallback.appointmentFlow?.step3Times?.weekly ||
          configFallback.appointment_flow?.step3_times?.weekly) as
          | unknown[]
          | undefined;
        const intervalData = (settings?.interval ||
          studioFallback.interval ||
          studioFallback.slotInterval ||
          configFallback.interval ||
          configFallback.appointmentFlow?.interval ||
          configFallback.appointmentFlow?.step3Times?.interval ||
          configFallback.appointment_flow?.step3_times?.interval ||
          configFallback.appointmentFlow?.slotInterval) as
          | string
          | number
          | undefined;

        console.log(">>> [BOOKING_FLOW] Dados recebidos:", {
          hasWeekly: !!weeklyData,
          interval: intervalData,
          hasBlocks: !!blocks,
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
              const dayIndex =
                day.dayOfWeek !== undefined
                  ? Number(day.dayOfWeek)
                  : Number(day.day_of_week);
              return dayIndex === i;
            }) as Record<string, unknown> | undefined;

            if (dayData) {
              const isOpen =
                dayData.status === "OPEN" ||
                dayData.isOpen === true ||
                dayData.is_open === true;
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

          console.log(
            ">>> [BOOKING_FLOW] Schedule e Intervalo sincronizados com sucesso!",
          );
          // Forçar re-renderização disparando evento
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("bookingTimeUpdate")); // Novo evento para forçar atualização do calendário
        }
      } catch (error) {
        console.error(
          ">>> [BOOKING_FLOW] Erro ao sincronizar horários:",
          error,
        );
      }
    };

    syncSchedule();
  }, [studio]);

  // Load initial settings
  useEffect(() => {
    window.addEventListener("storage", handleStorageRefresh);
    window.addEventListener("bookingServiceSettingsUpdated", handleRefresh);
    window.addEventListener("bookingDateSettingsUpdated", handleRefresh);
    window.addEventListener("bookingTimeSettingsUpdated", handleRefresh);
    window.addEventListener("bookingFormSettingsUpdated", handleRefresh);
    window.addEventListener(
      "bookingConfirmationSettingsUpdated",
      handleRefresh,
    );

    return () => {
      window.removeEventListener("storage", handleStorageRefresh);
      window.removeEventListener(
        "bookingServiceSettingsUpdated",
        handleRefresh,
      );
      window.removeEventListener("bookingDateSettingsUpdated", handleRefresh);
      window.removeEventListener("bookingTimeSettingsUpdated", handleRefresh);
      window.removeEventListener("bookingFormSettingsUpdated", handleRefresh);
      window.removeEventListener(
        "bookingConfirmationSettingsUpdated",
        handleRefresh,
      );
    };
  }, [handleRefresh, handleStorageRefresh]);

  // Listen for real-time updates from editor
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("[IFRAME_RECEIVER] Mensagem recebida:", event.data);
      if (
        event.data?.type === "UPDATE_BOOKING_SERVICE_SETTINGS" ||
        event.data?.type === "UPDATE_BOOKING_DATE_SETTINGS" ||
        event.data?.type === "UPDATE_BOOKING_TIME_SETTINGS" ||
        event.data?.type === "UPDATE_BOOKING_FORM_SETTINGS" ||
        event.data?.type === "UPDATE_BOOKING_CONFIRMATION_SETTINGS"
      ) {
        const typeMap: Record<string, BookingStep> = {
          UPDATE_BOOKING_SERVICE_SETTINGS: "service",
          UPDATE_BOOKING_DATE_SETTINGS: "date",
          UPDATE_BOOKING_TIME_SETTINGS: "time",
          UPDATE_BOOKING_FORM_SETTINGS: "form",
          UPDATE_BOOKING_CONFIRMATION_SETTINGS: "confirmation",
        };

        const step = typeMap[event.data.type];
        const settings = event.data.settings as
          | Record<string, unknown>
          | undefined;

        if (settings && step) {
          const normalized = normalizeStepSettings(settings);

          if (
            normalized.bgColor &&
            normalized.bgColor !== "transparent" &&
            !normalized.bgImage
          ) {
            normalized.bgType = "color";
          }

          setPreviewOverrides((prev) => {
            const defaultSettingsMap = {
              service: defaultBookingServiceSettings,
              date: defaultBookingDateSettings,
              time: defaultBookingTimeSettings,
              form: defaultBookingFormSettings,
              confirmation: defaultBookingConfirmationSettings,
            };

            const baseDefault = defaultSettingsMap[step];

            return {
              ...prev,
              [step]: {
                ...baseDefault,
                ...(prev[step] || {}),
                ...normalized,
                appearance: {
                  ...(baseDefault.appearance || {}),
                  ...((prev[step]?.appearance ||
                    {}) as BookingStepSettings["appearance"]),
                  ...(normalized.appearance || {}),
                },
              },
            };
          });
        }
        handleRefresh();
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

    window.addEventListener("message", handleMessage);
    window.addEventListener("bookingServiceSettingsUpdated", handleRefresh);
    window.addEventListener("bookingDateSettingsUpdated", handleRefresh);
    window.addEventListener("bookingTimeSettingsUpdated", handleRefresh);
    window.addEventListener("bookingFormSettingsUpdated", handleRefresh);
    window.addEventListener(
      "bookingConfirmationSettingsUpdated",
      handleRefresh,
    );

    // Notify editor that we are ready to receive settings
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "BOOKING_FLOW_READY" }, "*");
    }

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener(
        "bookingServiceSettingsUpdated",
        handleRefresh,
      );
      window.removeEventListener("bookingDateSettingsUpdated", handleRefresh);
      window.removeEventListener("bookingTimeSettingsUpdated", handleRefresh);
      window.removeEventListener("bookingFormSettingsUpdated", handleRefresh);
      window.removeEventListener(
        "bookingConfirmationSettingsUpdated",
        handleRefresh,
      );
    };
  }, [handleRefresh]);

  const steps = [
    { id: "service", label: "Serviço", completed: selectedServices.length > 0 },
    { id: "date", label: "Data", completed: !!selectedDate },
    { id: "time", label: "Horário", completed: !!selectedTime },
    { id: "form", label: "Dados", completed: !!confirmedBooking },
  ];

  const handleServiceSelect = (services: Service[]) => {
    console.log(
      ">>> [BOOKING_FLOW] Serviços selecionados:",
      services.map((s) => s.name),
    );
    setSelectedServices(services);
  };

  const handleServiceConfirm = () => {
    if (selectedServices.length > 0) {
      setCurrentStep("date");
    }
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

  // Monitor de Consistência de Estado
  useEffect(() => {
    const steps = [
      { name: "Service", settings: serviceSettings },
      { name: "Date", settings: dateSettings },
      { name: "Time", settings: timeSettings },
      { name: "Form", settings: formSettings },
      { name: "Confirmation", settings: confirmationSettings },
    ];

    steps.forEach((step) => {
      if (step.settings) {
        const appearance = step.settings.appearance || {};
        const bgColor = appearance.backgroundColor || step.settings.bgColor;
        const titleColor = appearance.titleColor || step.settings.titleColor;

        if (!bgColor && step.settings.bgType === "color") {
          console.warn(
            `>>> [CONSISTENCY] bgColor/backgroundColor ausente em ${step.name}`,
          );
        }
        if (!titleColor) {
          console.warn(`>>> [CONSISTENCY] titleColor ausente em ${step.name}`);
        }
      }
    });
  }, [
    serviceSettings,
    dateSettings,
    timeSettings,
    formSettings,
    confirmationSettings,
  ]);

  // TASK 2: Bloqueio de Renderização
  if (isLoading || !studio?.config) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Carregando configurações do studio...
          </p>
        </div>
      </div>
    );
  }

  const handleReset = () => {
    setCurrentStep("service");
    setSelectedServices([]);
    setSelectedDate("");
    setSelectedTime("");
    setConfirmedBooking(null);
  };

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

  const renderStepHeader = (settings: BookingStepSettings) => {
    const appearance = settings.appearance || {};

    // Prioridade: Custom Setting > Global Appearance > Default Fallback
    const titleColor =
      settings.titleColor || appearance.titleColor || "var(--foreground)";
    const subtitleColor =
      settings.subtitleColor ||
      appearance.subtitleColor ||
      "var(--muted-foreground)";
    const titleFont =
      settings.titleFont || appearance.titleFont || "var(--font-title)";
    const subtitleFont =
      settings.subtitleFont || appearance.subtitleFont || "var(--font-body)";

    return (
      <div className="text-center mb-12">
        <h2
          className="text-4xl md:text-5xl font-bold mb-4 transition-all duration-300"
          style={{
            color: titleColor,
            fontFamily: titleFont,
          }}
        >
          {settings.title}
        </h2>
        <p
          className="text-lg max-w-2xl mx-auto transition-all duration-300"
          style={{
            color: subtitleColor,
            fontFamily: subtitleFont,
          }}
        >
          {settings.subtitle}
        </p>
      </div>
    );
  };

  const currentSettings =
    currentStep === "service"
      ? serviceSettings
      : currentStep === "date"
        ? dateSettings
        : currentStep === "time"
          ? timeSettings
          : currentStep === "form"
            ? formSettings
            : currentStep === "confirmation"
              ? confirmationSettings
              : serviceSettings;

  const flowAccent = currentSettings?.accentColor || "var(--primary)";
  const flowCardBg = currentSettings?.cardBgColor || "transparent";
  const showServiceSectionBackground = !(
    serviceSettings?.bgType === "color" && serviceSettings?.bgColor
  );

  return (
    <div
      id="booking"
      key={currentSettings?.bgColor || "booking"}
      className="min-h-screen w-full mx-auto transition-colors duration-300"
      style={{
        backgroundColor: currentSettings?.bgColor || "transparent",
      }}
    >
      {/* Progress Steps */}
      {currentStep !== "confirmation" && (
        <div className="max-w-4xl mx-auto px-4">
          <Card
            className="p-6 mb-8 border-border/50"
            style={{ backgroundColor: flowCardBg }}
          >
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
                            ? flowAccent
                            : "transparent",
                        borderColor: flowAccent,
                        color:
                          step.completed ||
                          (only &&
                            steps.findIndex(
                              (s) => s.id === only.replace("booking-", ""),
                            ) > index)
                            ? "white"
                            : flowAccent,
                        opacity:
                          step.completed ||
                          (only &&
                            steps.findIndex(
                              (s) => s.id === only.replace("booking-", ""),
                            ) > index) ||
                          currentStep === step.id
                            ? 1
                            : 0.6,
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
                        color: flowAccent,
                        opacity:
                          currentStep === step.id || step.completed ? 1 : 0.6,
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className="h-0.5 flex-1 mx-2 transition-all duration-300"
                      style={{
                        backgroundColor: flowAccent,
                        opacity:
                          step.completed ||
                          (only &&
                            steps.findIndex(
                              (s) => s.id === only.replace("booking-", ""),
                            ) > index)
                            ? 1
                            : 0.4,
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
            className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 bg-transparent"
            style={{
              backgroundColor: serviceSettings.bgColor || serviceSettings.appearance?.backgroundColor,
            }}
          >
            {showServiceSectionBackground && (
              <SectionBackground
                settings={serviceSettings as SectionBackgroundSettings}
              />
            )}
            <div className="container mx-auto px-4 relative z-10">
              {renderStepHeader(serviceSettings)}
              <div className="max-w-4xl mx-auto">
                <ServiceSelector
                  onSelect={handleServiceSelect}
                  onConfirm={handleServiceConfirm}
                  selectedServices={selectedServices}
                  settings={serviceSettings}
                  showTitle={false}
                />
              </div>
            </div>
          </section>
        )}

        {currentStep === "date" && totalService && (
          <section
            id="booking-date"
            className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 bg-transparent"
            style={{
              backgroundColor: dateSettings.bgColor || dateSettings.appearance?.backgroundColor,
            }}
          >
            <SectionBackground
              settings={dateSettings as SectionBackgroundSettings}
            />
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
            className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 bg-transparent"
            style={{
              backgroundColor: timeSettings.bgColor || timeSettings.appearance?.backgroundColor,
            }}
          >
            <SectionBackground
              settings={timeSettings as SectionBackgroundSettings}
            />
            <div className="container mx-auto px-4 relative z-10">
              {renderStepHeader(timeSettings)}
              <div className="max-w-4xl mx-auto">
                <TimeSlotSelector
                  services={selectedServices}
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
              className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 bg-transparent"
              style={{
                backgroundColor: formSettings.bgColor || formSettings.appearance?.backgroundColor,
              }}
            >
              <SectionBackground
                settings={formSettings as SectionBackgroundSettings}
              />
              <div className="container mx-auto px-4 relative z-10">
                {renderStepHeader(formSettings)}
                <div className="max-w-2xl mx-auto">
                  <BookingForm
                    services={
                      selectedServices.length > 0
                        ? selectedServices
                        : totalService
                          ? [totalService]
                          : []
                    }
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
            className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 bg-transparent"
            style={{
              backgroundColor: confirmationSettings.bgColor || confirmationSettings.appearance?.backgroundColor,
            }}
          >
            <SectionBackground
              settings={confirmationSettings as SectionBackgroundSettings}
            />
            <div className="container mx-auto px-4 relative z-10">
              {renderStepHeader(confirmationSettings)}
              <div className="max-w-4xl mx-auto">
                <BookingConfirmation
                  booking={effectiveBooking}
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
