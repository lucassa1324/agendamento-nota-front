export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number; // em minutos
  price: number;
  showOnHome?: boolean;
  icon?: string;
  conflictGroupId?: string;
  conflictingServiceIds?: string[];
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
  serviceId: string | string[];
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

export type BlockedPeriod = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // opcional, se for o dia todo
  endTime?: string; // opcional
  reason?: string;
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

export type SiteProfile = {
  name: string;
  description: string;
  logoUrl?: string;
  instagram?: string;
  whatsapp?: string;
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  x?: string;
  phone?: string;
  email?: string;
  address?: string;
  showInstagram: boolean;
  showWhatsapp: boolean;
  showFacebook: boolean;
  showTiktok: boolean;
  showLinkedin: boolean;
  showX: boolean;
};

export type HeaderSettings = {
  bgColor: string;
  opacity: number;
  textColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  blurAmount: number; // para o efeito glassmorphism
};

export type FooterSettings = {
  bgColor: string;
  textColor: string;
  titleColor: string;
  iconColor: string;
  titleFont: string;
  bodyFont: string;
};

export const defaultHeaderSettings: HeaderSettings = {
  bgColor: "#ffffff",
  opacity: 0.8,
  textColor: "",
  buttonBgColor: "",
  buttonTextColor: "",
  blurAmount: 8,
};

export const defaultFooterSettings: FooterSettings = {
  bgColor: "", // vindo de secondary/30 por padrão no componente
  textColor: "", // text-muted-foreground
  titleColor: "", // text-primary
  iconColor: "", // text-accent
  titleFont: "Playfair Display",
  bodyFont: "Inter",
};

export type HeroSettings = {
  badge: string;
  showBadge: boolean;
  badgeIcon: string;
  badgeColor: string;
  badgeTextColor: string;
  title: string;
  subtitle: string;
  primaryButton: string;
  secondaryButton: string;
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
  titleFont: string;
  subtitleFont: string;
  badgeFont: string;
  primaryButtonColor: string;
  secondaryButtonColor: string;
  primaryButtonTextColor: string;
  secondaryButtonTextColor: string;
  titleColor: string;
  subtitleColor: string;
  primaryButtonFont: string;
  secondaryButtonFont: string;
};

export type StorySettings = {
  title: string;
  titleColor: string;
  content: string;
  contentColor: string;
  image: string;
};

export type ValueItem = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

export type ValuesSettings = {
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  titleFont: string;
  subtitleFont: string;
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
  // Card specific styles
  cardBgColor: string;
  cardTitleColor: string;
  cardDescriptionColor: string;
  cardIconColor: string;
  cardTitleFont: string;
  cardDescriptionFont: string;
  items: ValueItem[];
};

export type ServicesSettings = {
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  titleFont: string;
  subtitleFont: string;
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
  // Card specific styles
  cardBgColor: string;
  cardTitleColor: string;
  cardDescriptionColor: string;
  cardPriceColor: string;
  cardIconColor: string;
  cardTitleFont: string;
  cardDescriptionFont: string;
  cardPriceFont: string;
};

export const defaultServicesSettings: ServicesSettings = {
  title: "Nossos Serviços",
  subtitle: "Tratamentos especializados para realçar seu olhar",
  titleColor: "",
  subtitleColor: "",
  titleFont: "Playfair Display",
  subtitleFont: "Inter",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.5,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  cardBgColor: "",
  cardTitleColor: "",
  cardDescriptionColor: "",
  cardPriceColor: "",
  cardIconColor: "",
  cardTitleFont: "Playfair Display",
  cardDescriptionFont: "Inter",
  cardPriceFont: "Inter",
};

export const defaultStorySettings: StorySettings = {
  title: "Nossa História",
  titleColor: "",
  content:
    "O Brow Studio nasceu da paixão por realçar a beleza natural de cada pessoa através do design de sobrancelhas. Com mais de 10 anos de experiência no mercado, nos especializamos em técnicas avançadas que valorizam a individualidade de cada cliente.\n\nNossa missão é proporcionar não apenas um serviço de qualidade, mas uma experiência transformadora. Acreditamos que sobrancelhas bem feitas têm o poder de elevar a autoestima e destacar a beleza única de cada pessoa.\n\nInvestimos constantemente em capacitação e nas melhores técnicas do mercado para garantir resultados excepcionais e a satisfação total de nossas clientes.",
  contentColor: "",
  image: "/professional-eyebrow-artist-at-work.jpg",
};

