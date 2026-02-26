import { isAxiosError } from "axios";
import { probeInternalAccess } from "@/shared/api/ticketsApi";
import { clearSession, setInternalRole, useSessionStore } from "./session";

let pendingRolePromise: Promise<boolean> | null = null;

export async function ensureInternalRole(): Promise<boolean> {
  const { isAuthenticated, state } = useSessionStore();

  if (!isAuthenticated.value) {
    return false;
  }

  if (state.roleResolved) {
    return state.isInternal;
  }

  if (!pendingRolePromise) {
    pendingRolePromise = probeInternalAccess()
      .then((isInternal) => {
        setInternalRole(isInternal);
        return isInternal;
      })
      .catch((error: unknown) => {
        if (isAxiosError(error) && error.response?.status === 401) {
          clearSession({ redirect: true });
          return false;
        }

        throw error;
      })
      .finally(() => {
        pendingRolePromise = null;
      });
  }

  return pendingRolePromise;
}
