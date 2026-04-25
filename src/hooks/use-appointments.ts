"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addDays,
  endOfDay,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { appointmentService, type Appointment } from "@/lib/api-appointments";

export type AppointmentsViewMode = "day" | "week" | "month";

type UseAppointmentsParams = {
  companyId?: string;
  viewMode: AppointmentsViewMode;
  date?: Date;
  resourceId?: string;
  includeOpportunities?: boolean;
  audience?: "admin" | "employee";
};

const getRange = (date: Date, viewMode: AppointmentsViewMode) => {
  const start = startOfDay(date);
  const span = viewMode === "day" ? 1 : viewMode === "week" ? 7 : 31;
  const end = endOfDay(addDays(start, span - 1));
  return { start, end };
};

const getQueryKey = (
  companyId: string,
  viewMode: AppointmentsViewMode,
  date: Date,
  resourceId?: string,
) => [
  "appointments",
  companyId,
  viewMode,
  format(startOfDay(date), "yyyy-MM-dd"),
  resourceId ?? "all",
] as const;

export function useAppointments({
  companyId,
  viewMode,
  date = new Date(),
  resourceId,
  includeOpportunities = false,
  audience = "admin",
}: UseAppointmentsParams) {
  const queryClient = useQueryClient();
  const enabled = Boolean(companyId);
  const selectedDate = startOfDay(date);

  const appointmentsQuery = useQuery({
    queryKey: companyId
      ? getQueryKey(companyId, viewMode, selectedDate, resourceId)
      : ["appointments", "disabled"],
    enabled,
    queryFn: async () => {
      if (!companyId) return [] as Appointment[];
      const { start, end } = getRange(selectedDate, viewMode);
      const rows =
        audience === "employee"
          ? await (async () => {
              const days: Date[] = [];
              const totalDays =
                viewMode === "day" ? 1 : viewMode === "week" ? 7 : 31;
              for (let index = 0; index < totalDays; index += 1) {
                days.push(addDays(startOfDay(selectedDate), index));
              }
              const batches = await Promise.all(
                days.map((day) =>
                  appointmentService.listMyDaily(companyId, day.toISOString()),
                ),
              );
              return batches.flat();
            })()
          : await appointmentService.listByCompanyAdmin(
              companyId,
              start.toISOString(),
              end.toISOString(),
            );
      if (!resourceId) return rows;
      return rows.filter((item) => item.staffId === resourceId);
    },
  });

  const opportunitiesQuery = useQuery({
    queryKey: ["opportunities", companyId],
    enabled: enabled && includeOpportunities,
    queryFn: async () => {
      if (!companyId) return [] as Appointment[];
      return appointmentService.listMyOpportunities(companyId);
    },
  });

  const claimMutation = useMutation({
    mutationFn: async ({ id, expectedVersion }: { id: string; expectedVersion: number }) => {
      if (!companyId) throw new Error("Empresa não definida.");
      return appointmentService.claimOpportunity(id, companyId, expectedVersion);
    },
    onMutate: async ({ id }) => {
      if (!companyId) return;
      await queryClient.cancelQueries({ queryKey: ["opportunities", companyId] });
      const previousOpportunities = queryClient.getQueryData<Appointment[]>([
        "opportunities",
        companyId,
      ]);
      const previousAppointments = queryClient.getQueriesData<Appointment[]>({
        queryKey: ["appointments", companyId],
      });

      const claimed = previousOpportunities?.find((item) => item.id === id);
      queryClient.setQueryData<Appointment[]>(["opportunities", companyId], (current) =>
        (current ?? []).filter((item) => item.id !== id),
      );

      if (claimed) {
        queryClient.setQueriesData<Appointment[]>(
          { queryKey: ["appointments", companyId] },
          (current) => {
            const list = current ?? [];
            if (list.some((item) => item.id === claimed.id)) return list;
            return [...list, claimed];
          },
        );
      }

      return { previousOpportunities, previousAppointments };
    },
    onError: (_error, _variables, context) => {
      if (!companyId || !context) return;
      queryClient.setQueryData(["opportunities", companyId], context.previousOpportunities);
      context.previousAppointments.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },
    onSettled: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({ queryKey: ["appointments", companyId] });
      queryClient.invalidateQueries({ queryKey: ["opportunities", companyId] });
    },
  });

  const overrideMutation = useMutation({
    mutationFn: async ({
      id,
      professionalId,
      expectedVersion,
      scheduledAt,
    }: {
      id: string;
      professionalId: string;
      expectedVersion: number;
      scheduledAt?: string;
    }) =>
      appointmentService.overrideAssignment(id, {
        professionalId,
        expectedVersion,
        scheduledAt,
      }),
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({ queryKey: ["appointments", companyId] });
      queryClient.invalidateQueries({ queryKey: ["opportunities", companyId] });
    },
  });

  const prefetchNextDays = async (days = 2) => {
    if (!companyId || viewMode !== "day") return;
    for (let index = 1; index <= days; index += 1) {
      const nextDate = addDays(selectedDate, index);
      await queryClient.prefetchQuery({
        queryKey: getQueryKey(companyId, "day", nextDate, resourceId),
        queryFn: async () => {
          const rows =
            audience === "employee"
              ? await appointmentService.listMyDaily(companyId, nextDate.toISOString())
              : await (async () => {
                  const { start, end } = getRange(nextDate, "day");
                  return appointmentService.listByCompanyAdmin(
                    companyId,
                    start.toISOString(),
                    end.toISOString(),
                  );
                })();
          if (!resourceId) return rows;
          return rows.filter((item) => item.staffId === resourceId);
        },
      });
    }
  };

  const weeklyGrouped = (appointmentsQuery.data ?? []).reduce<Record<string, Appointment[]>>(
    (acc, item) => {
      const key = format(parseISO(item.scheduledAt), "yyyy-MM-dd");
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {},
  );

  return {
    appointments: appointmentsQuery.data ?? [],
    opportunities: opportunitiesQuery.data ?? [],
    weeklyGrouped,
    isLoading:
      appointmentsQuery.isLoading ||
      (includeOpportunities ? opportunitiesQuery.isLoading : false),
    isRefreshing: appointmentsQuery.isFetching,
    refetch: appointmentsQuery.refetch,
    prefetchNextDays,
    claimOpportunity: claimMutation.mutateAsync,
    claimInFlightId: claimMutation.variables?.id ?? null,
    overrideAssignment: overrideMutation.mutateAsync,
    overrideInFlightId: overrideMutation.variables?.id ?? null,
  };
}