export const defaultValuesSettings: ValuesSettings = {
  title: "Nossos Valores",
  subtitle:
    "Os princípios que guiam nosso trabalho e relacionamento com cada cliente",
  titleColor: "",
  subtitleColor: "",
  titleFont: "Playfair Display",
  subtitleFont: "Inter",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.5,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  cardBgColor: "",
  cardTitleColor: "",
  cardDescriptionColor: "",
  cardIconColor: "",
  cardTitleFont: "Playfair Display",
  cardDescriptionFont: "Inter",
  items: [
    {
      id: "1",
      icon: "Heart",
      title: "Paixão pelo que Fazemos",
      description:
        "Cada atendimento é realizado com dedicação e amor pela arte de realçar a beleza natural.",
    },
    {
      id: "2",
      icon: "Award",
      title: "Excelência e Qualidade",
      description:
        "Utilizamos apenas produtos de alta qualidade e técnicas comprovadas para resultados perfeitos.",
    },
    {
      id: "3",
      icon: "Users",
      title: "Atendimento Personalizado",
      description:
        "Cada cliente é única e merece um design exclusivo que valorize suas características.",
    },
    {
      id: "4",
      icon: "Sparkles",
      title: "Inovação Constante",
      description:
        "Sempre atualizadas com as últimas tendências e técnicas do mercado de beleza.",
    },
  ],
};

export type GallerySettings = {
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  titleFont: string;
  subtitleFont: string;
  layout: "grid" | "carousel";
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
};

export const defaultGallerySettings: GallerySettings = {
  title: "Nossos Trabalhos",
  subtitle: "Veja alguns dos resultados incríveis que alcançamos com nossas clientes",
  titleColor: "",
  subtitleColor: "",
  titleFont: "Playfair Display",
  subtitleFont: "Inter",
  layout: "grid",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.5,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
};

export type CTASettings = {
  title: string;
  subtitle: string;
  buttonText: string;
  titleColor: string;
  subtitleColor: string;
  buttonColor: string;
  buttonTextColor: string;
  titleFont: string;
  subtitleFont: string;
  buttonFont: string;
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  description: string;
};

export type TeamSettings = {
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  titleFont: string;
  subtitleFont: string;
  cardBgColor: string;
  cardTitleColor: string;
  cardRoleColor: string;
  cardDescriptionColor: string;
  members: TeamMember[];
};

export type Testimonial = {
  id: string;
  name: string;
  text: string;
  rating: number;
};

export type TestimonialsSettings = {
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  titleFont: string;
  subtitleFont: string;
  cardBgColor: string;
  cardNameColor: string;
  cardTextColor: string;
  testimonials: Testimonial[];
};

export const defaultCTASettings: CTASettings = {
  title: "Pronta Para Transformar Seu Olhar?",
  subtitle: "Agende seu horário agora e descubra como sobrancelhas bem feitas podem realçar toda sua beleza",
  buttonText: "Agendar Agora",
  titleColor: "",
  subtitleColor: "",
  buttonColor: "",
  buttonTextColor: "",
  titleFont: "Playfair Display",
  subtitleFont: "Inter",
  buttonFont: "Inter",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.1,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
};

export const defaultTeamSettings: TeamSettings = {
  title: "Nossa Equipe",
  subtitle: "Conheça as profissionais especialistas que cuidarão do seu olhar",
  titleColor: "",
  subtitleColor: "",
  titleFont: "Playfair Display",
  subtitleFont: "Inter",
  cardBgColor: "",
  cardTitleColor: "",
  cardRoleColor: "",
  cardDescriptionColor: "",
  members: [
    {
      id: "1",
      name: "Ana Silva",
      role: "Master Designer",
      image: "/professional-eyebrow-artist-at-work.jpg",
      description: "Especialista em micropigmentação e design personalizado com mais de 8 anos de experiência.",
    },
    {
      id: "2",
      name: "Beatriz Costa",
      role: "Designer & Lash Artist",
      image: "/professional-eyebrow-artist-at-work.jpg",
      description: "Especialista em lash lifting e design de sobrancelhas com foco em naturalidade.",
    },
  ],
};

export const defaultTestimonialsSettings: TestimonialsSettings = {
  title: "O Que Dizem Nossas Clientes",
  subtitle: "A satisfação de nossas clientes é nossa maior conquista",
  titleColor: "",
  subtitleColor: "",
  titleFont: "Playfair Display",
  subtitleFont: "Inter",
  cardBgColor: "",
  cardNameColor: "",
  cardTextColor: "",
  testimonials: [
    {
      id: "1",
      name: "Maria Oliveira",
      text: "Simplesmente perfeito! A Ana entendeu exatamente o que eu queria e o resultado ficou incrível.",
      rating: 5,
    },
    {
      id: "2",
      name: "Fernanda Lima",
      text: "Profissionais extremamente capacitadas e atenciosas. O ambiente é acolhedor e o resultado superou minhas expectativas.",
      rating: 5,
    },
  ],
};

