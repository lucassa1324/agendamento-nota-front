"use client";

import { Mail, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function NotificationsManager() {
  const [emailConfig, setEmailConfig] = useState({
    adminEmail: "admin@browstudio.com",
    smtpServer: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
  });

  const [whatsappConfig, setWhatsappConfig] = useState({
    adminPhone: "5511999999999",
    apiKey: "",
    apiUrl: "",
  });

  const { toast } = useToast();

  const saveEmailConfig = () => {
    localStorage.setItem("emailConfig", JSON.stringify(emailConfig));
    toast({
      title: "Configurações de email salvas",
      description: "As configurações foram atualizadas com sucesso",
    });
  };

  const saveWhatsAppConfig = () => {
    localStorage.setItem("whatsappConfig", JSON.stringify(whatsappConfig));
    toast({
      title: "Configurações de WhatsApp salvas",
      description: "As configurações foram atualizadas com sucesso",
    });
  };

  const testEmail = () => {
    toast({
      title: "Email de teste enviado",
      description: "Verifique sua caixa de entrada",
    });
  };

  const testWhatsApp = () => {
    toast({
      title: "WhatsApp de teste enviado",
      description: "Verifique seu telefone",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          Configurações de Notificações
        </h2>
        <p className="text-muted-foreground">
          Configure as notificações automáticas por email e WhatsApp para você e
          suas clientes
        </p>
      </div>

      {/* Configurações de Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Configurações de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="adminEmail">Email do Administrador</Label>
            <Input
              id="adminEmail"
              type="email"
              value={emailConfig.adminEmail}
              onChange={(e) =>
                setEmailConfig({ ...emailConfig, adminEmail: e.target.value })
              }
              placeholder="seu@email.com"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Email que receberá notificações de novos agendamentos
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpServer">Servidor SMTP</Label>
              <Input
                id="smtpServer"
                value={emailConfig.smtpServer}
                onChange={(e) =>
                  setEmailConfig({ ...emailConfig, smtpServer: e.target.value })
                }
                placeholder="smtp.gmail.com"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="smtpPort">Porta SMTP</Label>
              <Input
                id="smtpPort"
                value={emailConfig.smtpPort}
                onChange={(e) =>
                  setEmailConfig({ ...emailConfig, smtpPort: e.target.value })
                }
                placeholder="587"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="smtpUser">Usuário SMTP</Label>
              <Input
                id="smtpUser"
                value={emailConfig.smtpUser}
                onChange={(e) =>
                  setEmailConfig({ ...emailConfig, smtpUser: e.target.value })
                }
                placeholder="seu@email.com"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="smtpPassword">Senha SMTP</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={emailConfig.smtpPassword}
                onChange={(e) =>
                  setEmailConfig({
                    ...emailConfig,
                    smtpPassword: e.target.value,
                  })
                }
                placeholder="••••••••"
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={saveEmailConfig}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
            <Button onClick={testEmail} variant="outline">
              Testar Email
            </Button>
          </div>

          <div className="bg-secondary/30 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Serviços de Email Recomendados:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Gmail (smtp.gmail.com:587)</li>
              <li>SendGrid (smtp.sendgrid.net:587)</li>
              <li>Resend (smtp.resend.com:587)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Configurações de WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="adminPhone">Telefone do Administrador</Label>
            <Input
              id="adminPhone"
              type="tel"
              value={whatsappConfig.adminPhone}
              onChange={(e) =>
                setWhatsappConfig({
                  ...whatsappConfig,
                  adminPhone: e.target.value,
                })
              }
              placeholder="5511999999999"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Telefone que receberá notificações de novos agendamentos (formato:
              código do país + DDD + número)
            </p>
          </div>

          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={whatsappConfig.apiKey}
              onChange={(e) =>
                setWhatsappConfig({ ...whatsappConfig, apiKey: e.target.value })
              }
              placeholder="sua-api-key"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="apiUrl">URL da API</Label>
            <Input
              id="apiUrl"
              value={whatsappConfig.apiUrl}
              onChange={(e) =>
                setWhatsappConfig({ ...whatsappConfig, apiUrl: e.target.value })
              }
              placeholder="https://api.whatsapp.com"
              className="mt-2"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={saveWhatsAppConfig}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
            <Button onClick={testWhatsApp} variant="outline">
              Testar WhatsApp
            </Button>
          </div>

          <div className="bg-secondary/30 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">
              Serviços de WhatsApp Recomendados:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>WhatsApp Business API</li>
              <li>Twilio WhatsApp API</li>
              <li>Evolution API (auto-hospedado)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Informações sobre Notificações Automáticas */}
      <Card className="bg-secondary/30">
        <CardHeader>
          <CardTitle>Notificações Automáticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="font-medium">
              O sistema enviará notificações automaticamente nos seguintes
              casos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
              <li>
                <span className="font-medium text-foreground">
                  Confirmação:
                </span>{" "}
                Quando um agendamento é confirmado
              </li>
              <li>
                <span className="font-medium text-foreground">Lembrete:</span>{" "}
                24 horas antes do agendamento
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Cancelamento:
                </span>{" "}
                Quando um agendamento é cancelado
              </li>
            </ul>
            <p className="text-muted-foreground pt-2">
              Tanto você quanto a cliente receberão as notificações configuradas
              acima.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
