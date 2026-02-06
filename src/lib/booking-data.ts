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
  products?: {
    productId: string;
    quantity: number;
    useSecondaryUnit?: boolean;
  }[];
};

export type InventoryLog = {
  id: string;
  timestamp: string;
  type: "entrada" | "saida" | "ajuste" | "venda" | "servico";
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  notes?: string;
  userName?: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  currentQuantity?: number; // Compatibilidade com Back-end (Drizzle camelCase)
  minQuantity: number;
  unit: string;
  price: number;
  unitPrice?: number; // Compatibilidade com Back-end
  lastUpdate: string;
  secondaryUnit?: string;
  conversionFactor?: number;
  logs?: InventoryLog[];
};

export type TimeSlot = {
  time: string;
  available: boolean;
};

export type BookingStatus =
  | "pendente"
  | "pending"
  | "confirmado"
  | "cancelado"
  | "concluído";

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

// Helper para isolamento de dados por usuário
function getStorageKey(key: string): string {
  if (typeof window === "undefined") return key;
  const userId = localStorage.getItem("current_admin_id");
  // Se não houver usuário logado (site público), tenta pegar o último usuário ativo ou usa modo compartilhado
  // Para garantir que o site público funcione, talvez devêssemos usar um ID padrão ou o último usado.
  // Por enquanto, se não houver ID, usa a chave sem prefixo (comportamento legado/compartilhado).
  if (!userId) return key;
  return `${userId}_${key}`;
}

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

export type StudioSettings = {
  agendaAberta: boolean;
  services: Service[];
  scheduleSettings: ScheduleSettings;
};

export type SiteProfile = {
  name: string;
  description: string;
  titleSuffix?: string;
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
  titleFont: string;
  linksFont: string;
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
  titleFont: "",
  linksFont: "",
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
  titleFont: string;
  content: string;
  contentColor: string;
  contentFont: string;
  image: string;
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
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
  titleFont: "",
  subtitleFont: "",
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
  cardTitleFont: "",
  cardDescriptionFont: "",
  cardPriceFont: "",
};

export const defaultStorySettings: StorySettings = {
  title: "Nossa História",
  titleColor: "",
  titleFont: "",
  content:
    "O Brow Studio nasceu da paixão por realçar a beleza natural de cada pessoa através do design de sobrancelhas. Com mais de 10 anos de experiência no mercado, nos especializamos em técnicas avançadas que valorizam a individualidade de cada cliente.\n\nNossa missão é proporcionar não apenas um serviço de qualidade, mas uma experiência transformadora. Acreditamos que sobrancelhas bem feitas têm o poder de elevar a autoestima e destacar a beleza única de cada pessoa.\n\nInvestimos constantemente em capacitação e nas melhores técnicas do mercado para garantir resultados excepcionais e a satisfação total de nossas clientes.",
  contentColor: "",
  contentFont: "",
  image: "/professional-eyebrow-artist-at-work.jpg",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
};

