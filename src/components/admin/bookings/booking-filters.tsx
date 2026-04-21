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
    <Card className="rounded-[1.35rem] border-0 bg-white/90 shadow-sm backdrop-blur-sm">
      <CardContent className="p-5 md:p-6">
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Data inicial
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-11 rounded-xl border-0 bg-muted/40 shadow-none ring-1 ring-border/30 focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Data final
            </Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-11 rounded-xl border-0 bg-muted/40 shadow-none ring-1 ring-border/30 focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Filtrar por dia
            </Label>
            <div className="relative">
              <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="h-11 rounded-xl border-0 bg-muted/40 pl-9 shadow-none ring-1 ring-border/30 focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Filtrar por nome
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ex.: Maria"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="h-11 rounded-xl border-0 bg-muted/40 pl-9 shadow-none ring-1 ring-border/30 focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Filtrar por horário
            </Label>
            <div className="relative">
              <Clock3 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="HH:MM"
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                className="h-11 rounded-xl border-0 bg-muted/40 pl-9 shadow-none ring-1 ring-border/30 focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onRefresh}
              className="h-11 w-full rounded-xl bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-sm transition-all duration-200 hover:brightness-105"
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
