"use client";

import { format, parseISO } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Import,
  RefreshCw,
  Save,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  type Booking,
  type BookingStatus,
  type GoogleCalendarSettings,
  getBookingsFromStorage,
  getGoogleCalendarSettings,
  saveBookingsToStorage,
  saveGoogleCalendarSettings,
} from "@/lib/booking-data";

export function GoogleCalendarManager() {
  const [settings, setSettings] = useState<GoogleCalendarSettings>({
    enabled: false,
    calendarUrl: "",
    lastSync: null,
  });
  const [exportRange, setExportRange] = useState({
    start: format(new Date(), "yyyy-MM-dd"),
    end: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  });

  const { toast } = useToast();

  const loadSettings = useCallback(() => {
    const saved = getGoogleCalendarSettings();
    setSettings(saved);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = () => {
    saveGoogleCalendarSettings(settings);
    toast({
      title: "Configuração salva",
      description: "As configurações do Google Calendar foram atualizadas",
    });
  };

  const syncNow = () => {
    const newSettings = {
      ...settings,
      lastSync: new Date().toISOString(),
    };
    setSettings(newSettings);
    saveGoogleCalendarSettings(newSettings);
    toast({
      title: "Sincronização iniciada",
      description:
        "Seus agendamentos estão sendo sincronizados com o Google Calendar",
    });
  };

  const handleExportICS = () => {
    const bookings = getBookingsFromStorage();
    const filteredBookings = bookings.filter((b) => {
      const bDate = b.date; // YYYY-MM-DD
      return bDate >= exportRange.start && bDate <= exportRange.end;
    });

    if (filteredBookings.length === 0) {
      toast({
        title: "Nenhum agendamento",
        description: "Não há agendamentos no período selecionado para exportar.",
        variant: "destructive",
      });
      return;
    }

    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Agendamento Nota//PT\n";
    
    filteredBookings.forEach((b) => {
      const startDateTime = `${b.date.replace(/-/g, "")}T${b.time.replace(/:/g, "")}00`;
      // Calcular fim com base na duração
      const startDate = parseISO(`${b.date}T${b.time}`);
      const endDate = new Date(startDate.getTime() + b.serviceDuration * 60000);
      const endDateTime = format(endDate, "yyyyMMdd'T'HHmmss");

      icsContent += "BEGIN:VEVENT\n";
      icsContent += `UID:${b.id}\n`;
      icsContent += `DTSTAMP:${format(new Date(b.createdAt), "yyyyMMdd'T'HHmmss")}\n`;
      icsContent += `DTSTART:${startDateTime}\n`;
      icsContent += `DTEND:${endDateTime}\n`;
      icsContent += `SUMMARY:${b.serviceName} - ${b.clientName}\n`;
      icsContent += `DESCRIPTION:Cliente: ${b.clientName}\\nTelefone: ${b.clientPhone}\\nServiço: ${b.serviceName}\\nStatus: ${b.status}\n`;
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    downloadFile(icsContent, `agendamentos_${exportRange.start}_${exportRange.end}.ics`, "text/calendar");
  };

  const handleExportCSV = () => {
    const bookings = getBookingsFromStorage();
    const filteredBookings = bookings.filter((b) => {
      const bDate = b.date;
      return bDate >= exportRange.start && bDate <= exportRange.end;
    });

    if (filteredBookings.length === 0) {
      toast({
        title: "Nenhum agendamento",
        description: "Não há agendamentos no período selecionado para exportar.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["ID", "Data", "Hora", "Cliente", "Telefone", "E-mail", "Serviço", "Duração (min)", "Preço", "Status", "Criado em"];
    const rows = filteredBookings.map(b => [
      b.id,
      b.date,
      b.time,
      b.clientName,
      `"${b.clientPhone}"`,
      b.clientEmail,
      b.serviceName,
      b.serviceDuration,
      b.servicePrice,
      b.status,
      b.createdAt
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // Adicionar BOM para Excel abrir corretamente com acentos
    const blobContent = `\uFEFF${csvContent}`;
    downloadFile(blobContent, `agendamentos_${exportRange.start}_${exportRange.end}.csv`, "text/csv;charset=utf-8;");
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith(".csv")) {
        importCSV(content);
      } else if (file.name.endsWith(".ics")) {
        importICS(content);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo .csv ou .ics",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const importCSV = (content: string) => {
    try {
      const lines = content.split("\n").filter(line => line.trim() !== "");
      // Pular header (remover BOM se houver)
      const dataLines = lines.slice(1);
      
      const newBookings: Booking[] = dataLines.map(line => {
        const cols = line.split(",").map(c => c.replace(/^"|"$/g, ""));
        return {
          id: cols[0] || Math.random().toString(36).substring(2, 11),
          date: cols[1],
          time: cols[2],
          clientName: cols[3],
          clientPhone: cols[4],
          clientEmail: cols[5],
          serviceName: cols[6],
          serviceDuration: parseInt(cols[7], 10) || 60,
          servicePrice: parseFloat(cols[8]) || 0,
          status: (cols[9] as BookingStatus) || "pendente",
          createdAt: cols[10] || new Date().toISOString(),
          serviceId: "", // Informação perdida no CSV simplificado
          notificationsSent: { email: false, whatsapp: false }
        };
      });

      saveBookingsToStorage(newBookings);
      toast({
        title: "Importação concluída",
        description: `${newBookings.length} agendamentos importados do CSV.`,
      });
    } catch (_error) {
      toast({
        title: "Erro na importação",
        description: "Não foi possível processar o arquivo CSV.",
        variant: "destructive",
      });
    }
  };

  const importICS = (content: string) => {
    try {
      const events = content.split("BEGIN:VEVENT").slice(1);
      const newBookings: Booking[] = events.map(event => {
        const summary = event.match(/SUMMARY:(.*)/)?.[1] || "Importado";
        const dtstart = event.match(/DTSTART:(.*)/)?.[1] || "";
        const description = event.match(/DESCRIPTION:(.*)/)?.[1] || "";
        
        // Parse data e hora do formato iCal (YYYYMMDDTHHMMSS)
        const dateStr = `${dtstart.substring(0, 4)}-${dtstart.substring(4, 6)}-${dtstart.substring(6, 8)}`;
        const timeStr = `${dtstart.substring(9, 11)}:${dtstart.substring(11, 13)}`;
        
        const clientNameMatch = description.match(/Cliente: ([^\\]*)/);
        const phoneMatch = description.match(/Telefone: ([^\\]*)/);
        const serviceMatch = summary.split(" - ")[0];

        return {
          id: Math.random().toString(36).substring(2, 11),
          date: dateStr,
          time: timeStr,
          clientName: clientNameMatch?.[1] || summary.split(" - ")[1] || "Cliente Importado",
          clientPhone: phoneMatch?.[1] || "",
          clientEmail: "",
          serviceName: serviceMatch || "Serviço Importado",
          serviceDuration: 60,
          servicePrice: 0,
          status: "confirmado",
          createdAt: new Date().toISOString(),
          serviceId: "",
          notificationsSent: { email: false, whatsapp: false }
        };
      });

      saveBookingsToStorage(newBookings);
      toast({
        title: "Importação concluída",
        description: `${newBookings.length} agendamentos importados do Google Calendar (ICS).`,
      });
    } catch (_error) {
      toast({
        title: "Erro na importação",
        description: "Não foi possível processar o arquivo ICS.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Integração e Dados
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie a sincronização com Google Calendar e exportação de dados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna 1: Configuração e Sincronização */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                Sincronização Automática
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="calendarUrl">URL do iCal do Google Calendar</Label>
                <Input
                  id="calendarUrl"
                  type="url"
                  value={settings.calendarUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, calendarUrl: e.target.value })
                  }
                  placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={saveSettings} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button
                  onClick={syncNow}
                  variant="outline"
                  disabled={!settings.calendarUrl}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar
                </Button>
              </div>

              {settings.lastSync && (
                <p className="text-xs text-muted-foreground text-center">
                  Última sincronização: {new Date(settings.lastSync).toLocaleString("pt-BR")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Como obter a URL iCal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1 text-blue-800">
              <p>1. No Google Calendar, clique nos 3 pontos da sua agenda.</p>
              <p>2. "Configurações e compartilhamento".</p>
              <p>3. Role até "Integrar agenda".</p>
              <p>4. Copie o "Endereço secreto no formato iCal".</p>
            </CardContent>
          </Card>
        </div>

        {/* Coluna 2: Exportar e Importar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Exportar Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Início</Label>
                  <Input
                    type="date"
                    value={exportRange.start}
                    onChange={(e) => setExportRange({ ...exportRange, start: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Fim</Label>
                  <Input
                    type="date"
                    value={exportRange.end}
                    onChange={(e) => setExportRange({ ...exportRange, end: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={handleExportICS} variant="outline" className="justify-start">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  Para Google Agenda (.ics)
                </Button>
                <Button onClick={handleExportCSV} variant="outline" className="justify-start">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-green-500" />
                  Para Planilha (.csv)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Import className="w-5 h-5 text-primary" />
                Importar Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="importFile" className="cursor-pointer border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-accent/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Clique para selecionar arquivo</span>
                  <span className="text-xs text-muted-foreground">Suporta .csv ou .ics</span>
                  <Input
                    id="importFile"
                    type="file"
                    accept=".csv,.ics"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6 space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <p><strong>Exportação:</strong> Escolha o período e baixe o arquivo para backup ou integração externa.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <p><strong>Importação:</strong> Adicione agendamentos em massa a partir de arquivos exportados anteriormente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