export const defaultValuesSettings: ValuesSettings = {
  title: "Nossos Valores",
  subtitle:
    "Os princípios que guiam nosso trabalho e relacionamento com cada cliente",
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
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
  cardTitleFont: "",
  cardDescriptionFont: "",
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
  buttonText: string;
  titleColor: string;
  subtitleColor: string;
  buttonColor: string;
  buttonTextColor: string;
  titleFont: string;
  subtitleFont: string;
  buttonFont: string;
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
  subtitle:
    "Veja alguns dos resultados incríveis que alcançamos com nossas clientes",
  buttonText: "Ver Galeria Completa",
  titleColor: "",
  subtitleColor: "",
  buttonColor: "",
  buttonTextColor: "",
  titleFont: "",
  subtitleFont: "",
  buttonFont: "",
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

export type BookingStepSettings = {
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
  accentColor?: string;
  cardBgColor?: string;
};

export const defaultBookingServiceSettings: BookingStepSettings = {
  title: "Escolha seus Serviços",
  subtitle: "Selecione um ou mais serviços para o seu agendamento",
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "",
  cardBgColor: "",
};

export const defaultBookingDateSettings: BookingStepSettings = {
  title: "Escolha a Data",
  subtitle: "Selecione o dia de sua preferência",
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "",
  cardBgColor: "",
};

export const defaultBookingTimeSettings: BookingStepSettings = {
  title: "Escolha o Horário",
  subtitle: "Selecione o melhor horário disponível",
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "",
  cardBgColor: "",
};

export const defaultBookingFormSettings: BookingStepSettings = {
  title: "Seus Dados",
  subtitle: "Preencha suas informações para finalizar o agendamento",
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "",
  cardBgColor: "",
};

export const defaultBookingConfirmationSettings: BookingStepSettings = {
  title: "Agendamento Confirmado!",
  subtitle: "Tudo pronto! Você receberá um e-mail com os detalhes.",
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "",
  cardBgColor: "",
};

export function getBookingServiceSettings(): BookingStepSettings {
  if (typeof window === "undefined") return defaultBookingServiceSettings;
  const settings = localStorage.getItem(
    getStorageKey("bookingServiceSettings"),
  );
  return settings ? JSON.parse(settings) : defaultBookingServiceSettings;
}

export function saveBookingServiceSettings(
  settings: BookingStepSettings,
): void {
  localStorage.setItem(
    getStorageKey("bookingServiceSettings"),
    JSON.stringify(settings),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bookingServiceSettingsUpdated"));
  }
}

export function getBookingDateSettings(): BookingStepSettings {
  if (typeof window === "undefined") return defaultBookingDateSettings;
  const settings = localStorage.getItem(getStorageKey("bookingDateSettings"));
  return settings ? JSON.parse(settings) : defaultBookingDateSettings;
}

export function saveBookingDateSettings(settings: BookingStepSettings): void {
  localStorage.setItem(
    getStorageKey("bookingDateSettings"),
    JSON.stringify(settings),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bookingDateSettingsUpdated"));
  }
}

export function getBookingTimeSettings(): BookingStepSettings {
  if (typeof window === "undefined") return defaultBookingTimeSettings;
  const settings = localStorage.getItem(getStorageKey("bookingTimeSettings"));
  return settings ? JSON.parse(settings) : defaultBookingTimeSettings;
}

export function saveBookingTimeSettings(settings: BookingStepSettings): void {
  localStorage.setItem(
    getStorageKey("bookingTimeSettings"),
    JSON.stringify(settings),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bookingTimeSettingsUpdated"));
  }
}

export function getBookingFormSettings(): BookingStepSettings {
  if (typeof window === "undefined") return defaultBookingFormSettings;
  const settings = localStorage.getItem(getStorageKey("bookingFormSettings"));
  return settings ? JSON.parse(settings) : defaultBookingFormSettings;
}

export function saveBookingFormSettings(settings: BookingStepSettings): void {
  localStorage.setItem(
    getStorageKey("bookingFormSettings"),
    JSON.stringify(settings),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bookingFormSettingsUpdated"));
  }
}

export function getBookingConfirmationSettings(): BookingStepSettings {
  if (typeof window === "undefined") return defaultBookingConfirmationSettings;
  const settings = localStorage.getItem(
    getStorageKey("bookingConfirmationSettings"),
  );
  return settings ? JSON.parse(settings) : defaultBookingConfirmationSettings;
}

export function saveBookingConfirmationSettings(
  settings: BookingStepSettings,
): void {
  localStorage.setItem(
    getStorageKey("bookingConfirmationSettings"),
    JSON.stringify(settings),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bookingConfirmationSettingsUpdated"));
  }
}

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
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
  cardBgColor: string;
  cardTitleColor: string;
  cardRoleColor: string;
  cardDescriptionColor: string;
  cardTitleFont: string;
  cardRoleFont: string;
  cardDescriptionFont: string;
  members: TeamMember[];
};

export type Testimonial = {
  id: string;
  name: string;
  text: string;
  rating: number;
};

export type TestimonialsSettings = {
  starColor: string;
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
  cardBgColor: string;
  cardNameColor: string;
  cardTextColor: string;
  cardNameFont: string;
  cardTextFont: string;
  testimonials: Testimonial[];
};

