import { useQuery } from "@tanstack/vue-query";
import { computed, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { ticketStatusLabel, ticketTypeLabel, toApiTicketType, toRouteTicketType, } from "@/entities/ticket/mappers";
import { getAllTickets } from "@/shared/api/ticketsApi";
import { getApiErrorMessage } from "@/shared/lib/apiError";
import { formatDateTime } from "@/shared/lib/formatters";
const props = defineProps();
const router = useRouter();
const filters = reactive({
    type: "",
    page: 1,
    pageSize: 20,
});
watch(() => [filters.type, filters.pageSize], () => {
    filters.page = 1;
});
const ticketsQuery = useQuery(computed(() => ({
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
})));
const items = computed(() => ticketsQuery.data.value?.items ?? []);
const page = computed(() => ticketsQuery.data.value?.page ?? filters.page);
const totalPages = computed(() => ticketsQuery.data.value?.totalPages ?? 1);
const totalCount = computed(() => ticketsQuery.data.value?.totalCount ?? 0);
const isInitialLoading = computed(() => ticketsQuery.isPending.value &&
    !ticketsQuery.data.value &&
    !ticketsQuery.error.value);
const knownTypes = ["AccountRegister", "BookingCancel", "Withdrawal"];
const errorMessage = computed(() => {
    if (!ticketsQuery.error.value) {
        return "";
    }
    return getApiErrorMessage(ticketsQuery.error.value, {
        400: "Некорректные фильтры или пагинация. Проверьте значения page и pageSize.",
        401: "Сессия истекла. Выполните вход снова.",
        403: "Нет прав на internal-список.",
    }, "Не удалось загрузить список тикетов.");
});
function onOpenDetails(ticket) {
    router.push(`${props.detailsBasePath}/${toRouteTicketType(ticket.type)}/${ticket.id}`);
}
function onPrevPage() {
    filters.page = Math.max(1, page.value - 1);
}
function onNextPage() {
    filters.page = Math.min(totalPages.value, page.value + 1);
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "page panel" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
if (!__VLS_ctx.hideHeader) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "panel-header" },
    });
    /** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
    (__VLS_ctx.title || "Тикеты");
    if (__VLS_ctx.subtitle) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "section-subtitle" },
        });
        /** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
        (__VLS_ctx.subtitle);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "muted-text" },
    });
    /** @type {__VLS_StyleScopedClasses['muted-text']} */ ;
    (__VLS_ctx.totalCount);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-grid" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "field" },
});
/** @type {__VLS_StyleScopedClasses['field']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "field-label" },
});
/** @type {__VLS_StyleScopedClasses['field-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.filters.type),
    ...{ class: "field-select" },
});
/** @type {__VLS_StyleScopedClasses['field-select']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "",
});
for (const [type] of __VLS_vFor((__VLS_ctx.knownTypes))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (type),
        value: (type),
    });
    (__VLS_ctx.ticketTypeLabel(type));
    // @ts-ignore
    [hideHeader, title, subtitle, subtitle, totalCount, filters, knownTypes, ticketTypeLabel,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "field" },
});
/** @type {__VLS_StyleScopedClasses['field']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "field-label" },
});
/** @type {__VLS_StyleScopedClasses['field-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.filters.pageSize),
    ...{ class: "field-select" },
});
/** @type {__VLS_StyleScopedClasses['field-select']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: (10),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: (20),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: (50),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: (100),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: (200),
});
if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "error-box" },
    });
    /** @type {__VLS_StyleScopedClasses['error-box']} */ ;
    (__VLS_ctx.errorMessage);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-wrap" },
});
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
    ...{ class: "table" },
});
/** @type {__VLS_StyleScopedClasses['table']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
if (__VLS_ctx.isInitialLoading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
        colspan: "6",
        ...{ class: "muted-text" },
    });
    /** @type {__VLS_StyleScopedClasses['muted-text']} */ ;
}
else if (__VLS_ctx.items.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
        colspan: "6",
        ...{ class: "muted-text" },
    });
    /** @type {__VLS_StyleScopedClasses['muted-text']} */ ;
}
for (const [ticket, index] of __VLS_vFor((__VLS_ctx.items))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.onOpenDetails(ticket);
                // @ts-ignore
                [filters, errorMessage, errorMessage, isInitialLoading, items, items, onOpenDetails,];
            } },
        key: (ticket.id),
        ...{ class: "clickable row-reveal" },
        ...{ style: ({ '--row-index': String(index) }) },
    });
    /** @type {__VLS_StyleScopedClasses['clickable']} */ ;
    /** @type {__VLS_StyleScopedClasses['row-reveal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
    (ticket.id);
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
    (ticket.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
    (__VLS_ctx.ticketTypeLabel(ticket.type));
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "status-pill" },
        ...{ class: (`status-${ticket.status}`) },
    });
    /** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
    (__VLS_ctx.ticketStatusLabel(ticket.status));
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
    (ticket.ownerEmail);
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
    (__VLS_ctx.formatDateTime(ticket.createdAt));
    // @ts-ignore
    [ticketTypeLabel, ticketStatusLabel, formatDateTime,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
    ...{ class: "pagination" },
});
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "muted-text" },
});
/** @type {__VLS_StyleScopedClasses['muted-text']} */ ;
(__VLS_ctx.page);
(__VLS_ctx.totalPages);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "inline-actions" },
});
/** @type {__VLS_StyleScopedClasses['inline-actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.onPrevPage) },
    type: "button",
    ...{ class: "btn btn-secondary" },
    disabled: (__VLS_ctx.page <= 1),
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.onNextPage) },
    type: "button",
    ...{ class: "btn btn-secondary" },
    disabled: (__VLS_ctx.page >= __VLS_ctx.totalPages),
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
// @ts-ignore
[page, page, page, totalPages, totalPages, onPrevPage, onNextPage,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
