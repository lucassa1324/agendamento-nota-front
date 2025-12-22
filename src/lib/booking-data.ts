export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number; // em minutos
  price: number;
};

export type TimeSlot = {
  time: string;
  available: boolean;
};

export type BookingStatus =
  | "pendente"
  | "confirmado"
  | "cancelado"
  | "concluido";

export type Booking = {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  date: string;
  time: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: BookingStatus;
  createdAt: string;
  notificationsSent: {
    email: boolean;
    whatsapp: boolean;
  };
};

export type BusinessHours = {
  openTime: string; // ex: "09:00"
  lunchStart: string; // ex: "12:00"
  lunchEnd: string; // ex: "14:00"
  closeTime: string; // ex: "18:00"
};

export type DaySchedule = {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, etc.
  dayName: string;
  isOpen: boolean;
  openTime: string;
  lunchStart: string;
  lunchEnd: string;
  closeTime: string;
  interval: number;
};

export type WeekSchedule = DaySchedule[];

export type NotificationSettings = {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  adminEmail: string;
  adminPhone: string;
  reminderHoursBefore: number;
};

export type GoogleCalendarSettings = {
  enabled: boolean;
  calendarUrl: string;
  lastSync: string | null;
};

export type ScheduleSettings = {
  timeInterval: number; // intervalo em minutos (15, 30, 60)
  businessHours: BusinessHours;
};

export const services: Service[] = [
  {
    id: "design",
    name: "Design de Sobrancelhas",
    description: "Modelagem personalizada que valoriza seu formato de rosto",
    duration: 45,
    price: 80,
  },
  {
    id: "coloracao",
    name: "Coloração & Henna",
    description: "Técnicas de coloração para sobrancelhas mais definidas",
    duration: 60,
    price: 100,
  },
  {
    id: "micropigmentacao",
    name: "Micropigmentação Fio a Fio",
    description: "Resultado natural e duradouro com técnicas avançadas",
    duration: 180,
    price: 450,
  },
  {
    id: "laminacao",
    name: "Laminação de Sobrancelhas",
    description: "Fios alinhados e volumosos por até 8 semanas",
    duration: 90,
    price: 150,
  },
];

export const defaultScheduleSettings: ScheduleSettings = {
  timeInterval: 30,
  businessHours: {
    openTime: "09:00",
    lunchStart: "12:00",
    lunchEnd: "14:00",
    closeTime: "18:00",
  },
};

export const defaultWeekSchedule: WeekSchedule = [
  {
    dayOfWeek: 0,
    dayName: "Domingo",
    isOpen: false,
    openTime: "09:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    closeTime: "18:00",
    interval: 30,
  },
  {
    dayOfWeek: 1,
    dayName: "Segunda-feira",
    isOpen: true,
    openTime: "07:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    closeTime: "18:00",
    interval: 30,
  },
  {
    dayOfWeek: 2,
    dayName: "Terça-feira",
    isOpen: true,
    openTime: "07:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    closeTime: "18:00",
    interval: 30,
  },
  {
    dayOfWeek: 3,
    dayName: "Quarta-feira",
    isOpen: true,
    openTime: "07:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    closeTime: "18:00",
    interval: 30,
  },
  {
    dayOfWeek: 4,
    dayName: "Quinta-feira",
    isOpen: true,
    openTime: "07:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    closeTime: "18:00",
    interval: 30,
  },
  {
    dayOfWeek: 5,
    dayName: "Sexta-feira",
    isOpen: true,
    openTime: "07:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    closeTime: "18:00",
    interval: 30,
  },
  {
    dayOfWeek: 6,
    dayName: "Sábado",
    isOpen: true,
    openTime: "08:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    closeTime: "17:00",
    interval: 30,
  },
];

export const defaultNotificationSettings: NotificationSettings = {
  emailEnabled: true,
  whatsappEnabled: true,
  adminEmail: "studio@example.com",
  adminPhone: "5511999999999",
  reminderHoursBefore: 24,
};

export const defaultGoogleCalendarSettings: GoogleCalendarSettings = {
  enabled: false,
  calendarUrl: "",
  lastSync: null,
};

export function generateTimeSlotsForDate(date: string): string[] {
  const dateObj = new Date(`${date}T00:00:00`);
  const dayOfWeek = dateObj.getDay();
  const weekSchedule = getWeekSchedule();
  const daySchedule = weekSchedule.find((d) => d.dayOfWeek === dayOfWeek);

  if (!daySchedule || !daySchedule.isOpen) {
    return [];
  }

  const slots: string[] = [];
  const { openTime, lunchStart, lunchEnd, closeTime, interval } = daySchedule;

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const openMinutes = timeToMinutes(openTime);
  const lunchStartMinutes = timeToMinutes(lunchStart);
  const lunchEndMinutes = timeToMinutes(lunchEnd);
  const closeMinutes = timeToMinutes(closeTime);

  // Manhã
  for (let time = openMinutes; time < lunchStartMinutes; time += interval) {
    slots.push(minutesToTime(time));
  }

  // Tarde
  for (let time = lunchEndMinutes; time < closeMinutes; time += interval) {
    slots.push(minutesToTime(time));
  }

  return slots;
}

export function getAvailableTimeSlots(
  date: string,
  serviceDuration = 60,
): TimeSlot[] {
  const allSlots = generateTimeSlotsForDate(date);
  const bookings = getBookingsFromStorage();
  const dateObj = new Date(`${date}T00:00:00`);
  const dayOfWeek = dateObj.getDay();
  const weekSchedule = getWeekSchedule();
  const daySchedule = weekSchedule.find((d) => d.dayOfWeek === dayOfWeek);

  if (!daySchedule || !daySchedule.isOpen) {
    return [];
  }

  const dayBookings = bookings.filter(
    (b) => b.date === date && b.status !== "cancelado",
  );

  return allSlots.map((time) => {
    const available = isTimeSlotAvailable(
      time,
      serviceDuration,
      dayBookings,
      daySchedule,
    );
    return { time, available };
  });
}

