"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { getAvailableTimeSlots, type Service } from "@/lib/booking-data"

type TimeSlotSelectorProps = {
  service: Service
  date: string
  onTimeSelect: (time: string) => void
  onBack: () => void
}

export function TimeSlotSelector({ service, date, onTimeSelect, onBack }: TimeSlotSelectorProps) {
  const timeSlots = getAvailableTimeSlots(date, service.duration)
  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Card className="border-accent/20 bg-accent/5 p-4">
          <div className="text-sm">
            <div className="font-semibold">{service.name}</div>
            <div className="text-muted-foreground capitalize">{formattedDate}</div>
            <div className="text-muted-foreground mt-1">Duração: {service.duration} minutos</div>
          </div>
        </Card>
      </div>

      <h2 className="font-serif text-2xl font-bold mb-6 text-center">Escolha o Horário</h2>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {timeSlots.map((slot) => (
              <Button
                key={slot.time}
                onClick={() => onTimeSelect(slot.time)}
                disabled={!slot.available}
                variant={slot.available ? "outline" : "ghost"}
                className={
                  slot.available
                    ? "hover:bg-accent hover:text-accent-foreground hover:border-accent"
                    : "opacity-50 cursor-not-allowed"
                }
              >
                {slot.time}
              </Button>
            ))}
          </div>
          {timeSlots.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">Estúdio fechado nesta data.</p>
          )}
          {timeSlots.length > 0 && timeSlots.every((slot) => !slot.available) && (
            <p className="text-center text-muted-foreground mt-4">Nenhum horário disponível para esta data.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
