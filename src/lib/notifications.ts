// Sistema de notificações via Email e WhatsApp
/** biome-ignore-all lint/correctness/noUnusedVariables: Variáveis de notificação que serão integradas com serviços de mensageria futuramente */
export type NotificationType = "confirmation" | "reminder" | "cancellation";

export interface NotificationData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
}

// Função para enviar email (simulado - requer integração real com serviço de email)
export async function sendEmailNotification(
  data: NotificationData,
  type: NotificationType,
): Promise<{ success: boolean; message: string }> {
  // Em produção, integrar com serviço como SendGrid, Resend, etc.
  // console.log("[v0] Enviando email:", { to: data.clientEmail, type, data });

  // Simulação de envio
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Email de ${type} enviado para ${data.clientEmail}`,
      });
    }, 1000);
  });
}

// Função para enviar WhatsApp (simulado - requer integração com WhatsApp Business API)
export async function sendWhatsAppNotification(
  data: NotificationData,
  type: NotificationType,
): Promise<{ success: boolean; message: string }> {
  // Em produção, integrar com WhatsApp Business API ou serviço como Twilio
  // console.log("[v0] Enviando WhatsApp:", { to: data.clientPhone, type, data });

  // Formatar mensagem
  const messages = {
    confirmation: `Olá ${data.clientName}! ✨\n\nSeu agendamento foi confirmado:\n📅 ${formatDate(data.date)}\n⏰ ${data.time}\n💅 ${data.serviceName}\n⏱️ Duração: ${data.duration}min\n💰 Valor: R$ ${data.price.toFixed(2)}\n\nAguardamos você! 🌟`,
    reminder: `Olá ${data.clientName}! 👋\n\nLembramos que você tem um agendamento:\n📅 ${formatDate(data.date)}\n⏰ ${data.time}\n💅 ${data.serviceName}\n\nTe esperamos! ✨`,
    cancellation: `Olá ${data.clientName},\n\nSeu agendamento de ${data.serviceName} para ${formatDate(data.date)} às ${data.time} foi cancelado.\n\nQualquer dúvida, entre em contato conosco.`,
  };

  // Simulação de envio
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `WhatsApp enviado para ${data.clientPhone}: ${messages[type]}`,
      });
    }, 1000);
  });
}

// Função para enviar notificação para o admin
export async function sendAdminNotification(
  data: NotificationData,
  type: NotificationType,
): Promise<void> {
  const adminEmail = "admin@browstudio.com"; // Configurar email do admin
  const adminPhone = "5511999999999"; // Configurar telefone do admin

  // console.log("[v0] Notificando admin:", { type, data });

  // Enviar para admin
  await Promise.all([
    sendEmailNotification({ ...data, clientEmail: adminEmail }, type),
    sendWhatsAppNotification({ ...data, clientPhone: adminPhone }, type),
  ]);
}

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Função para agendar lembretes automáticos
export function scheduleReminder(date: string, time: string): void {
  // Em produção, usar um sistema de agendamento como cron jobs ou serviço de fila
  // console.log("[v0] Lembrete agendado para:", { bookingId, date, time });

  // Calcular quando enviar o lembrete (24h antes)
  const bookingDate = new Date(`${date}T${time}`);
  const reminderDate = new Date(bookingDate.getTime() - 24 * 60 * 60 * 1000);

  /*
  console.log(
    "[v0] Lembrete será enviado em:",
    reminderDate.toLocaleString("pt-BR"),
  );
  */
}
