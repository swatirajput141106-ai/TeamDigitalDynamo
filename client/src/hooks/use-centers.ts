import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useCenters() {
  return useQuery({
    queryKey: [api.centers.list.path],
    queryFn: async () => {
      const res = await fetch(api.centers.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch centers");
      return api.centers.list.responses[200].parse(await res.json());
    },
  });
}

export function useCenter(id: number) {
  return useQuery({
    queryKey: [api.centers.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.centers.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch center details");
      }
      return api.centers.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