function isTimeSlotAvailable(
  time: string,
  duration: number,
  bookings: Booking[],
  daySchedule: DaySchedule,
): boolean {
  const timeToMinutes = (t: string) => {
    const [hours, minutes] = t.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const startMinutes = timeToMinutes(time);
  const endMinutes = startMinutes + duration;

  // Verificar se não ultrapassa horário de fechamento
  const closeMinutes = timeToMinutes(daySchedule.closeTime);
  if (endMinutes > closeMinutes) return false;

  // Verificar se não conflita com horário de almoço
  const lunchStartMinutes = timeToMinutes(daySchedule.lunchStart);
  const lunchEndMinutes = timeToMinutes(daySchedule.lunchEnd);
  if (startMinutes < lunchEndMinutes && endMinutes > lunchStartMinutes)
    return false;

  // Verificar conflitos com outros agendamentos
  for (const booking of bookings) {
    const bookingStart = timeToMinutes(booking.time);
    const bookingEnd = bookingStart + booking.serviceDuration;

    if (startMinutes < bookingEnd && endMinutes > bookingStart) {
      return false;
    }
  }

  return true;
}

export function getBookingsFromStorage(): Booking[] {
  if (typeof window === "undefined") return [];
  const bookings = localStorage.getItem("bookings");
  return bookings ? JSON.parse(bookings) : [];
}

export function saveBookingToStorage(booking: Booking): void {
  const bookings = getBookingsFromStorage();
  bookings.push(booking);
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

export function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): void {
  const bookings = getBookingsFromStorage();
  const updated = bookings.map((b) =>
    b.id === bookingId ? { ...b, status } : b,
  );
  localStorage.setItem("bookings", JSON.stringify(updated));
}

export function markNotificationsSent(
  bookingId: string,
  type: "email" | "whatsapp",
): void {
  const bookings = getBookingsFromStorage();
  const updated = bookings.map((b) =>
    b.id === bookingId
      ? { ...b, notificationsSent: { ...b.notificationsSent, [type]: true } }
      : b,
  );
  localStorage.setItem("bookings", JSON.stringify(updated));
}

export function getSettingsFromStorage() {
  if (typeof window === "undefined")
    return {
      agendaAberta: true,
      services: services,
      scheduleSettings: defaultScheduleSettings,
    };
  const settings = localStorage.getItem("studioSettings");
  return settings
    ? JSON.parse(settings)
    : {
        agendaAberta: true,
        services: services,
        scheduleSettings: defaultScheduleSettings,
      };
}

export function getScheduleSettings(): ScheduleSettings {
  const settings = getSettingsFromStorage();
  return settings.scheduleSettings || defaultScheduleSettings;
}

export function getWeekSchedule(): WeekSchedule {
  if (typeof window === "undefined") return defaultWeekSchedule;
  const settings = localStorage.getItem("weekSchedule");
  return settings ? JSON.parse(settings) : defaultWeekSchedule;
}

export function saveWeekSchedule(schedule: WeekSchedule): void {
  localStorage.setItem("weekSchedule", JSON.stringify(schedule));
}

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return defaultNotificationSettings;
  const settings = localStorage.getItem("notificationSettings");
  return settings ? JSON.parse(settings) : defaultNotificationSettings;
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  localStorage.setItem("notificationSettings", JSON.stringify(settings));
}

export function getGoogleCalendarSettings(): GoogleCalendarSettings {
  if (typeof window === "undefined") return defaultGoogleCalendarSettings;
  const settings = localStorage.getItem("googleCalendarSettings");
  return settings ? JSON.parse(settings) : defaultGoogleCalendarSettings;
}

export function saveGoogleCalendarSettings(
  settings: GoogleCalendarSettings,
): void {
  localStorage.setItem("googleCalendarSettings", JSON.stringify(settings));
}

export async function sendBookingNotifications(
  booking: Booking,
): Promise<void> {
  const notificationSettings = getNotificationSettings();

  if (notificationSettings.emailEnabled) {
    await sendEmailNotification(booking, notificationSettings);
  }

  if (notificationSettings.whatsappEnabled) {
    await sendWhatsAppNotification(booking, notificationSettings);
  }
}

async function sendEmailNotification(
  booking: Booking,
  settings: NotificationSettings,
): Promise<void> {
  // Simulação de envio de email
  console.log("[v0] Enviando email para:", booking.clientEmail);
  console.log("[v0] Cópia para admin:", settings.adminEmail);
  // Em produção, integrar com serviço de email (SendGrid, Resend, etc.)
  markNotificationsSent(booking.id, "email");
}

async function sendWhatsAppNotification(
  booking: Booking,
  _settings: NotificationSettings,
): Promise<void> {
  // Simulação de envio de WhatsApp
  const message = `Olá ${booking.clientName}! Seu agendamento de ${booking.serviceName} foi confirmado para ${new Date(booking.date).toLocaleDateString("pt-BR")} às ${booking.time}. Estúdio de Sobrancelhas.`;
  console.log("[v0] Enviando WhatsApp para:", booking.clientPhone);
  console.log("[v0] Mensagem:", message);
  // Em produção, integrar com API do WhatsApp Business
  markNotificationsSent(booking.id, "whatsapp");
}