export const defaultCTASettings: CTASettings = {
  title: "Pronta Para Transformar Seu Olhar?",
  subtitle:
    "Agende seu horário agora e descubra como sobrancelhas bem feitas podem realçar toda sua beleza",
  buttonText: "Agendar Agora",
  titleColor: "",
  subtitleColor: "",
  buttonColor: "",
  buttonTextColor: "",
  titleFont: "",
  subtitleFont: "",
  buttonFont: "",
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
  titleFont: "",
  subtitleFont: "",
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
  cardRoleColor: "",
  cardDescriptionColor: "",
  cardTitleFont: "",
  cardRoleFont: "",
  cardDescriptionFont: "",
  members: [
    {
      id: "1",
      name: "Ana Silva",
      role: "Master Designer",
      image: "/professional-eyebrow-artist-at-work.jpg",
      description:
        "Especialista em micropigmentação e design personalizado com mais de 8 anos de experiência.",
    },
    {
      id: "2",
      name: "Beatriz Costa",
      role: "Designer & Lash Artist",
      image: "/professional-eyebrow-artist-at-work.jpg",
      description:
        "Especialista em lash lifting e design de sobrancelhas com foco em naturalidade.",
    },
  ],
};

export const defaultTestimonialsSettings: TestimonialsSettings = {
  starColor: "",
  title: "O Que Dizem Nossas Clientes",
  subtitle: "A satisfação de nossas clientes é nossa maior conquista",
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.5,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  cardBgColor: "",
  cardNameColor: "",
  cardTextColor: "",
  cardNameFont: "",
  cardTextFont: "",
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
  subtitleFont: string;
  bodyFont: string;
};

export type Expense = {
  id: string;
  description: string;
  value: number;
  category: string;
  date: string; // YYYY-MM-DD
  isFixed: boolean;
};

export type ColorSettings = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
};

export const services: Service[] = [];

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
  titleSuffix: "Agendamento Online",
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
  titleFont: "",
  subtitleFont: "",
  badgeFont: "",
  primaryButtonColor: "",
  secondaryButtonColor: "",
  primaryButtonTextColor: "",
  secondaryButtonTextColor: "",
  titleColor: "",
  subtitleColor: "",
  primaryButtonFont: "",
  secondaryButtonFont: "",
};

export const defaultFontSettings: FontSettings = {
  headingFont: "Playfair Display",
  subtitleFont: "Playfair Display",
  bodyFont: "Inter",
};

export const defaultColorSettings: ColorSettings = {
  primary: "#111827", // slate-900
  secondary: "#4b5563", // slate-600
  background: "#ffffff",
  text: "#111827",
};

export function getColorSettings(): ColorSettings {
  if (typeof window === "undefined") return defaultColorSettings;
  const settings = localStorage.getItem(getStorageKey("colorSettings"));
  return settings ? JSON.parse(settings) : defaultColorSettings;
}

export function saveColorSettings(settings: ColorSettings): void {
  localStorage.setItem(
    getStorageKey("colorSettings"),
    JSON.stringify(settings),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("colorSettingsUpdated"));
  }
}

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
  try {
    const bookings = localStorage.getItem(getStorageKey("bookings"));
    if (!bookings || bookings === "undefined") return [];
    const parsed = JSON.parse(bookings);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading bookings from storage:", error);
    return [];
  }
}

export function saveBookingToStorage(booking: Booking): void {
  const bookings = getBookingsFromStorage();
  bookings.push(booking);
  localStorage.setItem(getStorageKey("bookings"), JSON.stringify(bookings));
}

export function saveBookingsToStorage(newBookings: Booking[]): void {
  const bookings = getBookingsFromStorage();
  const updated = [...bookings, ...newBookings];
  localStorage.setItem(getStorageKey("bookings"), JSON.stringify(updated));
}

export function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): void {
  const bookings = getBookingsFromStorage();
  const updated = bookings.map((b) =>
    b.id === bookingId ? { ...b, status } : b,
  );
  localStorage.setItem(getStorageKey("bookings"), JSON.stringify(updated));
}

export function updateBooking(updatedBooking: Booking): void {
  const bookings = getBookingsFromStorage();
  const updated = bookings.map((b) =>
    b.id === updatedBooking.id ? updatedBooking : b,
  );
  localStorage.setItem(getStorageKey("bookings"), JSON.stringify(updated));
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
  localStorage.setItem(getStorageKey("bookings"), JSON.stringify(updated));
}

export function getInventoryFromStorage(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const inventory = localStorage.getItem(getStorageKey("inventory"));
    if (!inventory || inventory === "undefined") return [];
    const parsed = JSON.parse(inventory);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading inventory from storage:", error);
    return [];
  }
}

export function saveInventoryToStorage(inventory: InventoryItem[]): void {
  localStorage.setItem(getStorageKey("inventory"), JSON.stringify(inventory));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("inventoryUpdated"));
  }
}

