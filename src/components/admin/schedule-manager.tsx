"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getWeekSchedule, saveWeekSchedule, type DaySchedule } from "@/lib/booking-data"
import { Calendar, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ScheduleManager() {
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadSchedule()
  }, [])

  const loadSchedule = () => {
    const schedule = getWeekSchedule()
    setWeekSchedule(schedule)
  }

  const saveSchedule = () => {
    saveWeekSchedule(weekSchedule)
    toast({
      title: "Configurações salvas",
      description: "Os horários foram atualizados com sucesso",
    })
  }

  const updateDaySchedule = (dayOfWeek: number, field: keyof DaySchedule, value: any) => {
    setWeekSchedule((prev) => prev.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day)))
  }

  const applyToAllDays = (sourceDay: DaySchedule) => {
    setWeekSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === 0 || day.dayOfWeek === 6
          ? day
          : {
              ...day,
              openTime: sourceDay.openTime,
              lunchStart: sourceDay.lunchStart,
              lunchEnd: sourceDay.lunchEnd,
              closeTime: sourceDay.closeTime,
              interval: sourceDay.interval,
            },
      ),
    )
    toast({
      title: "Aplicado a todos os dias",
      description: "As configurações foram aplicadas aos dias úteis",
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Configurações da Agenda</h2>
          <p className="text-sm text-muted-foreground">Configure horários de funcionamento, intervalos e almoço</p>
        </div>
        <Button onClick={saveSchedule} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Salvar Todas
        </Button>
      </div>

      <div className="space-y-4">
        {weekSchedule.map((day) => (
          <Card key={day.dayOfWeek} className="bg-background/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">{day.dayName}</h3>
                </div>
                <div className="flex items-center gap-4">
                  {day.dayOfWeek >= 1 && day.dayOfWeek <= 5 && (
                    <Button variant="outline" size="sm" onClick={() => applyToAllDays(day)}>
                      Aplicar a todos
                    </Button>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{day.isOpen ? "Aberto" : "Fechado"}</span>
                    <Switch
                      checked={day.isOpen}
                      onCheckedChange={(checked) => updateDaySchedule(day.dayOfWeek, "isOpen", checked)}
                    />
                  </div>
                </div>
              </div>

              {day.isOpen && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <Label
                      htmlFor={`open-${day.dayOfWeek}`}
                      className="text-xs text-muted-foreground mb-1 flex items-center gap-1"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      Horário de Abertura
                    </Label>
                    <Input
                      id={`open-${day.dayOfWeek}`}
                      type="time"
                      value={day.openTime}
                      onChange={(e) => updateDaySchedule(day.dayOfWeek, "openTime", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor={`lunch-start-${day.dayOfWeek}`}
                      className="text-xs text-muted-foreground mb-1 flex items-center gap-1"
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      Início do Almoço
                    </Label>
                    <Input
                      id={`lunch-start-${day.dayOfWeek}`}
                      type="time"
                      value={day.lunchStart}
                      onChange={(e) => updateDaySchedule(day.dayOfWeek, "lunchStart", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor={`lunch-end-${day.dayOfWeek}`}
                      className="text-xs text-muted-foreground mb-1 flex items-center gap-1"
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      Fim do Almoço
                    </Label>
                    <Input
                      id={`lunch-end-${day.dayOfWeek}`}
                      type="time"
                      value={day.lunchEnd}
                      onChange={(e) => updateDaySchedule(day.dayOfWeek, "lunchEnd", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor={`close-${day.dayOfWeek}`}
                      className="text-xs text-muted-foreground mb-1 flex items-center gap-1"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      Horário de Fechamento
                    </Label>
                    <Input
                      id={`close-${day.dayOfWeek}`}
                      type="time"
                      value={day.closeTime}
                      onChange={(e) => updateDaySchedule(day.dayOfWeek, "closeTime", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor={`interval-${day.dayOfWeek}`}
                      className="text-xs text-muted-foreground mb-1 flex items-center gap-1"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Intervalo (minutos)
                    </Label>
                    <Select
                      value={day.interval.toString()}
                      onValueChange={(value) => updateDaySchedule(day.dayOfWeek, "interval", Number.parseInt(value))}
                    >
                      <SelectTrigger id={`interval-${day.dayOfWeek}`} className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="60">60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
