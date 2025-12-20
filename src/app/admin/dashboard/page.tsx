"use client"

import { useSearchParams } from "next/navigation"
import { BookingsManager } from "@/components/admin/bookings-manager"
import { ServicesManager } from "@/components/admin/services-manager"
import { ScheduleManager } from "@/components/admin/schedule-manager"
import { Reports } from "@/components/admin/reports"
import { GalleryManager } from "@/components/admin/gallery-manager"
import { NotificationsManager } from "@/components/admin/notifications-manager"
import { GoogleCalendarManager } from "@/components/admin/google-calendar-manager"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { IntegrationsManager } from "@/components/admin/integrations-manager"
import { ProfileManager } from "@/components/admin/profile-manager"
import { ManagementReports } from "@/components/admin/management-reports"
import { InventoryManager } from "@/components/admin/inventory-manager"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  return (
    <div className="max-w-7xl mx-auto">
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-sans text-3xl font-bold mb-2 text-primary">Visão Geral</h2>
            <p className="text-muted-foreground">Acompanhe o desempenho do seu studio</p>
          </div>
          <DashboardStats />
        </div>
      )}

      {activeTab === "agendamentos" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-sans text-3xl font-bold mb-2 text-primary">Agendamentos</h2>
            <p className="text-muted-foreground">Gerencie todos os agendamentos do studio</p>
          </div>
          <BookingsManager />
        </div>
      )}

      {activeTab === "servicos" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-sans text-3xl font-bold mb-2 text-primary">Serviços</h2>
            <p className="text-muted-foreground">Configure os serviços oferecidos</p>
          </div>
          <ServicesManager />
        </div>
      )}

      {activeTab === "horarios" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-sans text-3xl font-bold mb-2 text-primary">Horários</h2>
            <p className="text-muted-foreground">Defina os horários de funcionamento</p>
          </div>
          <ScheduleManager />
        </div>
      )}

      {activeTab === "integracoes" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-sans text-3xl font-bold mb-2 text-primary">Integrações</h2>
            <p className="text-muted-foreground">Configure integrações com Google Calendar e outros serviços</p>
          </div>
          <IntegrationsManager />
        </div>
      )}

      {activeTab === "perfil" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-sans text-3xl font-bold mb-2 text-primary">Perfil do Site</h2>
            <p className="text-muted-foreground">Configure nome, cores, logo e estética do site</p>
          </div>
          <ProfileManager />
        </div>
      )}

      {activeTab === "gerenciamento" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-sans text-3xl font-bold mb-2 text-primary">Gerenciamento</h2>
            <p className="text-muted-foreground">Gere relatórios e análises detalhadas</p>
          </div>
          <ManagementReports />
        </div>
      )}

      {activeTab === "estoque" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-sans text-3xl font-bold mb-2 text-primary">Estoque</h2>
            <p className="text-muted-foreground">Gerencie entrada e saída de produtos</p>
          </div>
          <InventoryManager />
        </div>
      )}

      {activeTab === "google" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-sans text-3xl font-bold mb-2 text-primary">Google Calendar</h2>
            <p className="text-muted-foreground">Sincronize seus agendamentos com o Google</p>
          </div>
          <GoogleCalendarManager />
        </div>
      )}

      {activeTab === "notificacoes" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-sans text-3xl font-bold mb-2 text-primary">Notificações</h2>
            <p className="text-muted-foreground">Configure notificações por email e WhatsApp</p>
          </div>
          <NotificationsManager />
        </div>
      )}

      {activeTab === "galeria" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-sans text-3xl font-bold mb-2 text-primary">Galeria</h2>
            <p className="text-muted-foreground">Gerencie as fotos do seu portfólio</p>
          </div>
          <GalleryManager />
        </div>
      )}

      {activeTab === "relatorios" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-sans text-3xl font-bold mb-2 text-primary">Relatórios</h2>
            <p className="text-muted-foreground">Analise o desempenho do seu negócio</p>
          </div>
          <Reports />
        </div>
      )}
    </div>
  )
}