export type FontSettings = {
  headingFont: string;
  bodyFont: string;
};

export const services: Service[] = [
  {
    id: "design",
    name: "Design de Sobrancelhas",
    description: "Modelagem personalizada que valoriza seu formato de rosto",
    duration: 45,
    price: 80,
    showOnHome: true,
  },
  {
    id: "coloracao",
    name: "Coloração & Henna",
    description: "Técnicas de coloração para sobrancelhas mais definidas",
    duration: 60,
    price: 100,
    showOnHome: true,
  },
  {
    id: "micropigmentacao",
    name: "Micropigmentação Fio a Fio",
    description: "Resultado natural e duradouro com técnicas avançadas",
    duration: 180,
    price: 450,
    showOnHome: true,
  },
  {
    id: "laminacao",
    name: "Laminação de Sobrancelhas",
    description: "Fios alinhados e volumosos por até 8 semanas",
    duration: 90,
    price: 150,
    showOnHome: true,
  },
  {
    id: "lash-lifting-90",
    name: "Lash Lifting Completo",
    description: "Tratamento completo de lifting de cílios com duração de 90 minutos",
    duration: 90,
    price: 180,
    showOnHome: true,
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

export const defaultSiteProfile: SiteProfile = {
  name: "Brow Studio",
  description:
    "Especialistas em design de sobrancelhas, dedicados a realçar sua beleza natural.",
  logoUrl: "",
  instagram: "browstudio",
  whatsapp: "5511999999999",
  facebook: "browstudio",
  tiktok: "",
  linkedin: "",
  x: "",
  phone: "(11) 99999-9999",
  email: "contato@browstudio.com",
  address: "São Paulo, SP",
  showInstagram: true,
  showWhatsapp: true,
  showFacebook: true,
  showTiktok: false,
  showLinkedin: false,
  showX: false,
};

export const defaultHeroSettings: HeroSettings = {
  badge: "Especialistas em Design de Sobrancelhas",
  showBadge: true,
  badgeIcon: "Sparkles",
  badgeColor: "",
  badgeTextColor: "",
  title: "Realce Sua Beleza Natural",
  subtitle:
    "Especialistas em design de sobrancelhas, dedicados a realçar sua beleza natural.",
  primaryButton: "Agendar Horário",
  secondaryButton: "Ver Trabalhos",
  bgType: "image",
  bgColor: "#ffffff",
  bgImage: "",
  imageOpacity: 0.2,
  overlayOpacity: 0.8,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  titleFont: "Playfair Display",
  subtitleFont: "Inter",
  badgeFont: "Inter",
  primaryButtonColor: "",
  secondaryButtonColor: "",
  primaryButtonTextColor: "",
  secondaryButtonTextColor: "",
  titleColor: "",
  subtitleColor: "",
  primaryButtonFont: "Inter",
  secondaryButtonFont: "Inter",
};

export const defaultFontSettings: FontSettings = {
  headingFont: "Playfair Display",
  bodyFont: "Inter",
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
  const blockedPeriods = getBlockedPeriods();
  const dateObj = new Date(`${date}T00:00:00`);
  const dayOfWeek = dateObj.getDay();
  const weekSchedule = getWeekSchedule();
  const daySchedule = weekSchedule.find((d) => d.dayOfWeek === dayOfWeek);

  if (!daySchedule || !daySchedule.isOpen) {
    return [];
  }

  // Filtrar bloqueios para este dia específico
  const dayBlocks = blockedPeriods.filter((b) => b.date === date);

  const dayBookings = bookings.filter(
    (b: Booking) => b.date === date && b.status !== "cancelado",
  );

  return allSlots.map((time) => {
    const available = isTimeSlotAvailable(
      time,
      serviceDuration,
      dayBookings,
      daySchedule,
      dayBlocks,
    );
    return { time, available };
  });
}

function isTimeSlotAvailable(
  time: string,
  duration: number,
  bookings: Booking[],
  daySchedule: DaySchedule,
  dayBlocks: BlockedPeriod[] = [],
): boolean {
  const timeToMinutes = (t: string) => {
    const [hours, minutes] = t.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const startMinutes = timeToMinutes(time);
  const endMinutes = startMinutes + duration;

  // 1. Verificar se o dia todo está bloqueado
  const fullDayBlock = dayBlocks.find((b) => !b.startTime && !b.endTime);
  if (fullDayBlock) return false;

  // 2. Verificar bloqueios de horário parcial
  for (const block of dayBlocks) {
    if (block.startTime && block.endTime) {
      const blockStart = timeToMinutes(block.startTime);
      const blockEnd = timeToMinutes(block.endTime);

      // Verificação rigorosa de interseção:
      // Um slot está indisponível se o seu início ocorre antes do fim do bloqueio
      // E o seu fim (início + duração do serviço) ocorre depois do início do bloqueio
      if (startMinutes < blockEnd && endMinutes > blockStart) {
        return false;
      }
    }
  }

  // 3. Verificar se não ultrapassa horário de fechamento
  const closeMinutes = timeToMinutes(daySchedule.closeTime);
  if (endMinutes > closeMinutes) return false;

  // 4. Verificar se não conflita com horário de almoço
  const lunchStartMinutes = timeToMinutes(daySchedule.lunchStart);
  const lunchEndMinutes = timeToMinutes(daySchedule.lunchEnd);
  if (startMinutes < lunchEndMinutes && endMinutes > lunchStartMinutes)
    return false;

  // 5. Verificar conflitos com outros agendamentos
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

export function updateBooking(updatedBooking: Booking): void {
  const bookings = getBookingsFromStorage();
  const updated = bookings.map((b) =>
    b.id === updatedBooking.id ? updatedBooking : b,
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

export type GalleryImage = {
  id: string;
  url: string;
  title: string;
  category: string;
  createdAt: string;
  showOnHome: boolean;
};

export function getGalleryImages(): GalleryImage[] {
  if (typeof window === "undefined") return [];
  const images = localStorage.getItem("galleryImages");
  return images ? JSON.parse(images) : [];
}

export function saveGalleryImages(images: GalleryImage[]): void {
  localStorage.setItem("galleryImages", JSON.stringify(images));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("galleryUpdated"));
  }
}

export function getBlockedPeriods(): BlockedPeriod[] {
  if (typeof window === "undefined") return [];
  const blocked = localStorage.getItem("blockedPeriods");
  return blocked ? JSON.parse(blocked) : [];
}

export function getServices(): Service[] {
  const settings = getSettingsFromStorage();
  return settings.services && settings.services.length > 0 
    ? settings.services 
    : services;
}

export function saveServices(newServices: Service[]): void {
  const settings = getSettingsFromStorage();
  settings.services = newServices;
  localStorage.setItem("studioSettings", JSON.stringify(settings));
  localStorage.setItem("services", JSON.stringify(newServices));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("studioSettingsUpdated"));
    window.dispatchEvent(new Event("servicesUpdated"));
  }
}

export function saveBlockedPeriods(blocked: BlockedPeriod[]): void {
  localStorage.setItem("blockedPeriods", JSON.stringify(blocked));
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

export function getSiteProfile(): SiteProfile {
  if (typeof window === "undefined") return defaultSiteProfile;
  const profile = localStorage.getItem("siteProfile");
  return profile
    ? { ...defaultSiteProfile, ...JSON.parse(profile) }
    : defaultSiteProfile;
}

export function saveSiteProfile(profile: SiteProfile): void {
  localStorage.setItem("siteProfile", JSON.stringify(profile));
  // Dispatch custom event so components can update immediately
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("siteProfileUpdated"));
  }
}

export function getHeroSettings(): HeroSettings {
  if (typeof window === "undefined") return defaultHeroSettings;
  const settings = localStorage.getItem("heroSettings");
  return settings ? JSON.parse(settings) : defaultHeroSettings;
}

export function saveHeroSettings(settings: HeroSettings): void {
  localStorage.setItem("heroSettings", JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("heroSettingsUpdated"));
  }
}