export function subtractInventoryForService(serviceIds: string | string[]): {
  success: boolean;
  message: string;
} {
  if (typeof window === "undefined")
    return { success: false, message: "Ambiente inválido" };

  const ids = Array.isArray(serviceIds) ? serviceIds : [serviceIds];
  const settings = getSettingsFromStorage();
  const inventory = getInventoryFromStorage();
  const updatedInventory = [...inventory];
  const logs: string[] = [];

  for (const serviceId of ids) {
    const service = settings.services.find((s: Service) => s.id === serviceId);
    if (!service || !service.products) continue;

    for (const serviceProduct of service.products) {
      const inventoryProductIndex = updatedInventory.findIndex(
        (p) => p.id === serviceProduct.productId,
      );

      if (inventoryProductIndex !== -1) {
        const product = updatedInventory[inventoryProductIndex];

        let quantityToSubtract = serviceProduct.quantity;
        let unitLabel = product.unit;

        if (
          serviceProduct.useSecondaryUnit &&
          product.conversionFactor &&
          product.conversionFactor > 0
        ) {
          quantityToSubtract =
            serviceProduct.quantity / product.conversionFactor;
          unitLabel = product.secondaryUnit || product.unit;
        }

        if (product.quantity < quantityToSubtract) {
          logs.push(
            `Estoque insuficiente para ${product.name}: necessário ${serviceProduct.quantity}${unitLabel}, disponível ${product.quantity.toLocaleString("pt-BR")}${product.unit}`,
          );
        }

        const newQuantity = Math.max(0, product.quantity - quantityToSubtract);

        const logEntry: InventoryLog = {
          id: Math.random().toString(36).substring(2, 11),
          timestamp: new Date().toISOString(),
          type: "servico",
          quantityChange: -quantityToSubtract,
          previousQuantity: product.quantity,
          newQuantity: newQuantity,
          notes: `Baixa automática via serviço: ${service.name}`,
        };

        updatedInventory[inventoryProductIndex] = {
          ...product,
          quantity: newQuantity,
          lastUpdate: new Date().toISOString(),
          logs: [logEntry, ...(product.logs || [])].slice(0, 50),
        };
      }
    }
  }

  saveInventoryToStorage(updatedInventory);

  if (logs.length > 0) {
    return {
      success: true,
      message: `Estoque atualizado, mas houve alertas:\n${logs.join("\n")}`,
    };
  }

  return { success: true, message: "Estoque atualizado com sucesso" };
}

export function getSettingsFromStorage(): StudioSettings {
  const defaultValue: StudioSettings = {
    agendaAberta: true,
    services: services,
    scheduleSettings: defaultScheduleSettings,
  };

  if (typeof window === "undefined") return defaultValue;

  try {
    const settings = localStorage.getItem(getStorageKey("studioSettings"));
    if (!settings || settings === "undefined") return defaultValue;

    const parsed = JSON.parse(settings);
    if (!parsed || typeof parsed !== "object") return defaultValue;

    return parsed as StudioSettings;
  } catch (error) {
    console.error("Error reading studioSettings from storage:", error);
    return defaultValue;
  }
}

export function saveSettingsToStorage(settings: StudioSettings): void {
  localStorage.setItem(
    getStorageKey("studioSettings"),
    JSON.stringify(settings),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("studioSettingsUpdated"));
  }
}

export function getScheduleSettings(): ScheduleSettings {
  const settings = getSettingsFromStorage();
  return settings.scheduleSettings || defaultScheduleSettings;
}

export function getWeekSchedule(): WeekSchedule {
  if (typeof window === "undefined") return defaultWeekSchedule;
  const settings = localStorage.getItem(getStorageKey("weekSchedule"));
  return settings ? JSON.parse(settings) : defaultWeekSchedule;
}

export function saveWeekSchedule(schedule: WeekSchedule): void {
  localStorage.setItem(getStorageKey("weekSchedule"), JSON.stringify(schedule));
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
  const images = localStorage.getItem(getStorageKey("galleryImages"));
  return images ? JSON.parse(images) : [];
}

export function saveGalleryImages(images: GalleryImage[]): void {
  localStorage.setItem(getStorageKey("galleryImages"), JSON.stringify(images));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("galleryUpdated"));
  }
}

