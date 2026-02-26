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
const canApproveAccountRegister = computed(() => routeType.value === "account-register");

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

const ticket = computed(() => detailsQuery.data.value ?? null);
const hasAdditionalPayload = computed(() => {
  if (!ticket.value) {
    return false;
  }

  return (
    ticket.value.relatedAccount !== null ||
    ticket.value.bookingId !== null ||
    ticket.value.withdrawalAmount !== null
  );
});
const additionalSectionTitle = computed(() => {
  return routeType.value === "account-register" ? "Сведения об аккаунте" : "Дополнительные данные";
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
  <section class="page panel ticket-details-page">
    <header class="panel-header ticket-details-header">
      <div>
        <h1 class="section-title">Детали тикета</h1>
        <p class="section-subtitle">Карточка заявки и действия внутреннего менеджера.</p>
      </div>
      <RouterLink :to="backPath" class="btn btn-secondary">Назад к списку</RouterLink>
    </header>

    <p v-if="!hasValidParams" class="error-box">Неверный формат URL тикета.</p>
    <p v-else-if="detailsError" class="error-box">{{ detailsError }}</p>
    <p v-if="actionError" class="error-box">{{ actionError }}</p>
    <p v-if="actionSuccess" class="success-box">{{ actionSuccess }}</p>

    <div v-if="detailsQuery.isPending.value" class="muted-text">Загружаю детали тикета...</div>

    <div v-else-if="ticket" class="stack">
      <section class="ticket-overview">
        <div class="ticket-overview-group">
          <div class="ticket-overview-item">
            <span class="ticket-overview-label">Ticket</span>
            <strong class="ticket-overview-value">#{{ ticket.id }}</strong>
          </div>
          <div class="ticket-overview-item">
            <span class="ticket-overview-label">Type</span>
            <strong class="ticket-overview-value">{{ ticketTypeLabel(ticket.type) }}</strong>
          </div>
        </div>

        <div class="ticket-overview-group">
          <div class="ticket-overview-item">
            <span class="ticket-overview-label">Status</span>
            <strong class="ticket-overview-value">
              <span class="status-pill" :class="`status-${ticket.status}`">
                {{ ticketStatusLabel(ticket.status) }}
              </span>
            </strong>
          </div>
          <div class="ticket-overview-item">
            <span class="ticket-overview-label">Owner</span>
            <strong class="ticket-overview-value">{{ ticket.ownerEmail || "Not set" }}</strong>
          </div>
        </div>
      </section>

      <div class="detail-grid ticket-detail-grid">
        <article class="panel ticket-card">
          <h2 class="ticket-card-title">Основное</h2>
          <div class="ticket-extra-grid ticket-main-grid">
            <div class="ticket-extra-item ticket-main-item">
              <span class="ticket-extra-label ticket-main-label">ID тикета</span>
              <strong class="ticket-extra-value ticket-main-value">#{{ ticket.id }}</strong>
            </div>
            <div class="ticket-extra-item ticket-main-item">
              <span class="ticket-extra-label ticket-main-label">Заголовок</span>
              <strong class="ticket-extra-value ticket-main-value">{{ ticket.title }}</strong>
            </div>
            <div class="ticket-extra-item ticket-main-item">
              <span class="ticket-extra-label ticket-main-label">Описание</span>
              <strong class="ticket-extra-value ticket-main-value">{{ ticket.description }}</strong>
            </div>
            <div class="ticket-extra-item ticket-main-item">
              <span class="ticket-extra-label ticket-main-label">Тип тикета</span>
              <strong class="ticket-extra-value ticket-main-value">{{ ticketTypeLabel(ticket.type) }}</strong>
            </div>
            <div class="ticket-extra-item ticket-main-item">
              <span class="ticket-extra-label ticket-main-label">Статус</span>
              <strong class="ticket-extra-value ticket-main-value ticket-main-value-status">
                <span class="status-pill" :class="`status-${ticket.status}`">
                  {{ ticketStatusLabel(ticket.status) }}
                </span>
              </strong>
            </div>
            <div class="ticket-extra-item ticket-main-item">
              <span class="ticket-extra-label ticket-main-label">Email владельца</span>
              <strong class="ticket-extra-value ticket-main-value">{{ ticket.ownerEmail || "Not set" }}</strong>
            </div>
            <div class="ticket-extra-item ticket-main-item">
              <span class="ticket-extra-label ticket-main-label">Создан</span>
              <strong class="ticket-extra-value ticket-main-value">{{ formatDateTime(ticket.createdAt) }}</strong>
            </div>
            <div class="ticket-extra-item ticket-main-item">
              <span class="ticket-extra-label ticket-main-label">Обновлен</span>
              <strong class="ticket-extra-value ticket-main-value">{{ formatDateTime(ticket.updatedAt) }}</strong>
            </div>
          </div>
        </article>

        <article class="panel ticket-card ticket-card-secondary">
          <h2 class="ticket-card-title">{{ additionalSectionTitle }}</h2>
          <div v-if="hasAdditionalPayload" class="ticket-extra-grid ticket-main-grid">
            <template v-if="ticket.relatedAccount">
              <div class="ticket-extra-item ticket-main-item">
                <span class="ticket-extra-label ticket-main-label">Название аккаунта</span>
                <strong class="ticket-extra-value ticket-main-value">{{ ticket.relatedAccount.name }}</strong>
              </div>
              <div class="ticket-extra-item ticket-main-item">
                <span class="ticket-extra-label ticket-main-label">ID владельца аккаунта</span>
                <strong class="ticket-extra-value ticket-main-value">{{ ticket.relatedAccount.ownerUserId }}</strong>
              </div>
              <div class="ticket-extra-item ticket-main-item">
                <span class="ticket-extra-label ticket-main-label">Дата регистрации аккаунта</span>
                <strong class="ticket-extra-value ticket-main-value">{{
                  formatDateTime(ticket.relatedAccount.registrationDate)
                }}</strong>
              </div>
            </template>

            <div v-if="ticket.bookingId !== null" class="ticket-extra-item ticket-main-item">
              <span class="ticket-extra-label ticket-main-label">ID бронирования</span>
              <strong class="ticket-extra-value ticket-main-value">{{ ticket.bookingId }}</strong>
            </div>

            <div v-if="ticket.withdrawalAmount !== null" class="ticket-extra-item ticket-main-item">
              <span class="ticket-extra-label ticket-main-label">Сумма вывода</span>
              <strong class="ticket-extra-value ticket-main-value">{{
                formatMoney(ticket.withdrawalAmount)
              }}</strong>
            </div>
          </div>

          <p v-else class="ticket-extra-empty">Для этого типа тикета дополнительные поля отсутствуют.</p>

          <div class="ticket-extra-item ticket-main-item ticket-comment-item">
            <span class="ticket-extra-label ticket-main-label">Комментарий менеджера</span>
            <div class="ticket-comment-box">
              <p class="ticket-comment-value">
                {{ ticket.managerComments || "Комментарий пока не добавлен." }}
              </p>
            </div>
          </div>
        </article>
      </div>

      <article v-if="canManage" class="panel ticket-actions-card">
        <header class="ticket-actions-header">
          <h2 class="ticket-card-title">Управление тикетом</h2>
          <p class="muted-text">Комментарий менеджера обязателен для обновления.</p>
        </header>

        <form class="stack ticket-action-form" @submit.prevent="onUpdate">
          <div class="status-toggle">
            <label class="status-choice">
              <input v-model.number="updateForm.status" type="radio" :value="0" />
              <span class="status-pill status-0">Pending</span>
            </label>
            <label class="status-choice">
              <input v-model.number="updateForm.status" type="radio" :value="1" />
              <span class="status-pill status-1">Approved</span>
            </label>
            <label class="status-choice">
              <input v-model.number="updateForm.status" type="radio" :value="2" />
              <span class="status-pill status-2">Declined</span>
            </label>
          </div>

          <label class="field">
            <span class="field-label">Комментарий менеджера (обязательно)</span>
            <textarea v-model="updateForm.managerComments" class="field-textarea"></textarea>
          </label>

          <div class="btn-row ticket-action-buttons">
            <button type="submit" class="btn btn-primary" :disabled="updateMutation.isPending.value">
              {{ updateMutation.isPending.value ? "Сохраняю..." : "Update Ticket" }}
            </button>

            <button
              v-if="canApproveAccountRegister"
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