export function getStorySettings(): StorySettings {
  if (typeof window === "undefined") return defaultStorySettings;
  const settings = localStorage.getItem("storySettings");
  return settings ? JSON.parse(settings) : defaultStorySettings;
}

export function saveStorySettings(settings: StorySettings): void {
  localStorage.setItem("storySettings", JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storySettingsUpdated"));
  }
}

export function getValuesSettings(): ValuesSettings {
  if (typeof window === "undefined") return defaultValuesSettings;
  const settings = localStorage.getItem("valuesSettings");
  return settings ? JSON.parse(settings) : defaultValuesSettings;
}

export function saveValuesSettings(settings: ValuesSettings): void {
  localStorage.setItem("valuesSettings", JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("valuesSettingsUpdated"));
  }
}

export function getServicesSettings(): ServicesSettings {
  if (typeof window === "undefined") return defaultServicesSettings;
  const settings = localStorage.getItem("servicesSettings");
  return settings ? JSON.parse(settings) : defaultServicesSettings;
}

export function saveServicesSettings(settings: ServicesSettings): void {
  localStorage.setItem("servicesSettings", JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("servicesSettingsUpdated"));
  }
}

export function getFontSettings(): FontSettings {
  if (typeof window === "undefined") return defaultFontSettings;
  const settings = localStorage.getItem("fontSettings");
  return settings ? JSON.parse(settings) : defaultFontSettings;
}

