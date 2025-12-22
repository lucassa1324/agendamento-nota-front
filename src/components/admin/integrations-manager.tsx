"use client";

import { Calendar, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function IntegrationsManager() {
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Google Calendar
          </CardTitle>
          <CardDescription>
            Sincronize agendamentos automaticamente com o Google Calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="google-calendar">Ativar integração</Label>
            <Switch
              id="google-calendar"
              checked={googleCalendarEnabled}
              onCheckedChange={setGoogleCalendarEnabled}
            />
          </div>
          {googleCalendarEnabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="calendar-id">Calendar ID</Label>
                <Input id="calendar-id" placeholder="seu-email@gmail.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="••••••••••••••••"
                />
              </div>
              <Button>Conectar Google Calendar</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            WhatsApp Business
          </CardTitle>
          <CardDescription>
            Envie lembretes e confirmações via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="whatsapp">Ativar integração</Label>
            <Switch
              id="whatsapp"
              checked={whatsappEnabled}
              onCheckedChange={setWhatsappEnabled}
            />
          </div>
          {whatsappEnabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-token">Token de Acesso</Label>
                <Input
                  id="whatsapp-token"
                  type="password"
                  placeholder="••••••••••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-number">Número do WhatsApp</Label>
                <Input id="whatsapp-number" placeholder="+55 11 99999-9999" />
              </div>
              <Button>Conectar WhatsApp</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email
          </CardTitle>
          <CardDescription>
            Configure o envio de emails automáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email">Ativar integração</Label>
            <Switch
              id="email"
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
          </div>
          {emailEnabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" placeholder="smtp.gmail.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-email">Email</Label>
                <Input
                  id="smtp-email"
                  type="email"
                  placeholder="seu-email@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">Senha</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  placeholder="••••••••••••••••"
                />
              </div>
              <Button>Salvar Configurações</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
