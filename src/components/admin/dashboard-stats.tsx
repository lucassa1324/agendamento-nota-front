"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBookingsFromStorage, getSettingsFromStorage } from "@/lib/booking-data"
import { Calendar, DollarSign, Users, TrendingUp } from "lucide-react"

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    monthRevenue: 0,
    agendaStatus: true,
  })

  useEffect(() => {
    const bookings = getBookingsFromStorage()
    const settings = getSettingsFromStorage()
    const today = new Date().toISOString().split("T")[0]
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const todayBookings = bookings.filter((b) => b.date === today).length

    const monthRevenue = bookings
      .filter((b) => {
        const bookingDate = new Date(b.date)
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
      })
      .reduce((sum, booking) => {
        const service = settings.services.find((s: any) => s.id === booking.serviceId)
        return sum + (service?.price || 0)
      }, 0)

    setStats({
      totalBookings: bookings.length,
      todayBookings,
      monthRevenue,
      agendaStatus: settings.agendaAberta,
    })
  }, [])

  const statCards = [
    {
      title: "Agendamentos Hoje",
      value: stats.todayBookings,
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      title: "Total de Agendamentos",
      value: stats.totalBookings,
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Faturamento do Mês",
      value: `R$ ${stats.monthRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-accent",
    },
    {
      title: "Status da Agenda",
      value: stats.agendaStatus ? "Aberta" : "Fechada",
      icon: TrendingUp,
      color: stats.agendaStatus ? "text-green-500" : "text-red-500",
    },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
