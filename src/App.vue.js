import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { clearSession, useSessionStore } from "@/features/auth/session";
const route = useRoute();
const { state, isAuthenticated } = useSessionStore();
const hideTopbar = computed(() => route.path === "/login" || route.path === "/register");
const isInternalTicketsRoute = computed(() => route.path.startsWith("/internal/tickets"));
function logout() {
    clearSession({ redirect: true });
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-shell" },
});
/** @type {__VLS_StyleScopedClasses['app-shell']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "gradient-orb orb-one" },
});
/** @type {__VLS_StyleScopedClasses['gradient-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['orb-one']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "gradient-orb orb-two" },
});
/** @type {__VLS_StyleScopedClasses['gradient-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['orb-two']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "gradient-orb orb-three" },
});
/** @type {__VLS_StyleScopedClasses['gradient-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['orb-three']} */ ;
if (__VLS_ctx.isAuthenticated && !__VLS_ctx.hideTopbar) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "topbar" },
    });
    /** @type {__VLS_StyleScopedClasses['topbar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "brand-block" },
    });
    /** @type {__VLS_StyleScopedClasses['brand-block']} */ ;
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
    RouterLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        to: "/",
        ...{ class: "brand-title" },
    }));
    const __VLS_2 = __VLS_1({
        to: "/",
        ...{ class: "brand-title" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
    const { default: __VLS_5 } = __VLS_3.slots;
    // @ts-ignore
    [isAuthenticated, hideTopbar,];
    var __VLS_3;
    if (__VLS_ctx.state.isInternal) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
            ...{ class: "topbar-nav" },
        });
        /** @type {__VLS_StyleScopedClasses['topbar-nav']} */ ;
        let __VLS_6;
        /** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
        RouterLink;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
            to: "/internal/tickets",
            ...{ class: "tickets-link" },
        }));
        const __VLS_8 = __VLS_7({
            to: "/internal/tickets",
            ...{ class: "tickets-link" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        /** @type {__VLS_StyleScopedClasses['tickets-link']} */ ;
        const { default: __VLS_11 } = __VLS_9.slots;
        // @ts-ignore
        [state,];
        var __VLS_9;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.logout) },
        type: "button",
        ...{ class: "btn btn-ghost" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "app-content" },
    ...{ class: ({ 'auth-only': __VLS_ctx.hideTopbar, 'internal-wide': __VLS_ctx.isInternalTicketsRoute }) },
});
/** @type {__VLS_StyleScopedClasses['app-content']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-only']} */ ;
/** @type {__VLS_StyleScopedClasses['internal-wide']} */ ;
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.RouterView} */
RouterView;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
// @ts-ignore
[hideTopbar, logout, isInternalTicketsRoute,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
