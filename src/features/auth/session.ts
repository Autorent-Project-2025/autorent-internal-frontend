import { computed, reactive } from "vue";

const TOKEN_KEY = "autorent_internal_token";
const INTERNAL_KEY = "autorent_internal_role";

interface SessionState {
  token: string | null;
  isInternal: boolean;
  roleResolved: boolean;
}

function parseInternalRole(raw: string | null): boolean | null {
  if (raw === "1") {
    return true;
  }

  if (raw === "0") {
    return false;
  }

  return null;
}

const persistedRole = parseInternalRole(localStorage.getItem(INTERNAL_KEY));

const state = reactive<SessionState>({
  token: localStorage.getItem(TOKEN_KEY),
  isInternal: persistedRole ?? false,
  roleResolved: persistedRole !== null,
});

export function useSessionStore() {
  const isAuthenticated = computed(() => Boolean(state.token));
  return { state, isAuthenticated };
}

export function getAccessToken(): string | null {
  return state.token;
}

export function setSessionToken(token: string): void {
  state.token = token;
  state.isInternal = false;
  state.roleResolved = false;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(INTERNAL_KEY);
}

export function setInternalRole(isInternal: boolean): void {
  state.isInternal = isInternal;
  state.roleResolved = true;
  localStorage.setItem(INTERNAL_KEY, isInternal ? "1" : "0");
}

export function clearSession(options?: { redirect?: boolean }): void {
  state.token = null;
  state.isInternal = false;
  state.roleResolved = false;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(INTERNAL_KEY);

  if (!options?.redirect) {
    return;
  }

  const currentPath = window.location.pathname;
  const isAuthPath = currentPath === "/login" || currentPath === "/register";
  if (!isAuthPath) {
    const fullPath = `${window.location.pathname}${window.location.search}`;
    const redirectTarget = encodeURIComponent(fullPath);
    window.location.assign(`/login?redirect=${redirectTarget}`);
  }
}
