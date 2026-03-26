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
  sanitizeColor,
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
  const [step1Styles, setStep1Styles] = useState<{
    background: string;
    cardBackground: string;
    accent: string;
    title: string;
    subtitle: string;
  } | null>(null);
  const [previewOverrides, setPreviewOverrides] = useState<
    Partial<Record<BookingStep, BookingStepSettings>>
  >({});

  // Debug visibility and state
  useEffect(() => {
    const pageVisibility = (studio?.config as Record<string, unknown>)?.pageVisibility as Record<string, boolean> || {};
    console.log(">>> [BOOKING_FLOW] Renderizando com:", {
      isLoading,
      hasStudio: !!studio,
      only,
      currentStep,
      selectedServicesCount: selectedServices.length,
      pageVisibility,
      agendarVisible: pageVisibility.agendar !== false
    });
  }, [isLoading, studio, only, currentStep, selectedServices.length]);

  const resolveStep1Styles = useCallback((styles?: Record<string, unknown>) => {
    const safeStyles = styles || {};
    return {
      background:
        sanitizeColor(
          (safeStyles.bgColor as string) ||
            (safeStyles.bg_color as string) ||
            (safeStyles.backgroundColor as string),
        ) || "transparent",
      cardBackground:
        sanitizeColor(
          (safeStyles.cardBgColor as string) ||
            (safeStyles.cardBackgroundColor as string) ||
            (safeStyles.card_bg_color as string),
        ) || "transparent",
      accent:
        sanitizeColor(
          (safeStyles.accentColor as string) ||
            (safeStyles.accent_color as string),
        ) || "#000000",
      title:
        sanitizeColor(
          (safeStyles.titleColor as string) ||
            (safeStyles.title_color as string),
        ) || "#000000",
      subtitle:
        sanitizeColor(
          (safeStyles.subtitleColor as string) ||
            (safeStyles.subtitle_color as string),
        ) || "#666666",
    };
  }, []);

  useEffect(() => {
    const config = studio?.config as SiteConfigData | undefined;
    const appointmentFlow = (config?.appointmentFlow ||
      config?.appointment_flow) as Record<string, unknown> | undefined;
    const step1Services =
      (appointmentFlow?.step1Services as Record<string, unknown>) ||
      (appointmentFlow?.step1_services as Record<string, unknown>) ||
      (appointmentFlow?.step1_service as Record<string, unknown>);
    if (step1Services) {
      setStep1Styles(resolveStep1Styles(step1Services));
    }
  }, [resolveStep1Styles, studio?.config]);

  // Force re-render on storage or specific events
  const [tick, setTick] = useState(0);
  const handleRefresh = useCallback(() => setTick((t) => t + 1), []);

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
    const siteCustomization = config?.siteCustomization || config?.site_customization;
    const layoutGlobal =
      siteCustomization?.layoutGlobal || siteCustomization?.layout_global;
    const siteColors = (layoutGlobal as Record<string, unknown>)?.siteColors as
      | Record<string, string>
      | undefined;
    
    const appointmentFlow = (config?.appointmentFlow || config?.appointment_flow) as Record<string, unknown> | undefined;
    const appointmentFlowColors = (appointmentFlow?.colors || appointmentFlow?.cores) as Record<string, string> | undefined;

    return {
      background:
        appointmentFlowColors?.background ||
        siteColors?.background ||
        ((layoutGlobal as Record<string, unknown>)?.background as string) ||
        config?.colors?.background ||
        defaultColorSettings.background,
      text:
        siteColors?.text ||
        config?.colors?.text ||
        defaultColorSettings.text,
    };
  }, [studio?.config]);

  const applyGlobalFallbacks = useCallback(
    (settings: BookingStepSettings) => {
      const appearance = settings.appearance || {};
      return {
        ...settings,
        bgColor: settings.bgColor || appearance.backgroundColor || globalColors.background,
        titleColor: settings.titleColor || appearance.titleColor || globalColors.text,
        subtitleColor:
          settings.subtitleColor || appearance.subtitleColor || globalColors.text,
        appearance: {
          ...appearance,
          backgroundColor:
            appearance.backgroundColor || settings.bgColor || globalColors.background,
          titleColor:
            appearance.titleColor || settings.titleColor || globalColors.text,
          subtitleColor:
            appearance.subtitleColor || settings.subtitleColor || globalColors.text,
        },
      };
    },
    [globalColors.background, globalColors.text],
  );

  const normalizeBookingStep = useCallback(
    (
      stepKey: "service" | "date" | "time" | "form" | "confirmation",
      defaults: BookingStepSettings,
    ) => {
      const config = studio?.config as SiteConfigData | undefined;
      const appointmentFlow = (config?.appointmentFlow ||
        config?.appointment_flow) as Record<string, unknown> | undefined;
      const step1Services =
        (appointmentFlow?.step1Services as Record<string, unknown>) ||
        (appointmentFlow?.step1_services as Record<string, unknown>) ||
        (appointmentFlow?.step1_service as Record<string, unknown>);
      const step1CardConfig =
        (step1Services?.cardConfig as Record<string, unknown>) ||
        (step1Services?.card_config as Record<string, unknown>);
      const cardBgFromFlow = sanitizeColor(
        (step1CardConfig?.backgroundColor as string) ||
          (step1CardConfig?.cardBackgroundColor as string) ||
          (step1CardConfig?.background_color as string) ||
          (step1CardConfig?.card_background_color as string),
      );

      const appointmentFlowSteps = (config?.appointmentFlow as {
        steps?: Partial<Record<BookingStep, BookingStepSettings>>;
      } | undefined)?.steps;
      const appointmentFlowSnakeSteps = (config?.appointment_flow as {
        steps?: Partial<Record<BookingStep, BookingStepSettings>>;
      } | undefined)?.steps;

      const stepConfig =
        (stepKey === "service" ? step1Services : undefined) ||
        config?.bookingSteps?.[stepKey] ||
        appointmentFlowSteps?.[stepKey] ||
        appointmentFlowSnakeSteps?.[stepKey] ||
        (config?.appointmentFlow as Partial<
          Record<BookingStep, BookingStepSettings>
        > | undefined)?.[stepKey] ||
        (config?.appointment_flow as Partial<
          Record<BookingStep, BookingStepSettings>
        > | undefined)?.[stepKey];

      let base = { ...defaults };
      if (stepConfig) {
        const step = stepConfig as BookingStepSettings;
        base = {
          ...base,
          ...step,
          appearance: {
            ...(base.appearance || {}),
            ...(step.appearance || {}),
          },
        };
      }
      return {
        ...base,
        titleColor:
          sanitizeColor(
            base.titleColor ||
              base.appearance?.titleColor ||
              defaults.titleColor,
          ) || "",
        subtitleColor:
          sanitizeColor(
            base.subtitleColor ||
              base.appearance?.subtitleColor ||
              defaults.subtitleColor,
          ) || "",
        titleFont:
          base.titleFont || base.appearance?.titleFont || defaults.titleFont,
        subtitleFont:
          base.subtitleFont ||
          base.appearance?.subtitleFont ||
          defaults.subtitleFont,
        cardBgColor:
          sanitizeColor(
            (stepKey === "service" ? cardBgFromFlow : undefined) ||
              base.cardBgColor ||
              base.appearance?.cardBgColor ||
              defaults.cardBgColor,
          ) || (stepKey === "service" ? "#ffffff" : ""),
        accentColor:
          sanitizeColor(
            base.accentColor ||
              base.appearance?.accentColor ||
              defaults.accentColor,
          ) || "",
        bgColor:
          sanitizeColor(
            base.bgColor ||
              base.appearance?.backgroundColor ||
              defaults.bgColor,
          ) || "",
      };
    },
    [studio?.config],
  );

  const serviceSettings = useMemo(() => {
    void tick;
    const base = studio?.config
      ? normalizeBookingStep("service", defaultBookingServiceSettings)
      : getBookingServiceSettings(studio?.config);
    const override = previewOverrides.service;
    const merged = override
      ? {
          ...base,
          ...override,
          appearance: {
            ...(base.appearance || {}),
            ...(override.appearance || {}),
          },
        }
      : base;
    return applyGlobalFallbacks(merged);
  }, [
    studio?.config,
    tick,
    applyGlobalFallbacks,
    normalizeBookingStep,
    previewOverrides.service,
  ]);

  const effectiveServiceSettings = useMemo(() => {
    if (!step1Styles) return serviceSettings;
    return {
      ...serviceSettings,
      bgColor:
        sanitizeColor(step1Styles.background) || serviceSettings.bgColor,
      cardBgColor:
        sanitizeColor(step1Styles.cardBackground) ||
        serviceSettings.cardBgColor,
      accentColor:
        sanitizeColor(step1Styles.accent) || serviceSettings.accentColor,
      titleColor:
        sanitizeColor(step1Styles.title) || serviceSettings.titleColor,
      subtitleColor:
        sanitizeColor(step1Styles.subtitle) || serviceSettings.subtitleColor,
    };
  }, [serviceSettings, step1Styles]);

  const dateSettings = useMemo(() => {
    void tick;
    const base = studio?.config
      ? normalizeBookingStep("date", defaultBookingDateSettings)
      : getBookingDateSettings(studio?.config);
    const override = previewOverrides.date;
    const merged = override
      ? {
          ...base,
          ...override,
          appearance: {
            ...(base.appearance || {}),
            ...(override.appearance || {}),
          },
        }
      : base;
    return applyGlobalFallbacks(merged);
  }, [
    studio?.config,
    tick,
    applyGlobalFallbacks,
    normalizeBookingStep,
    previewOverrides.date,
  ]);

  const timeSettings = useMemo(() => {
    void tick;
    const base = studio?.config
      ? normalizeBookingStep("time", defaultBookingTimeSettings)
      : getBookingTimeSettings(studio?.config);
    const override = previewOverrides.time;
    const merged = override
      ? {
          ...base,
          ...override,
          appearance: {
            ...(base.appearance || {}),
            ...(override.appearance || {}),
          },
        }
      : base;
    if (studio?.config?.interval || studio?.config?.slotInterval) {
      merged.interval = studio.config.interval || studio.config.slotInterval;
    }
    return applyGlobalFallbacks(merged);
  }, [
    studio?.config,
    tick,
    applyGlobalFallbacks,
    normalizeBookingStep,
    previewOverrides.time,
  ]);

  const formSettings = useMemo(() => {
    void tick;
    const base = studio?.config
      ? normalizeBookingStep("form", defaultBookingFormSettings)
      : getBookingFormSettings(studio?.config);
    const override = previewOverrides.form;
    const merged = override
      ? {
          ...base,
          ...override,
          appearance: {
            ...(base.appearance || {}),
            ...(override.appearance || {}),
          },
        }
      : base;
    return applyGlobalFallbacks(merged);
  }, [
    studio?.config,
    tick,
    applyGlobalFallbacks,
    normalizeBookingStep,
    previewOverrides.form,
  ]);

  const confirmationSettings = useMemo(() => {
    void tick;
    const base = studio?.config
      ? normalizeBookingStep("confirmation", defaultBookingConfirmationSettings)
      : getBookingConfirmationSettings(studio?.config);
    const override = previewOverrides.confirmation;
    const merged = override
      ? {
          ...base,
          ...override,
          appearance: {
            ...(base.appearance || {}),
            ...(override.appearance || {}),
          },
        }
      : base;
    return applyGlobalFallbacks(merged);
  }, [
    studio?.config,
    tick,
    applyGlobalFallbacks,
    normalizeBookingStep,
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
    window.addEventListener("storage", handleRefresh);
    window.addEventListener("bookingServiceSettingsUpdated", handleRefresh);
    window.addEventListener("bookingDateSettingsUpdated", handleRefresh);
    window.addEventListener("bookingTimeSettingsUpdated", handleRefresh);
    window.addEventListener("bookingFormSettingsUpdated", handleRefresh);
    window.addEventListener(
      "bookingConfirmationSettingsUpdated",
      handleRefresh,
    );

    return () => {
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener("bookingServiceSettingsUpdated", handleRefresh);
      window.removeEventListener("bookingDateSettingsUpdated", handleRefresh);
      window.removeEventListener("bookingTimeSettingsUpdated", handleRefresh);
      window.removeEventListener("bookingFormSettingsUpdated", handleRefresh);
      window.removeEventListener(
        "bookingConfirmationSettingsUpdated",
        handleRefresh,
      );
    };
  }, [handleRefresh]);

  // Listen for real-time updates from editor
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("[IFRAME_RECEIVER] Mensagem recebida:", event.data);
      if (event.data?.type === "UPDATE_BOOKING_SERVICE_SETTINGS") {
        const settings = event.data.settings as Record<string, unknown> | undefined;
        if (settings) {
          setPreviewOverrides((prev) => {
            const mergedService: BookingStepSettings = {
              ...defaultBookingServiceSettings,
              ...(prev.service || {}),
              ...(settings as Partial<BookingStepSettings>),
              appearance: {
                ...(defaultBookingServiceSettings.appearance || {}),
                ...((prev.service?.appearance || {}) as BookingStepSettings["appearance"]),
                ...((settings.appearance as BookingStepSettings["appearance"]) || {}),
              },
            };
            return {
              ...prev,
              service: mergedService,
            };
          });
        }
        handleRefresh();
      }
      if (event.data?.type === "UPDATE_BOOKING_STYLE") {
        const payload = event.data?.payload as
          | { section?: string; styles?: Record<string, unknown> }
          | undefined;
        if (payload?.section === "step1Services" && payload.styles) {
          setStep1Styles((prev) => ({
            ...(prev || {
              background: "transparent",
              cardBackground: "transparent",
              accent: "#000000",
              title: "#000000",
              subtitle: "#666666",
            }),
            ...resolveStep1Styles(payload.styles),
          }));
        }
        handleRefresh();
      }
      if (event.data?.type === "UPDATE_BOOKING_DATE_SETTINGS") {
        const settings = event.data.settings as Record<string, unknown> | undefined;
        if (settings) {
          const normalized = normalizeStepSettings(settings);
          setPreviewOverrides((prev) => ({
            ...prev,
            date: {
              ...(prev.date || {}),
              ...normalized,
              appearance: {
                ...(prev.date?.appearance || {}),
                ...(normalized.appearance || {}),
              },
            },
          }));
        }
        handleRefresh();
      }
      if (event.data?.type === "UPDATE_BOOKING_TIME_SETTINGS") {
        const settings = event.data.settings as Record<string, unknown> | undefined;
        if (settings) {
          const normalized = normalizeStepSettings(settings);
          setPreviewOverrides((prev) => ({
            ...prev,
            time: {
              ...(prev.time || {}),
              ...normalized,
              appearance: {
                ...(prev.time?.appearance || {}),
                ...(normalized.appearance || {}),
              },
            },
          }));
        }
        handleRefresh();
      }
      if (event.data?.type === "UPDATE_BOOKING_FORM_SETTINGS") {
        const settings = event.data.settings as Record<string, unknown> | undefined;
        if (settings) {
          const normalized = normalizeStepSettings(settings);
          setPreviewOverrides((prev) => ({
            ...prev,
            form: {
              ...(prev.form || {}),
              ...normalized,
              appearance: {
                ...(prev.form?.appearance || {}),
                ...(normalized.appearance || {}),
              },
            },
          }));
        }
        handleRefresh();
      }
      if (event.data?.type === "UPDATE_BOOKING_CONFIRMATION_SETTINGS") {
        const settings = event.data.settings as Record<string, unknown> | undefined;
        if (settings) {
          const normalized = normalizeStepSettings(settings);
          setPreviewOverrides((prev) => ({
            ...prev,
            confirmation: {
              ...(prev.confirmation || {}),
              ...normalized,
              appearance: {
                ...(prev.confirmation?.appearance || {}),
                ...(normalized.appearance || {}),
              },
            },
          }));
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
    window.addEventListener(
      "bookingServiceSettingsUpdated",
      handleRefresh,
    );
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
      window.removeEventListener(
        "bookingDateSettingsUpdated",
        handleRefresh,
      );
      window.removeEventListener(
        "bookingTimeSettingsUpdated",
        handleRefresh,
      );
      window.removeEventListener(
        "bookingFormSettingsUpdated",
        handleRefresh,
      );
      window.removeEventListener(
        "bookingConfirmationSettingsUpdated",
        handleRefresh,
      );
    };
  }, [handleRefresh, resolveStep1Styles]);

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
          console.warn(`>>> [CONSISTENCY] bgColor/backgroundColor ausente em ${step.name}`);
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
    const titleColor = settings.titleColor || appearance.titleColor || "var(--foreground)";
    const subtitleColor = settings.subtitleColor || appearance.subtitleColor || "var(--muted-foreground)";
    const titleFont = settings.titleFont || appearance.titleFont || "var(--font-title)";
    const subtitleFont = settings.subtitleFont || appearance.subtitleFont || "var(--font-body)";

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

  const flowAccent = effectiveServiceSettings?.accentColor || "var(--primary)";
  const flowCardBg = effectiveServiceSettings?.cardBgColor || "transparent";
  const showServiceSectionBackground = !(
    effectiveServiceSettings?.bgType === "color" &&
    effectiveServiceSettings?.bgColor
  );

  return (
    <div
      id="booking"
      key={step1Styles?.background || effectiveServiceSettings?.bgColor || "booking"}
      className="min-h-screen w-full mx-auto transition-colors duration-300"
      style={{
        backgroundColor:
          step1Styles?.background ||
          effectiveServiceSettings?.bgColor ||
          "transparent",
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
          >
            {showServiceSectionBackground && (
              <SectionBackground
                settings={effectiveServiceSettings as SectionBackgroundSettings}
              />
            )}
            <div className="container mx-auto px-4 relative z-10">
              {renderStepHeader(effectiveServiceSettings)}
              <div className="max-w-4xl mx-auto">
                <ServiceSelector
                  onSelect={handleServiceSelect}
                  onConfirm={handleServiceConfirm}
                  selectedServices={selectedServices}
                  settings={effectiveServiceSettings}
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
            <SectionBackground settings={dateSettings as SectionBackgroundSettings} />
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
            <SectionBackground settings={timeSettings as SectionBackgroundSettings} />
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
              className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
            >
              <SectionBackground settings={formSettings as SectionBackgroundSettings} />
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
            className="relative py-12 md:py-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
          >
            <SectionBackground settings={confirmationSettings as SectionBackgroundSettings} />
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
