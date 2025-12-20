"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSettingsFromStorage, type Service } from "@/lib/booking-data"
import { Clock } from "lucide-react"

type ServiceSelectorProps = {
  onSelect: (service: Service) => void
}

export function ServiceSelector({ onSelect }: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    const settings = getSettingsFromStorage()
    setServices(settings.services)
  }, [])

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold mb-6 text-center">Escolha o Serviço</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="border-border hover:border-accent transition-colors">
            <CardContent className="p-6">
              <h3 className="font-serif text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{service.description}</p>
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} min</span>
                </div>
                <div className="text-accent font-semibold text-lg">R$ {service.price}</div>
              </div>
              <Button onClick={() => onSelect(service)} className="w-full bg-accent hover:bg-accent/90">
                Selecionar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
