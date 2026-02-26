<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { computed, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import {
  ticketStatusLabel,
  ticketTypeLabel,
  toApiTicketType,
  toRouteTicketType,
} from "@/entities/ticket/mappers";
import type { TicketApiType, TicketListItem } from "@/entities/ticket/types";
import { getAllTickets } from "@/shared/api/ticketsApi";
import { getApiErrorMessage } from "@/shared/lib/apiError";
import { formatDateTime } from "@/shared/lib/formatters";

interface TicketListPanelProps {
  title?: string;
  subtitle?: string;
  detailsBasePath: "/internal/tickets";
  hideHeader?: boolean;
}

const props = defineProps<TicketListPanelProps>();
const router = useRouter();

const filters = reactive({
  type: "",
  page: 1,
  pageSize: 20,
});

watch(
  () => [filters.type, filters.pageSize],
  () => {
    filters.page = 1;
  },
);

const ticketsQuery = useQuery(
  computed(() => ({
    queryKey: [
      "tickets",
      "all",
      {
        type: filters.type,
        page: filters.page,
        pageSize: filters.pageSize,
      },
    ],
    queryFn: async () => {
      const type = toApiTicketType(filters.type);
      const request = {
        page: filters.page,
        pageSize: filters.pageSize,
        ...(type ? { type } : {}),
      };

      return getAllTickets(request);
    },
  })),
);

const items = computed(() => ticketsQuery.data.value?.items ?? []);
const page = computed(() => ticketsQuery.data.value?.page ?? filters.page);
const totalPages = computed(() => ticketsQuery.data.value?.totalPages ?? 1);
const totalCount = computed(() => ticketsQuery.data.value?.totalCount ?? 0);
const isInitialLoading = computed(
  () =>
    ticketsQuery.isPending.value &&
    !ticketsQuery.data.value &&
    !ticketsQuery.error.value,
);

const knownTypes: TicketApiType[] = ["AccountRegister", "BookingCancel", "Withdrawal"];

const errorMessage = computed(() => {
  if (!ticketsQuery.error.value) {
    return "";
  }

  return getApiErrorMessage(
    ticketsQuery.error.value,
    {
      400: "Некорректные фильтры или пагинация. Проверьте значения page и pageSize.",
      401: "Сессия истекла. Выполните вход снова.",
      403: "Нет прав на internal-список.",
    },
    "Не удалось загрузить список тикетов.",
  );
});

function onOpenDetails(ticket: TicketListItem): void {
  router.push(`${props.detailsBasePath}/${toRouteTicketType(ticket.type)}/${ticket.id}`);
}

function onPrevPage(): void {
  filters.page = Math.max(1, page.value - 1);
}

function onNextPage(): void {
  filters.page = Math.min(totalPages.value, page.value + 1);
}
</script>

<template>
  <section class="page panel" style="padding: 1.2rem">
    <header v-if="!hideHeader" class="panel-header">
      <div>
        <h1 class="section-title">{{ title || "Тикеты" }}</h1>
        <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
      </div>
      <p class="muted-text">Всего: {{ totalCount }}</p>
    </header>

    <div class="form-grid" style="margin-bottom: 1rem">
      <label class="field">
        <span class="field-label">Тип тикета</span>
        <select v-model="filters.type" class="field-select">
          <option value="">Все типы</option>
          <option v-for="type in knownTypes" :key="type" :value="type">
            {{ ticketTypeLabel(type) }}
          </option>
        </select>
      </label>

      <label class="field">
        <span class="field-label">Размер страницы</span>
        <select v-model.number="filters.pageSize" class="field-select">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
          <option :value="200">200</option>
        </select>
      </label>
    </div>

    <p v-if="errorMessage" class="error-box">{{ errorMessage }}</p>

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isInitialLoading">
            <td colspan="6" class="muted-text">Загружаю тикеты...</td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td colspan="6" class="muted-text">Тикеты не найдены.</td>
          </tr>
          <tr
            v-for="(ticket, index) in items"
            :key="ticket.id"
            class="clickable row-reveal"
            :style="{ '--row-index': String(index) }"
            @click="onOpenDetails(ticket)"
          >
            <td>#{{ ticket.id }}</td>
            <td>{{ ticket.title }}</td>
            <td>{{ ticketTypeLabel(ticket.type) }}</td>
            <td>
              <span class="status-pill" :class="`status-${ticket.status}`">
                {{ ticketStatusLabel(ticket.status) }}
              </span>
            </td>
            <td>{{ ticket.ownerEmail }}</td>
            <td>{{ formatDateTime(ticket.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination">
      <p class="muted-text">Страница {{ page }} / {{ totalPages }}</p>
      <div class="inline-actions">
        <button type="button" class="btn btn-secondary" :disabled="page <= 1" @click="onPrevPage">
          Назад
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="page >= totalPages"
          @click="onNextPage"
        >
          Далее
        </button>
      </div>
    </footer>
  </section>
</template>
