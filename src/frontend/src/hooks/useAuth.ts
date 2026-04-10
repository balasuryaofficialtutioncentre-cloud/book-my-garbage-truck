import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Role } from "../types";
import { useBackend } from "./useBackend";

export function useAuth() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { actor, isReady } = useBackend();
  const queryClient = useQueryClient();

  // Authenticated when we have an identity (including restored from storage)
  const isAuthenticated = !!identity;
  const principalId = identity?.getPrincipal().toText() ?? null;

  // Check if registered and fetch role
  const { data: roleData, isLoading: roleLoading } = useQuery<Role | null>({
    queryKey: ["myRole", principalId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await (
          actor as unknown as {
            getMyRole: () => Promise<{ ok?: string; err?: unknown }>;
          }
        ).getMyRole();
        if ("ok" in result && result.ok) {
          const r = result.ok as string;
          if (r === "owner" || r === "driver" || r === "customer")
            return r as Role;
        }
        return null;
      } catch {
        return null;
      }
    },
    enabled: isAuthenticated && isReady,
    staleTime: 30_000,
  });

  const registerMutation = useMutation({
    mutationFn: async (role: Role) => {
      if (!actor) throw new Error("Actor not ready");
      const candRole =
        role === "owner"
          ? { owner: null }
          : role === "driver"
            ? { driver: null }
            : { customer: null };
      await (
        actor as unknown as { register: (role: unknown) => Promise<unknown> }
      ).register(candRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myRole"] });
    },
  });

  const logout = () => {
    clear();
    queryClient.clear();
  };

  return {
    isAuthenticated,
    isLoading:
      isInitializing ||
      loginStatus === "logging-in" ||
      (isAuthenticated && roleLoading && isReady),
    role: roleData ?? null,
    principalId,
    login,
    logout,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
  };
}
