import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { isAxiosError } from "axios";
import { computed, reactive, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { z } from "zod";
import { isRouteTicketType, ticketStatusLabel, ticketTypeLabel, } from "@/entities/ticket/mappers";
import { useSessionStore } from "@/features/auth/session";
import { approveAccountRegisterTicket, getTicketDetails, updateTicket, } from "@/shared/api/ticketsApi";
import { getApiErrorMessage } from "@/shared/lib/apiError";
import { formatDateTime, formatMoney } from "@/shared/lib/formatters";
const route = useRoute();
const queryClient = useQueryClient();
const { state } = useSessionStore();
const rawType = computed(() => String(route.params.type ?? ""));
const routeType = computed(() => {
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
const detailsQuery = useQuery(computed(() => ({
    queryKey: ["ticket", "details", routeType.value, ticketId.value],
    queryFn: async () => {
        if (!routeType.value) {
            throw new Error("Некорректный тип тикета.");
        }
        return getTicketDetails(routeType.value, ticketId.value);
    },
    enabled: hasValidParams.value,
})));
watch(() => detailsQuery.data.value, (ticket) => {
    if (!ticket) {
        return;
    }
    updateForm.status = ticket.status;
    updateForm.managerComments = ticket.managerComments ?? "";
}, { immediate: true });
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
            status: parsed.data.status,
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
    return getApiErrorMessage(detailsQuery.error.value, {
        401: "Сессия истекла. Войдите заново.",
        403: "Нет доступа",
        404: "Тикет не найден",
    }, "Не удалось загрузить детали тикета.");
});
const ticket = computed(() => detailsQuery.data.value ?? null);
const hasAdditionalPayload = computed(() => {
    if (!ticket.value) {
        return false;
    }
    return (ticket.value.relatedAccount !== null ||
        ticket.value.bookingId !== null ||
        ticket.value.withdrawalAmount !== null);
});
const additionalSectionTitle = computed(() => {
    return routeType.value === "account-register" ? "Сведения об аккаунте" : "Дополнительные данные";
});
async function onUpdate() {
    actionError.value = "";
    actionSuccess.value = "";
    try {
        await updateMutation.mutateAsync();
        actionSuccess.value = "Статус тикета обновлен.";
        await queryClient.invalidateQueries({
            queryKey: ["ticket", "details", routeType.value, ticketId.value],
        });
        await queryClient.invalidateQueries({ queryKey: ["tickets"] });
    }
    catch (error) {
        if (!isAxiosError(error) && error instanceof Error) {
            actionError.value = error.message;
            return;
        }
        actionError.value = getApiErrorMessage(error, {
            400: "Ошибка валидации. Проверьте status и managerComments.",
            401: "Требуется авторизация.",
            403: "Нет прав на update этой заявки.",
            404: "Тикет не найден.",
        }, "Не удалось обновить тикет.");
    }
}
async function onApprove() {
    actionError.value = "";
    actionSuccess.value = "";
    try {
        await approveMutation.mutateAsync();
        actionSuccess.value = "Тикет подтвержден.";
        await queryClient.invalidateQueries({
            queryKey: ["ticket", "details", routeType.value, ticketId.value],
        });
        await queryClient.invalidateQueries({ queryKey: ["tickets"] });
    }
    catch (error) {
        if (!isAxiosError(error) && error instanceof Error) {
            actionError.value = error.message;
            return;
        }
        actionError.value = getApiErrorMessage(error, {
            401: "Требуется авторизация.",
            403: "Нет прав на approve этой заявки.",
            404: "Тикет не найден.",
        }, "Не удалось подтвердить тикет.");
    }
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "page panel ticket-details-page" },
});
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['ticket-details-page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "panel-header ticket-details-header" },
});
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['ticket-details-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "section-subtitle" },
});
/** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: (__VLS_ctx.backPath),
    ...{ class: "btn btn-secondary" },
}));
const __VLS_2 = __VLS_1({
    to: (__VLS_ctx.backPath),
    ...{ class: "btn btn-secondary" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
// @ts-ignore
[backPath,];
var __VLS_3;
if (!__VLS_ctx.hasValidParams) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "error-box" },
    });
    /** @type {__VLS_StyleScopedClasses['error-box']} */ ;
}
else if (__VLS_ctx.detailsError) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "error-box" },
    });
    /** @type {__VLS_StyleScopedClasses['error-box']} */ ;
    (__VLS_ctx.detailsError);
}
if (__VLS_ctx.actionError) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "error-box" },
    });
    /** @type {__VLS_StyleScopedClasses['error-box']} */ ;
    (__VLS_ctx.actionError);
}
if (__VLS_ctx.actionSuccess) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "success-box" },
    });
    /** @type {__VLS_StyleScopedClasses['success-box']} */ ;
    (__VLS_ctx.actionSuccess);
}
if (__VLS_ctx.detailsQuery.isPending.value) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "muted-text" },
    });
    /** @type {__VLS_StyleScopedClasses['muted-text']} */ ;
}
else if (__VLS_ctx.ticket) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stack" },
    });
    /** @type {__VLS_StyleScopedClasses['stack']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "ticket-overview" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-overview-group" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-overview-item" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ticket-overview-label" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "ticket-overview-value" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview-value']} */ ;
    (__VLS_ctx.ticket.id);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-overview-item" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ticket-overview-label" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "ticket-overview-value" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview-value']} */ ;
    (__VLS_ctx.ticketTypeLabel(__VLS_ctx.ticket.type));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-overview-group" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-overview-item" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ticket-overview-label" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "ticket-overview-value" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview-value']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "status-pill" },
        ...{ class: (`status-${__VLS_ctx.ticket.status}`) },
    });
    /** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
    (__VLS_ctx.ticketStatusLabel(__VLS_ctx.ticket.status));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-overview-item" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ticket-overview-label" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "ticket-overview-value" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-overview-value']} */ ;
    (__VLS_ctx.ticket.ownerEmail || "Not set");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-grid ticket-detail-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-detail-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
        ...{ class: "panel ticket-card" },
    });
    /** @type {__VLS_StyleScopedClasses['panel']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "ticket-card-title" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-card-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-extra-grid ticket-main-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-extra-item ticket-main-item" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ticket-extra-label ticket-main-label" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "ticket-extra-value ticket-main-value" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-value']} */ ;
    (__VLS_ctx.ticket.id);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-extra-item ticket-main-item" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ticket-extra-label ticket-main-label" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "ticket-extra-value ticket-main-value" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-value']} */ ;
    (__VLS_ctx.ticket.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-extra-item ticket-main-item" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ticket-extra-label ticket-main-label" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "ticket-extra-value ticket-main-value" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-value']} */ ;
    (__VLS_ctx.ticket.description);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-extra-item ticket-main-item" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ticket-extra-label ticket-main-label" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "ticket-extra-value ticket-main-value" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-value']} */ ;
    (__VLS_ctx.ticketTypeLabel(__VLS_ctx.ticket.type));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-extra-item ticket-main-item" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ticket-extra-label ticket-main-label" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "ticket-extra-value ticket-main-value ticket-main-value-status" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-value-status']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "status-pill" },
        ...{ class: (`status-${__VLS_ctx.ticket.status}`) },
    });
    /** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
    (__VLS_ctx.ticketStatusLabel(__VLS_ctx.ticket.status));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-extra-item ticket-main-item" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ticket-extra-label ticket-main-label" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "ticket-extra-value ticket-main-value" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-value']} */ ;
    (__VLS_ctx.ticket.ownerEmail || "Not set");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-extra-item ticket-main-item" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ticket-extra-label ticket-main-label" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "ticket-extra-value ticket-main-value" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-value']} */ ;
    (__VLS_ctx.formatDateTime(__VLS_ctx.ticket.createdAt));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-extra-item ticket-main-item" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ticket-extra-label ticket-main-label" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "ticket-extra-value ticket-main-value" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-value']} */ ;
    (__VLS_ctx.formatDateTime(__VLS_ctx.ticket.updatedAt));
    __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
        ...{ class: "panel ticket-card ticket-card-secondary" },
    });
    /** @type {__VLS_StyleScopedClasses['panel']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-card-secondary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "ticket-card-title" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-card-title']} */ ;
    (__VLS_ctx.additionalSectionTitle);
    if (__VLS_ctx.hasAdditionalPayload) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ticket-extra-grid ticket-main-grid" },
        });
        /** @type {__VLS_StyleScopedClasses['ticket-extra-grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['ticket-main-grid']} */ ;
        if (__VLS_ctx.ticket.relatedAccount) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ticket-extra-item ticket-main-item" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-item']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-item']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "ticket-extra-label ticket-main-label" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-label']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                ...{ class: "ticket-extra-value ticket-main-value" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-value']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-value']} */ ;
            (__VLS_ctx.ticket.relatedAccount.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ticket-extra-item ticket-main-item" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-item']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-item']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "ticket-extra-label ticket-main-label" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-label']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                ...{ class: "ticket-extra-value ticket-main-value" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-value']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-value']} */ ;
            (__VLS_ctx.ticket.relatedAccount.ownerUserId);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ticket-extra-item ticket-main-item" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-item']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-item']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "ticket-extra-label ticket-main-label" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-label']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                ...{ class: "ticket-extra-value ticket-main-value" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-value']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-value']} */ ;
            (__VLS_ctx.formatDateTime(__VLS_ctx.ticket.relatedAccount.registrationDate));
        }
        if (__VLS_ctx.ticket.bookingId !== null) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ticket-extra-item ticket-main-item" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-item']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-item']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "ticket-extra-label ticket-main-label" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-label']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                ...{ class: "ticket-extra-value ticket-main-value" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-value']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-value']} */ ;
            (__VLS_ctx.ticket.bookingId);
        }
        if (__VLS_ctx.ticket.withdrawalAmount !== null) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ticket-extra-item ticket-main-item" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-item']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-item']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "ticket-extra-label ticket-main-label" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-label']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                ...{ class: "ticket-extra-value ticket-main-value" },
            });
            /** @type {__VLS_StyleScopedClasses['ticket-extra-value']} */ ;
            /** @type {__VLS_StyleScopedClasses['ticket-main-value']} */ ;
            (__VLS_ctx.formatMoney(__VLS_ctx.ticket.withdrawalAmount));
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "ticket-extra-empty" },
        });
        /** @type {__VLS_StyleScopedClasses['ticket-extra-empty']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-extra-item ticket-main-item ticket-comment-item" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-comment-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ticket-extra-label ticket-main-label" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-extra-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['ticket-main-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ticket-comment-box" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-comment-box']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "ticket-comment-value" },
    });
    /** @type {__VLS_StyleScopedClasses['ticket-comment-value']} */ ;
    (__VLS_ctx.ticket.managerComments || "Комментарий пока не добавлен.");
    if (__VLS_ctx.canManage) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            ...{ class: "panel ticket-actions-card" },
        });
        /** @type {__VLS_StyleScopedClasses['panel']} */ ;
        /** @type {__VLS_StyleScopedClasses['ticket-actions-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
            ...{ class: "ticket-actions-header" },
        });
        /** @type {__VLS_StyleScopedClasses['ticket-actions-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "ticket-card-title" },
        });
        /** @type {__VLS_StyleScopedClasses['ticket-card-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "muted-text" },
        });
        /** @type {__VLS_StyleScopedClasses['muted-text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (__VLS_ctx.onUpdate) },
            ...{ class: "stack ticket-action-form" },
        });
        /** @type {__VLS_StyleScopedClasses['stack']} */ ;
        /** @type {__VLS_StyleScopedClasses['ticket-action-form']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "status-toggle" },
        });
        /** @type {__VLS_StyleScopedClasses['status-toggle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "status-choice" },
        });
        /** @type {__VLS_StyleScopedClasses['status-choice']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "radio",
            value: (0),
        });
        (__VLS_ctx.updateForm.status);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-pill status-0" },
        });
        /** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
        /** @type {__VLS_StyleScopedClasses['status-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "status-choice" },
        });
        /** @type {__VLS_StyleScopedClasses['status-choice']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "radio",
            value: (1),
        });
        (__VLS_ctx.updateForm.status);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-pill status-1" },
        });
        /** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
        /** @type {__VLS_StyleScopedClasses['status-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "status-choice" },
        });
        /** @type {__VLS_StyleScopedClasses['status-choice']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "radio",
            value: (2),
        });
        (__VLS_ctx.updateForm.status);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-pill status-2" },
        });
        /** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
        /** @type {__VLS_StyleScopedClasses['status-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "field" },
        });
        /** @type {__VLS_StyleScopedClasses['field']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "field-label" },
        });
        /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
            value: (__VLS_ctx.updateForm.managerComments),
            ...{ class: "field-textarea" },
        });
        /** @type {__VLS_StyleScopedClasses['field-textarea']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "btn-row ticket-action-buttons" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['ticket-action-buttons']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            type: "submit",
            ...{ class: "btn btn-primary" },
            disabled: (__VLS_ctx.updateMutation.isPending.value),
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        (__VLS_ctx.updateMutation.isPending.value ? "Сохраняю..." : "Update Ticket");
        if (__VLS_ctx.canApproveAccountRegister) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.onApprove) },
                type: "button",
                ...{ class: "btn btn-danger" },
                disabled: (__VLS_ctx.approveMutation.isPending.value),
            });
            /** @type {__VLS_StyleScopedClasses['btn']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-danger']} */ ;
            (__VLS_ctx.approveMutation.isPending.value ? "Подтверждаю..." : "Approve Account Register");
        }
    }
}
// @ts-ignore
[hasValidParams, detailsError, detailsError, actionError, actionError, actionSuccess, actionSuccess, detailsQuery, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticket, ticketTypeLabel, ticketTypeLabel, ticketStatusLabel, ticketStatusLabel, formatDateTime, formatDateTime, formatDateTime, additionalSectionTitle, hasAdditionalPayload, formatMoney, canManage, onUpdate, updateForm, updateForm, updateForm, updateForm, updateMutation, updateMutation, canApproveAccountRegister, onApprove, approveMutation, approveMutation,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
