import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertQueueEntry, type PredictWaitTimeRequest } from "@shared/routes";

// List Queue (for Admin or Public Display)
export function useQueue(centerId: number) {
  return useQuery({
    queryKey: [api.queue.list.path, centerId],
    queryFn: async () => {
      const url = buildUrl(api.queue.list.path, { centerId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch queue");
      return api.queue.list.responses[200].parse(await res.json());
    },
    enabled: !!centerId,
    refetchInterval: 5000, // Real-time updates every 5s
  });
}

// Join Queue
export function useJoinQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertQueueEntry) => {
      const res = await fetch(api.queue.join.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to join queue");
      }
      return api.queue.join.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.queue.list.path, variables.centerId] });
    },
  });
}

// Predict Wait Time (AI)
export function usePredictWaitTime() {
  return useMutation({
    mutationFn: async (data: PredictWaitTimeRequest) => {
      const res = await fetch(api.queue.predict.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to get prediction");
      return api.queue.predict.responses[200].parse(await res.json());
    },
  });
}

// Admin: Call Next
export function useCallNext() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (centerId: number) => {
      const url = buildUrl(api.queue.callNext.path, { centerId });
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to call next person");
      return api.queue.callNext.responses[200].parse(await res.json());
    },
    onSuccess: (_, centerId) => {
      queryClient.invalidateQueries({ queryKey: [api.queue.list.path, centerId] });
    },
  });
}

// Admin: Complete Service
export function useCompleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entryId, centerId }: { entryId: number; centerId: number }) => {
      const url = buildUrl(api.queue.complete.path, { entryId });
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to complete service");
      return api.queue.complete.responses[200].parse(await res.json());
    },
    onSuccess: (_, { centerId }) => {
      queryClient.invalidateQueries({ queryKey: [api.queue.list.path, centerId] });
    },
  });
}
