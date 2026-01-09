"use client";

import { CalendarDays, Clock3, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BookingFiltersProps {
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  filterDay: string;
  setFilterDay: (date: string) => void;
  filterName: string;
  setFilterName: (name: string) => void;
  filterTime: string;
  setFilterTime: (time: string) => void;
  onRefresh: () => void;
}

export function BookingFilters({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  filterDay,
  setFilterDay,
  filterName,
  setFilterName,
  filterTime,
  setFilterTime,
  onRefresh,
}: BookingFiltersProps) {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Data inicial
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-background h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Data final
            </Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-background h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Filtrar por dia
            </Label>
            <div className="relative">
              <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="pl-9 bg-background h-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Filtrar por nome
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ex.: Maria"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="pl-9 bg-background h-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Filtrar por horário
            </Label>
            <div className="relative">
              <Clock3 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="HH:MM"
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                className="pl-9 bg-background h-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onRefresh}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
