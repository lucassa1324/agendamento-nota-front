"use client";

import { Calendar, Save, Trash2, Ban, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  type DaySchedule,
  getWeekSchedule,
  saveWeekSchedule,
  getBlockedPeriods,
  saveBlockedPeriods,
  type BlockedPeriod,
} from "@/lib/booking-data";

export function ScheduleManager() {
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([]);
  const [initialSchedule, setInitialSchedule] = useState<string>("");
  const [globalInterval, setGlobalInterval] = useState<number>(30);
  const [initialInterval, setInitialInterval] = useState<number>(30);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [initialBlocked, setInitialBlocked] = useState<string>("");
  const [newBlocked, setNewBlocked] = useState<Partial<BlockedPeriod>>({
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
  });
  const { toast } = useToast();

  const loadSchedule = useCallback(() => {
    const schedule = getWeekSchedule();
    const blocked = getBlockedPeriods();
    setWeekSchedule(schedule);
    setInitialSchedule(JSON.stringify(schedule));
    setBlockedPeriods(blocked);
    setInitialBlocked(JSON.stringify(blocked));
    
    // Pegar o intervalo do primeiro dia aberto como padrão para o select global
    const firstOpenDay = schedule.find(d => d.isOpen);
    if (firstOpenDay) {
      setGlobalInterval(firstOpenDay.interval);
      setInitialInterval(firstOpenDay.interval);
    }
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const saveInterval = () => {
    const updatedSchedule = weekSchedule.map(day => ({
      ...day,
      interval: globalInterval
    }));
    saveWeekSchedule(updatedSchedule);
    setWeekSchedule(updatedSchedule);
    setInitialSchedule(JSON.stringify(updatedSchedule));
    setInitialInterval(globalInterval);
    
    toast({
      title: "Intervalo Atualizado!",
      description: `O intervalo de ${globalInterval} minutos foi aplicado e salvo.`,
      className: "bg-blue-600 text-white border-none",
    });
  };

  const saveSchedule = () => {
    saveWeekSchedule(weekSchedule);
    setInitialSchedule(JSON.stringify(weekSchedule));
    toast({
      title: "Horários Salvos!",
      description: "As configurações de abertura e fechamento foram atualizadas.",
      className: "bg-green-600 text-white border-none",
    });
  };

  const saveBlocked = () => {
    saveBlockedPeriods(blockedPeriods);
    setInitialBlocked(JSON.stringify(blockedPeriods));
    toast({
      title: "Bloqueios Atualizados!",
      description: "A lista de períodos bloqueados foi salva com sucesso.",
      className: "bg-orange-600 text-white border-none",
    });
  };

  const isScheduleDirty = initialSchedule !== JSON.stringify(weekSchedule);
  const isIntervalDirty = globalInterval !== initialInterval;
  const isBlockedDirty = initialBlocked !== JSON.stringify(blockedPeriods);

  const addBlockedPeriod = () => {
    if (!newBlocked.date) {
      toast({
        title: "Erro",
        description: "Selecione uma data para o bloqueio.",
        variant: "destructive",
      });
      return;
    }

    const blocked: BlockedPeriod = {
      id: Math.random().toString(36).substr(2, 9),
      date: newBlocked.date as string,
      startTime: newBlocked.startTime,
      endTime: newBlocked.endTime,
      reason: newBlocked.reason,
    };

    const updated = [...blockedPeriods, blocked];
    setBlockedPeriods(updated);
    setNewBlocked({ date: "", startTime: "", endTime: "", reason: "" });
  };

  const addFullDayBlock = () => {
    if (!newBlocked.date) {
      toast({
        title: "Erro",
        description: "Selecione uma data para bloquear o dia todo.",
        variant: "destructive",
      });
      return;
    }

    const blocked: BlockedPeriod = {
      id: Math.random().toString(36).substr(2, 9),
      date: newBlocked.date as string,
      reason: newBlocked.reason || "Dia todo bloqueado",
    };

    const updated = [...blockedPeriods, blocked];
    setBlockedPeriods(updated);
    setNewBlocked({ date: "", startTime: "", endTime: "", reason: "" });
  };

  const removeBlockedPeriod = (id: string) => {
    setBlockedPeriods(prev => prev.filter(p => p.id !== id));
  };

  const updateDaySchedule = (
    dayOfWeek: number,
    field: keyof DaySchedule,
    value: string | boolean | number,
  ) => {
    setWeekSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day,
      ),
    );
  };

  const applyToAll = (sourceDay: DaySchedule) => {
    setWeekSchedule((prev) =>
      prev.map((day) => ({
        ...day,
        isOpen: sourceDay.isOpen,
        openTime: sourceDay.openTime,
        lunchStart: sourceDay.lunchStart,
        lunchEnd: sourceDay.lunchEnd,
        closeTime: sourceDay.closeTime,
      })),
    );
    toast({
      title: "Aplicado a todos os dias",
      description: `Configurações de ${sourceDay.dayName} aplicadas a todos os dias da semana.`,
      className: "bg-blue-600 text-white border-none",
    });
  };

  const applyToWeekdays = (sourceDay: DaySchedule) => {
    setWeekSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek >= 1 && day.dayOfWeek <= 5
          ? {
              ...day,
              isOpen: sourceDay.isOpen,
              openTime: sourceDay.openTime,
              lunchStart: sourceDay.lunchStart,
              lunchEnd: sourceDay.lunchEnd,
              closeTime: sourceDay.closeTime,
            }
          : day,
      ),
    );
    toast({
      title: "Aplicado aos dias úteis",
      description: `Configurações de ${sourceDay.dayName} aplicadas de Segunda a Sexta.`,
      className: "bg-blue-600 text-white border-none",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Configurações da Agenda</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie horários semanais, intervalos e bloqueios de datas
          </p>
        </div>
        <Button
          onClick={saveSchedule}
          disabled={!isScheduleDirty}
          className={`transition-all duration-300 ${
            isScheduleDirty 
              ? "bg-green-600 hover:bg-green-700 text-white shadow-lg scale-105" 
              : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
          }`}
        >
          <Save className="w-4 h-4 mr-2" />
          {isScheduleDirty ? "Salvar Horários Semanais" : "Horários Salvos"}
        </Button>
      </div>

      
      <div className="mb-8 bg-card/50 p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-6 bg-primary rounded-full" />
          <span className="text-lg font-bold">Intervalo de Atendimento</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <Label htmlFor="global-interval" className="text-sm font-medium text-muted-foreground">
              Tempo entre agendamentos (minutos)
            </Label>
            <div className="flex gap-2">
              <Select 
                value={globalInterval.toString()} 
                onValueChange={(value) => setGlobalInterval(Number.parseInt(value, 10))}
              >
                <SelectTrigger id="global-interval" className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={saveInterval}
                disabled={!isIntervalDirty}
                className={`transition-all duration-300 ${
                  isIntervalDirty 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                    : "bg-muted text-muted-foreground opacity-50"
                }`}
              >
                <Save className="w-4 h-4 mr-2" />
                {isIntervalDirty ? "Salvar Intervalo" : "Salvo"}
              </Button>
            </div>
          </div>
        </div>
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
                  <div className="hidden md:flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyToAll(day)}
                      className="h-8 text-xs px-3 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
                    >
                      Copiar p/ Todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyToWeekdays(day)}
                      className="h-8 text-xs px-3 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
                    >
                      Copiar p/ Dias Úteis
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {day.isOpen ? "Aberto" : "Fechado"}
                    </span>
                    <Switch
                      checked={day.isOpen}
                      onCheckedChange={(checked) =>
                        updateDaySchedule(day.dayOfWeek, "isOpen", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              {day.isOpen && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      onChange={(e) =>
                        updateDaySchedule(
                          day.dayOfWeek,
                          "openTime",
                          e.target.value,
                        )
                      }
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
                      onChange={(e) =>
                        updateDaySchedule(
                          day.dayOfWeek,
                          "lunchStart",
                          e.target.value,
                        )
                      }
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
                      onChange={(e) =>
                        updateDaySchedule(
                          day.dayOfWeek,
                          "lunchEnd",
                          e.target.value,
                        )
                      }
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
                      onChange={(e) =>
                        updateDaySchedule(
                          day.dayOfWeek,
                          "closeTime",
                          e.target.value,
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ban className="w-6 h-6 text-destructive" />
            <h2 className="text-2xl font-bold">Bloqueios de Agenda</h2>
          </div>
          <Button
            onClick={saveBlocked}
            disabled={!isBlockedDirty}
            className={`transition-all duration-300 ${
              isBlockedDirty 
                ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg scale-105" 
                : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
            }`}
          >
            <Save className="w-4 h-4 mr-2" />
            {isBlockedDirty ? "Salvar Alterações de Bloqueio" : "Bloqueios Salvos"}
          </Button>
        </div>
        
        <Card className="bg-card/50 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Novo Bloqueio</CardTitle>
            <p className="text-sm text-muted-foreground">
              Bloqueie datas específicas ou horários em que você não estará disponível.
            </p>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input 
                    type="date" 
                    value={newBlocked.date} 
                    onChange={e => setNewBlocked(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Início (opcional)</Label>
                  <Input 
                    type="time" 
                    value={newBlocked.startTime} 
                    onChange={e => setNewBlocked(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim (opcional)</Label>
                  <Input 
                    type="time" 
                    value={newBlocked.endTime} 
                    onChange={e => setNewBlocked(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
                <Button onClick={addBlockedPeriod} variant="outline" className="w-full">
                  <Ban className="w-4 h-4 mr-2" />
                  Bloquear Horário
                </Button>
                <Button onClick={addFullDayBlock} className="w-full bg-destructive hover:bg-destructive/90 text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Bloquear Dia Inteiro
                </Button>
              </div>
            <div className="mt-4">
              <Label>Motivo (opcional)</Label>
              <Input 
                placeholder="Ex: Feriado, Consulta médica..." 
                value={newBlocked.reason}
                onChange={e => setNewBlocked(prev => ({ ...prev, reason: e.target.value }))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {blockedPeriods.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
              Nenhum bloqueio configurado.
            </p>
          ) : (
            blockedPeriods.sort((a, b) => a.date.localeCompare(b.date)).map(block => (
              <Card key={block.id} className="bg-background/50 overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-destructive/10 p-2 rounded-full">
                      <Ban className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {new Date(block.date + "T00:00:00").toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {block.startTime && block.endTime 
                          ? `Das ${block.startTime} até ${block.endTime}` 
                          : "O dia todo"}
                        {block.reason && ` • ${block.reason}`}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeBlockedPeriod(block.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
