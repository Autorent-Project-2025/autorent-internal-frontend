<script setup lang="ts">
import TicketListPanel from "@/features/tickets/components/TicketListPanel.vue";
</script>

<template>
  <TicketListPanel details-base-path="/internal/tickets" :hide-header="true" />
</template>
