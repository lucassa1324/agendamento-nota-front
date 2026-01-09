"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@/lib/booking-data";

interface BookingStatusTabsProps {
  statusFilter: BookingStatus | "todos";
  setStatusFilter: (status: BookingStatus | "todos") => void;
  statusCounts: Record<string, number>;
}

export function BookingStatusTabs({
  statusFilter,
  setStatusFilter,
  statusCounts,
}: BookingStatusTabsProps) {
  const tabs = [
    { id: "todos", label: "Todos", color: "bg-gray-100 text-gray-600" },
    {
      id: "pendente",
      label: "Pendente",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      id: "confirmado",
      label: "Confirmado",
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "concluído",
      label: "Concluído",
      color: "bg-green-100 text-green-600",
    },
    {
      id: "cancelado",
      label: "Cancelado",
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={statusFilter === tab.id ? "default" : "outline"}
          onClick={() => setStatusFilter(tab.id as BookingStatus | "todos")}
          className={`h-9 px-4 rounded-full border-none transition-all ${
            statusFilter === tab.id ? "" : "bg-secondary/50 hover:bg-secondary"
          }`}
        >
          <span className="mr-2">{tab.label}</span>
          <Badge
            variant="secondary"
            className={`${tab.color} border-none font-bold`}
          >
            {statusCounts[tab.id as keyof typeof statusCounts]}
          </Badge>
        </Button>
      ))}
    </div>
  );
}