export function getBlockedPeriods(): BlockedPeriod[] {
  if (typeof window === "undefined") return [];
  const blocked = localStorage.getItem(getStorageKey("blockedPeriods"));
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
  localStorage.setItem(
    getStorageKey("studioSettings"),
    JSON.stringify(settings),
  );
  localStorage.setItem(getStorageKey("services"), JSON.stringify(newServices));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("studioSettingsUpdated"));
    window.dispatchEvent(new Event("servicesUpdated"));
  }
}

export function saveBlockedPeriods(blocked: BlockedPeriod[]): void {
  localStorage.setItem(
    getStorageKey("blockedPeriods"),
    JSON.stringify(blocked),
  );
}

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return defaultNotificationSettings;
  const settings = localStorage.getItem(getStorageKey("notificationSettings"));
  return settings ? JSON.parse(settings) : defaultNotificationSettings;
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  localStorage.setItem(
    getStorageKey("notificationSettings"),
    JSON.stringify(settings),
  );
}

export function getGoogleCalendarSettings(): GoogleCalendarSettings {
  if (typeof window === "undefined") return defaultGoogleCalendarSettings;
  const settings = localStorage.getItem(
    getStorageKey("googleCalendarSettings"),
  );
  return settings ? JSON.parse(settings) : defaultGoogleCalendarSettings;
}

export function saveGoogleCalendarSettings(
  settings: GoogleCalendarSettings,
): void {
  localStorage.setItem(
    getStorageKey("googleCalendarSettings"),
    JSON.stringify(settings),
  );
}

export function getSiteProfile(): SiteProfile {
  if (typeof window === "undefined") return defaultSiteProfile;
  const profile = localStorage.getItem(getStorageKey("siteProfile"));
  return profile
    ? { ...defaultSiteProfile, ...JSON.parse(profile) }
    : defaultSiteProfile;
}

export function saveSiteProfile(profile: SiteProfile): void {
  localStorage.setItem(getStorageKey("siteProfile"), JSON.stringify(profile));
  // Dispatch custom event so components can update immediately
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("siteProfileUpdated"));
  }
}

export function getHeroSettings(): HeroSettings {
  if (typeof window === "undefined") return defaultHeroSettings;
  const settings = localStorage.getItem(getStorageKey("heroSettings"));
  return settings ? JSON.parse(settings) : defaultHeroSettings;
}

export function saveHeroSettings(settings: HeroSettings): void {
  localStorage.setItem(getStorageKey("heroSettings"), JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("heroSettingsUpdated"));
  }
}

export const defaultAboutHeroSettings: HeroSettings = {
  ...defaultHeroSettings,
  badge: "Sobre Nós",
  title: "Nossa Paixão é Realçar Sua Beleza",
  subtitle:
    "Conheça a história por trás do Studio e nossa dedicação à excelência.",
  primaryButton: "Nossos Serviços",
  secondaryButton: "Agendar Agora",
};

export function getAboutHeroSettings(): HeroSettings {
  if (typeof window === "undefined") return defaultAboutHeroSettings;
  const settings = localStorage.getItem(getStorageKey("aboutHeroSettings"));
  return settings ? JSON.parse(settings) : defaultAboutHeroSettings;
}

export function saveAboutHeroSettings(settings: HeroSettings): void {
  localStorage.setItem(
    getStorageKey("aboutHeroSettings"),
    JSON.stringify(settings),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("aboutHeroSettingsUpdated"));
  }
}

export function getStorySettings(): StorySettings {
  if (typeof window === "undefined") return defaultStorySettings;
  const settings = localStorage.getItem(getStorageKey("storySettings"));
  return settings ? JSON.parse(settings) : defaultStorySettings;
}

export function saveStorySettings(settings: StorySettings): void {
  localStorage.setItem(
    getStorageKey("storySettings"),
    JSON.stringify(settings),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storySettingsUpdated"));
  }
}

export function getValuesSettings(): ValuesSettings {
  if (typeof window === "undefined") return defaultValuesSettings;
  const settings = localStorage.getItem(getStorageKey("valuesSettings"));
  return settings ? JSON.parse(settings) : defaultValuesSettings;
}

export function saveValuesSettings(settings: ValuesSettings): void {
  localStorage.setItem(
    getStorageKey("valuesSettings"),
    JSON.stringify(settings),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("valuesSettingsUpdated"));
  }
}

export function getServicesSettings(): ServicesSettings {
  if (typeof window === "undefined") return defaultServicesSettings;
  const settings = localStorage.getItem(getStorageKey("servicesSettings"));
  return settings ? JSON.parse(settings) : defaultServicesSettings;
}

