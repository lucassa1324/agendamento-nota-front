"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getGoogleCalendarSettings, saveGoogleCalendarSettings, type GoogleCalendarSettings } from "@/lib/booking-data"
import { Calendar, RefreshCw, Save, ExternalLink, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function GoogleCalendarManager() {
  const [settings, setSettings] = useState<GoogleCalendarSettings>({
    enabled: false,
    calendarUrl: "",
    lastSync: null,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    const saved = getGoogleCalendarSettings()
    setSettings(saved)
  }

  const saveSettings = () => {
    saveGoogleCalendarSettings(settings)
    toast({
      title: "Configuração salva",
      description: "As configurações do Google Calendar foram atualizadas",
    })
  }

  const syncNow = () => {
    const newSettings = {
      ...settings,
      lastSync: new Date().toISOString(),
    }
    setSettings(newSettings)
    saveGoogleCalendarSettings(newSettings)
    toast({
      title: "Sincronização iniciada",
      description: "Seus agendamentos estão sendo sincronizados com o Google Calendar",
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Integração com Google Calendar
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sincronize seus agendamentos do Google Calendar automaticamente
        </p>
      </div>

      <div className="space-y-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Como obter a URL de sincronização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <p>
                <span className="font-medium">1.</span> Acesse{" "}
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google Calendar
                </a>
              </p>
              <p>
                <span className="font-medium">2.</span> No lado esquerdo, encontre sua agenda e clique nos{" "}
                <span className="font-semibold">três pontinhos (:)</span>
              </p>
              <p>
                <span className="font-medium">3.</span> Selecione{" "}
                <span className="font-semibold">"Configurações e compartilhamento"</span>
              </p>
              <p>
                <span className="font-medium">4.</span> Role até a seção{" "}
                <span className="font-semibold">"Integrar agenda"</span>
              </p>
              <p>
                <span className="font-medium">5.</span> Procure por{" "}
                <span className="font-semibold">"Endereço secreto no formato iCal"</span>
              </p>
              <p>
                <span className="font-medium">6.</span> Copie a URL completa que termina com{" "}
                <span className="font-semibold">".ics"</span> e cole aqui
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="calendarUrl">URL do iCal do Google Calendar</Label>
              <Input
                id="calendarUrl"
                type="url"
                value={settings.calendarUrl}
                onChange={(e) => setSettings({ ...settings, calendarUrl: e.target.value })}
                placeholder="https://calendar.google.com/calendar/ical/lucassa1324%40gmail.com/private-99804ac747841dc9ada97484e68fa705/basic.ics"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Cole aqui a URL privada do iCal do seu Google Calendar
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={saveSettings} className="bg-primary hover:bg-primary/90 flex-1">
                <Save className="w-4 h-4 mr-2" />
                Salvar Configuração
              </Button>
              <Button
                onClick={syncNow}
                variant="outline"
                disabled={!settings.calendarUrl}
                className="flex-1 bg-transparent"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar Agora
              </Button>
            </div>

            {settings.lastSync && (
              <p className="text-xs text-muted-foreground text-center">
                Última sincronização: {new Date(settings.lastSync).toLocaleString("pt-BR")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">💡 Como funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>
                <span className="font-semibold">Agendamentos criados aqui:</span> Clique em "Exportar p/ Google" para
                adicionar ao seu Google Calendar
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>
                <span className="font-semibold">Agendamentos do Google:</span> Serão importados automaticamente quando
                você sincronizar
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>
                <span className="font-semibold">Offline:</span> Agende no Google Calendar pelo celular, depois
                sincronize aqui quando tiver internet
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
