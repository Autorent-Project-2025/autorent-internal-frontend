<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { isAxiosError } from "axios";
import { computed, reactive, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { z } from "zod";
import {
  isRouteTicketType,
  ticketStatusLabel,
  ticketTypeLabel,
} from "@/entities/ticket/mappers";
import type { TicketRouteType, TicketStatus } from "@/entities/ticket/types";
import { useSessionStore } from "@/features/auth/session";
import {
  approveAccountRegisterTicket,
  getTicketDetails,
  updateTicket,
} from "@/shared/api/ticketsApi";
import { getApiErrorMessage } from "@/shared/lib/apiError";
import { formatDateTime, formatMoney } from "@/shared/lib/formatters";

const route = useRoute();
const queryClient = useQueryClient();
const { state } = useSessionStore();

const rawType = computed(() => String(route.params.type ?? ""));
const routeType = computed<TicketRouteType | null>(() => {
  return isRouteTicketType(rawType.value) ? rawType.value : null;
});

const ticketId = computed(() => Number(route.params.id));
const hasValidParams = computed(() => {
  return routeType.value !== null && Number.isInteger(ticketId.value) && ticketId.value > 0;
});

const backPath = computed(() => "/internal/tickets");
const canManage = computed(() => state.isInternal === true);

const updateForm = reactive({
  status: 0,
  managerComments: "",
});

const actionError = ref("");
const actionSuccess = ref("");

const detailsQuery = useQuery(
  computed(() => ({
    queryKey: ["ticket", "details", routeType.value, ticketId.value],
    queryFn: async () => {
      if (!routeType.value) {
        throw new Error("Некорректный тип тикета.");
      }

      return getTicketDetails(routeType.value, ticketId.value);
    },
    enabled: hasValidParams.value,
  })),
);

watch(
  () => detailsQuery.data.value,
  (ticket) => {
    if (!ticket) {
      return;
    }

    updateForm.status = ticket.status;
    updateForm.managerComments = ticket.managerComments ?? "";
  },
  { immediate: true },
);

const updateSchema = z.object({
  status: z.coerce.number().int().min(0).max(2),
  managerComments: z.string().trim().min(1, "managerComments обязателен"),
});

const updateMutation = useMutation({
  mutationFn: async () => {
    if (!routeType.value) {
      throw new Error("Некорректный тип тикета.");
    }

    const parsed = updateSchema.safeParse({
      status: updateForm.status,
      managerComments: updateForm.managerComments,
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Ошибка валидации update.");
    }

    await updateTicket(routeType.value, {
      ticketId: ticketId.value,
      status: parsed.data.status as TicketStatus,
      managerComments: parsed.data.managerComments,
    });
  },
});

const approveMutation = useMutation({
  mutationFn: async () => {
    if (!routeType.value) {
      throw new Error("Некорректный тип тикета.");
    }

    if (routeType.value !== "account-register") {
      throw new Error("Approve доступен только для Account Register.");
    }

    await approveAccountRegisterTicket(ticketId.value);
  },
});

const detailsError = computed(() => {
  if (!detailsQuery.error.value) {
    return "";
  }

  return getApiErrorMessage(
    detailsQuery.error.value,
    {
      401: "Сессия истекла. Войдите заново.",
      403: "Нет доступа",
      404: "Тикет не найден",
    },
    "Не удалось загрузить детали тикета.",
  );
});

async function onUpdate(): Promise<void> {
  actionError.value = "";
  actionSuccess.value = "";

  try {
    await updateMutation.mutateAsync();
    actionSuccess.value = "Статус тикета обновлен.";
    await queryClient.invalidateQueries({
      queryKey: ["ticket", "details", routeType.value, ticketId.value],
    });
    await queryClient.invalidateQueries({ queryKey: ["tickets"] });
  } catch (error: unknown) {
    if (!isAxiosError(error) && error instanceof Error) {
      actionError.value = error.message;
      return;
    }

    actionError.value = getApiErrorMessage(
      error,
      {
        400: "Ошибка валидации. Проверьте status и managerComments.",
        401: "Требуется авторизация.",
        403: "Нет прав на update этой заявки.",
        404: "Тикет не найден.",
      },
      "Не удалось обновить тикет.",
    );
  }
}

async function onApprove(): Promise<void> {
  actionError.value = "";
  actionSuccess.value = "";

  try {
    await approveMutation.mutateAsync();
    actionSuccess.value = "Тикет подтвержден.";
    await queryClient.invalidateQueries({
      queryKey: ["ticket", "details", routeType.value, ticketId.value],
    });
    await queryClient.invalidateQueries({ queryKey: ["tickets"] });
  } catch (error: unknown) {
    if (!isAxiosError(error) && error instanceof Error) {
      actionError.value = error.message;
      return;
    }

    actionError.value = getApiErrorMessage(
      error,
      {
        401: "Требуется авторизация.",
        403: "Нет прав на approve этой заявки.",
        404: "Тикет не найден.",
      },
      "Не удалось подтвердить тикет.",
    );
  }
}
</script>

<template>
  <section class="page panel" style="padding: 1.2rem">
    <header class="panel-header">
      <div>
        <h1 class="section-title">Детали тикета</h1>
        <p class="section-subtitle">Просмотр деталей и internal-действия по выбранной заявке.</p>
      </div>
      <RouterLink :to="backPath" class="btn btn-secondary">Назад к списку</RouterLink>
    </header>

    <p v-if="!hasValidParams" class="error-box">Неверный формат URL тикета.</p>
    <p v-else-if="detailsError" class="error-box">{{ detailsError }}</p>
    <p v-if="actionError" class="error-box">{{ actionError }}</p>
    <p v-if="actionSuccess" class="success-box">{{ actionSuccess }}</p>

    <div v-if="detailsQuery.isPending.value" class="muted-text">Загружаю детали тикета...</div>

    <div v-else-if="detailsQuery.data.value" class="stack">
      <div class="detail-grid">
        <article class="panel" style="padding: 1rem">
          <h2 class="section-title" style="font-size: 1.2rem; margin-bottom: 0.8rem">Основное</h2>
          <dl class="kv-list">
            <div class="kv-row">
              <dt class="kv-key">ID</dt>
              <dd class="kv-value">#{{ detailsQuery.data.value.id }}</dd>
            </div>
            <div class="kv-row">
              <dt class="kv-key">Title</dt>
              <dd class="kv-value">{{ detailsQuery.data.value.title }}</dd>
            </div>
            <div class="kv-row">
              <dt class="kv-key">Description</dt>
              <dd class="kv-value">{{ detailsQuery.data.value.description }}</dd>
            </div>
            <div class="kv-row">
              <dt class="kv-key">Type</dt>
              <dd class="kv-value">{{ ticketTypeLabel(detailsQuery.data.value.type) }}</dd>
            </div>
            <div class="kv-row">
              <dt class="kv-key">Status</dt>
              <dd class="kv-value">
                <span class="status-pill" :class="`status-${detailsQuery.data.value.status}`">
                  {{ ticketStatusLabel(detailsQuery.data.value.status) }}
                </span>
              </dd>
            </div>
            <div class="kv-row">
              <dt class="kv-key">Owner Email</dt>
              <dd class="kv-value">{{ detailsQuery.data.value.ownerEmail || "Not set" }}</dd>
            </div>
            <div class="kv-row">
              <dt class="kv-key">Created At</dt>
              <dd class="kv-value">{{ formatDateTime(detailsQuery.data.value.createdAt) }}</dd>
            </div>
            <div class="kv-row">
              <dt class="kv-key">Updated At</dt>
              <dd class="kv-value">{{ formatDateTime(detailsQuery.data.value.updatedAt) }}</dd>
            </div>
          </dl>
        </article>

        <article class="panel" style="padding: 1rem">
          <h2 class="section-title" style="font-size: 1.2rem; margin-bottom: 0.8rem">
            Дополнительно
          </h2>
          <dl class="kv-list">
            <div v-if="detailsQuery.data.value.relatedAccount" class="kv-row">
              <dt class="kv-key">relatedAccount</dt>
              <dd class="kv-value">
                {{ detailsQuery.data.value.relatedAccount.name }} | ownerUserId:
                {{ detailsQuery.data.value.relatedAccount.ownerUserId }} | registrationDate:
                {{ formatDateTime(detailsQuery.data.value.relatedAccount.registrationDate) }}
              </dd>
            </div>
            <div v-if="detailsQuery.data.value.bookingId" class="kv-row">
              <dt class="kv-key">bookingId</dt>
              <dd class="kv-value">{{ detailsQuery.data.value.bookingId }}</dd>
            </div>
            <div v-if="detailsQuery.data.value.withdrawalAmount !== null" class="kv-row">
              <dt class="kv-key">withdrawalAmount</dt>
              <dd class="kv-value">{{ formatMoney(detailsQuery.data.value.withdrawalAmount) }}</dd>
            </div>
            <div class="kv-row">
              <dt class="kv-key">managerComments</dt>
              <dd class="kv-value">{{ detailsQuery.data.value.managerComments || "No comments" }}</dd>
            </div>
          </dl>
        </article>
      </div>

      <article v-if="canManage" class="panel" style="padding: 1rem">
        <h2 class="section-title" style="font-size: 1.2rem; margin-bottom: 0.8rem">
          Internal Actions
        </h2>

        <form class="stack" @submit.prevent="onUpdate">
          <div class="form-grid">
            <label class="field">
              <span class="field-label">Status</span>
              <select v-model.number="updateForm.status" class="field-select">
                <option :value="0">Pending</option>
                <option :value="1">Approved</option>
                <option :value="2">Declined</option>
              </select>
            </label>
          </div>

          <label class="field">
            <span class="field-label">managerComments (обязательно)</span>
            <textarea v-model="updateForm.managerComments" class="field-textarea"></textarea>
          </label>

          <div class="btn-row">
            <button type="submit" class="btn btn-primary" :disabled="updateMutation.isPending.value">
              {{ updateMutation.isPending.value ? "Сохраняю..." : "Update Ticket" }}
            </button>

            <button
              v-if="routeType === 'account-register'"
              type="button"
              class="btn btn-danger"
              :disabled="approveMutation.isPending.value"
              @click="onApprove"
            >
              {{ approveMutation.isPending.value ? "Подтверждаю..." : "Approve Account Register" }}
            </button>
          </div>
        </form>
      </article>
    </div>
  </section>
</template>
