import { createRouter, createWebHistory } from "vue-router";
import { ensureInternalRole } from "@/features/auth/roleResolver";
import { clearSession, useSessionStore } from "@/features/auth/session";
import AuthPage from "@/pages/AuthPage.vue";
import InternalTicketsPage from "@/pages/InternalTicketsPage.vue";
import TicketDetailsPage from "@/pages/TicketDetailsPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: () => {
        const { isAuthenticated } = useSessionStore();
        if (!isAuthenticated.value) {
          return "/login";
        }

        return "/internal/tickets";
      },
    },
    {
      path: "/login",
      name: "login",
      component: AuthPage,
      meta: { publicOnly: true, mode: "login" },
    },
    {
      path: "/register",
      name: "register",
      component: AuthPage,
      meta: { publicOnly: true, mode: "register" },
    },
    {
      path: "/internal/tickets",
      name: "internal-tickets",
      component: InternalTicketsPage,
      meta: { requiresAuth: true, requiresInternal: true },
    },
    {
      path: "/internal/tickets/:type/:id",
      name: "internal-ticket-details",
      component: TicketDetailsPage,
      meta: { requiresAuth: true, requiresInternal: true, internalView: true },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

router.beforeEach(async (to) => {
  const { isAuthenticated, state } = useSessionStore();

  if (to.meta.publicOnly) {
    return true;
  }

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return {
      path: "/login",
      query: { redirect: to.fullPath },
    };
  }

  if (isAuthenticated.value && !state.roleResolved) {
    try {
      await ensureInternalRole();
    } catch {
      return true;
    }
  }

  if (to.meta.requiresInternal) {
    let isInternal = false;
    try {
      isInternal = await ensureInternalRole();
    } catch {
      isInternal = false;
    }

    if (!isInternal) {
      clearSession();
      return "/login";
    }
  }

  return true;
});

export default router;
