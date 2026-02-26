<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { clearSession, useSessionStore } from "@/features/auth/session";

const route = useRoute();
const { state, isAuthenticated } = useSessionStore();

const hideTopbar = computed(
  () => route.path === "/login" || route.path === "/register",
);
const isInternalTicketsRoute = computed(() =>
  route.path.startsWith("/internal/tickets"),
);

function logout(): void {
  clearSession({ redirect: true });
}
</script>

<template>
  <div class="app-shell">
    <div class="gradient-orb orb-one"></div>
    <div class="gradient-orb orb-two"></div>
    <div class="gradient-orb orb-three"></div>

    <header v-if="isAuthenticated && !hideTopbar" class="topbar">
      <div class="brand-block">
        <RouterLink to="/" class="brand-title">Autorent internal</RouterLink>
      </div>

      <nav v-if="state.isInternal" class="topbar-nav">
        <RouterLink to="/internal/tickets" class="tickets-link">Тикеты</RouterLink>
      </nav>

      <button type="button" class="btn btn-ghost" @click="logout">Выйти</button>
    </header>

    <main
      class="app-content"
      :class="{ 'auth-only': hideTopbar, 'internal-wide': isInternalTicketsRoute }"
    >
      <RouterView />
    </main>
  </div>
</template>