export function saveServicesSettings(settings: ServicesSettings): void {
  localStorage.setItem(
    getStorageKey("servicesSettings"),
    JSON.stringify(settings),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("servicesSettingsUpdated"));
  }
}

export function getFontSettings(): FontSettings {
  if (typeof window === "undefined") return defaultFontSettings;
  const settings = localStorage.getItem(getStorageKey("fontSettings"));
  return settings ? JSON.parse(settings) : defaultFontSettings;
}

export function saveFontSettings(settings: FontSettings): void {
  localStorage.setItem(getStorageKey("fontSettings"), JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("fontSettingsUpdated"));
  }
}

export function getGallerySettings(): GallerySettings {
  if (typeof window === "undefined") return defaultGallerySettings;
  const settings = localStorage.getItem(getStorageKey("gallerySettings"));
  return settings ? JSON.parse(settings) : defaultGallerySettings;
}

export function saveGallerySettings(settings: GallerySettings): void {
  localStorage.setItem(
    getStorageKey("gallerySettings"),
    JSON.stringify(settings),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("gallerySettingsUpdated"));
  }
}

export function getCTASettings(): CTASettings {
  if (typeof window === "undefined") return defaultCTASettings;
  const settings = localStorage.getItem(getStorageKey("ctaSettings"));
  return settings ? JSON.parse(settings) : defaultCTASettings;
}

export function saveCTASettings(settings: CTASettings): void {
  localStorage.setItem(getStorageKey("ctaSettings"), JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ctaSettingsUpdated"));
  }
}

export function getTeamSettings(): TeamSettings {
  if (typeof window === "undefined") return defaultTeamSettings;
  const settings = localStorage.getItem(getStorageKey("teamSettings"));
  return settings ? JSON.parse(settings) : defaultTeamSettings;
}

export function saveTeamSettings(settings: TeamSettings): void {
  localStorage.setItem(getStorageKey("teamSettings"), JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("teamSettingsUpdated"));
  }
}

export function getTestimonialsSettings(): TestimonialsSettings {
  if (typeof window === "undefined") return defaultTestimonialsSettings;
  const settings = localStorage.getItem(getStorageKey("testimonialsSettings"));
  return settings ? JSON.parse(settings) : defaultTestimonialsSettings;
}

export function saveTestimonialsSettings(settings: TestimonialsSettings): void {
  localStorage.setItem(
    getStorageKey("testimonialsSettings"),
    JSON.stringify(settings),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("testimonialsSettingsUpdated"));
  }
}

export function getHeaderSettings(): HeaderSettings {
  if (typeof window === "undefined") return defaultHeaderSettings;
  const settings = localStorage.getItem(getStorageKey("headerSettings"));
  return settings ? JSON.parse(settings) : defaultHeaderSettings;
}

export function saveHeaderSettings(settings: HeaderSettings): void {
  localStorage.setItem(
    getStorageKey("headerSettings"),
    JSON.stringify(settings),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("headerSettingsUpdated"));
  }
}

export function getFooterSettings(): FooterSettings {
  if (typeof window === "undefined") return defaultFooterSettings;
  const settings = localStorage.getItem(getStorageKey("footerSettings"));
  return settings ? JSON.parse(settings) : defaultFooterSettings;
}

export function saveFooterSettings(settings: FooterSettings): void {
  localStorage.setItem(
    getStorageKey("footerSettings"),
    JSON.stringify(settings),
  );
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
  const visibility = localStorage.getItem(getStorageKey("pageVisibility"));
  if (visibility) return JSON.parse(visibility);

  return {
    inicio: true,
    galeria: true,
    sobre: true,
    agendar: true,
  };
}

export function savePageVisibility(visibility: Record<string, boolean>): void {
  localStorage.setItem(
    getStorageKey("pageVisibility"),
    JSON.stringify(visibility),
  );
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
  const sections = localStorage.getItem(getStorageKey("visibleSections"));
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
  localStorage.setItem(
    getStorageKey("visibleSections"),
    JSON.stringify(sections),
  );
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

export interface BusinessConfig {
  hero?: HeroSettings;
  typography?: FontSettings;
  [key: string]: unknown;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  titleSuffix?: string;
  logoUrl?: string;
  config: BusinessConfig;
  services?: Service[];
  gallery?: GalleryImage[];
  testimonials?: Testimonial[];
}