export function saveFontSettings(settings: FontSettings): void {
  localStorage.setItem("fontSettings", JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("fontSettingsUpdated"));
  }
}

export function getGallerySettings(): GallerySettings {
  if (typeof window === "undefined") return defaultGallerySettings;
  const settings = localStorage.getItem("gallerySettings");
  return settings ? JSON.parse(settings) : defaultGallerySettings;
}

export function saveGallerySettings(settings: GallerySettings): void {
  localStorage.setItem("gallerySettings", JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("gallerySettingsUpdated"));
  }
}

export function getCTASettings(): CTASettings {
  if (typeof window === "undefined") return defaultCTASettings;
  const settings = localStorage.getItem("ctaSettings");
  return settings ? JSON.parse(settings) : defaultCTASettings;
}

export function saveCTASettings(settings: CTASettings): void {
  localStorage.setItem("ctaSettings", JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ctaSettingsUpdated"));
  }
}

export function getHeaderSettings(): HeaderSettings {
  if (typeof window === "undefined") return defaultHeaderSettings;
  const settings = localStorage.getItem("headerSettings");
  return settings ? JSON.parse(settings) : defaultHeaderSettings;
}

export function saveHeaderSettings(settings: HeaderSettings): void {
  localStorage.setItem("headerSettings", JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("headerSettingsUpdated"));
  }
}

export function getFooterSettings(): FooterSettings {
  if (typeof window === "undefined") return defaultFooterSettings;
  const settings = localStorage.getItem("footerSettings");
  return settings ? JSON.parse(settings) : defaultFooterSettings;
}

export function saveFooterSettings(settings: FooterSettings): void {
  localStorage.setItem("footerSettings", JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("footerSettingsUpdated"));
  }
}

export function getPageVisibility(): Record<string, boolean> {
  if (typeof window === "undefined") {
    return {
      inicio: true,
      galeria: true,
      sobre: true,
      agendar: true,
    };
  }
  const visibility = localStorage.getItem("pageVisibility");
  if (visibility) return JSON.parse(visibility);

  return {
    inicio: true,
    galeria: true,
    sobre: true,
    agendar: true,
  };
}

export function savePageVisibility(visibility: Record<string, boolean>): void {
  localStorage.setItem("pageVisibility", JSON.stringify(visibility));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("pageVisibilityUpdated"));
  }
}

export function getVisibleSections(): Record<string, boolean> {
  if (typeof window === "undefined") {
    return {
      header: true,
      footer: true,
      hero: true,
      story: true,
      services: true,
      values: true,
      "gallery-preview": true,
      cta: true,
      "gallery-grid": true,
      "about-hero": true,
      booking: true,
    };
  }
  const sections = localStorage.getItem("visibleSections");
  if (sections) return JSON.parse(sections);

  return {
    header: true,
    footer: true,
    hero: true,
    story: true,
    services: true,
    values: true,
    "gallery-preview": true,
    cta: true,
    "gallery-grid": true,
    "about-hero": true,
    booking: true,
  };
}

export function saveVisibleSections(sections: Record<string, boolean>): void {
  localStorage.setItem("visibleSections", JSON.stringify(sections));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("visibleSectionsUpdated"));
  }
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
  _settings: NotificationSettings,
): Promise<void> {
  // Simulação de envio de email
  // console.log("[v0] Enviando email para:", booking.clientEmail);
  // console.log("[v0] Cópia para admin:", settings.adminEmail);
  // Em produção, integrar com serviço de email (SendGrid, Resend, etc.)
  markNotificationsSent(booking.id, "email");
}

async function sendWhatsAppNotification(
  booking: Booking,
  _settings: NotificationSettings,
): Promise<void> {
  // Simulação de envio de WhatsApp
  // const message = `Olá ${booking.clientName}! Seu agendamento de ${booking.serviceName} foi confirmado para ${new Date(booking.date).toLocaleDateString("pt-BR")} às ${booking.time}. Estúdio de Sobrancelhas.`;
  // console.log("[v0] Enviando WhatsApp para:", booking.clientPhone);
  // console.log("[v0] Mensagem:", message);
  // Em produção, integrar com API do WhatsApp Business
  markNotificationsSent(booking.id, "whatsapp");
}
