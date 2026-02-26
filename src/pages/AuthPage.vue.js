import { useMutation } from "@tanstack/vue-query";
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import { ensureInternalRole } from "@/features/auth/roleResolver";
import { clearSession, setSessionToken } from "@/features/auth/session";
import { loginUser, registerUser } from "@/shared/api/authApi";
import { getApiErrorMessage } from "@/shared/lib/apiError";
const route = useRoute();
const router = useRouter();
const routeMode = computed(() => (route.path === "/register" ? "register" : "login"));
const activeMode = computed(() => routeMode.value);
const loginForm = reactive({
    email: "",
    password: "",
});
const registerForm = reactive({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
});
const loginSchema = z.object({
    email: z.string().email("Введите корректный email").max(320, "Email слишком длинный"),
    password: z.string().min(6, "Пароль должен быть не короче 6 символов"),
});
const registerSchema = z.object({
    firstName: z.string().min(1, "Введите имя").max(100, "Имя слишком длинное"),
    lastName: z.string().min(1, "Введите фамилию").max(100, "Фамилия слишком длинная"),
    email: z.string().email("Введите корректный email").max(320, "Email слишком длинный"),
    password: z.string().min(6, "Пароль должен быть не короче 6 символов").max(100),
});
const formError = ref("");
const formSuccess = ref("");
const loginMutation = useMutation({
    mutationFn: loginUser,
});
const registerMutation = useMutation({
    mutationFn: registerUser,
});
const isSubmitting = computed(() => loginMutation.isPending.value || registerMutation.isPending.value);
function resetFeedback() {
    formError.value = "";
    formSuccess.value = "";
}
function switchMode(mode, options) {
    if (!options?.keepFeedback) {
        resetFeedback();
    }
    const targetPath = mode === "login" ? "/login" : "/register";
    void router.replace(targetPath);
}
async function submitLogin() {
    formError.value = "";
    formSuccess.value = "";
    const parsed = loginSchema.safeParse(loginForm);
    if (!parsed.success) {
        formError.value = parsed.error.issues[0]?.message ?? "Проверьте поля формы.";
        return;
    }
    try {
        const response = await loginMutation.mutateAsync(parsed.data);
        setSessionToken(response.token);
        const isInternal = await ensureInternalRole();
        if (!isInternal) {
            clearSession();
            formError.value = "Доступ разрешен только для internal-пользователей CRM.";
            return;
        }
        const redirectQuery = typeof route.query.redirect === "string" ? route.query.redirect : "";
        if (redirectQuery.startsWith("/internal/tickets")) {
            await router.replace(redirectQuery);
            return;
        }
        await router.replace("/internal/tickets");
    }
    catch (error) {
        formError.value = getApiErrorMessage(error, {
            400: "Некорректный формат запроса.",
            401: "Неверный email или пароль.",
        }, "Не удалось выполнить вход.");
    }
}
async function submitRegister() {
    formError.value = "";
    formSuccess.value = "";
    const parsed = registerSchema.safeParse(registerForm);
    if (!parsed.success) {
        formError.value = parsed.error.issues[0]?.message ?? "Проверьте поля формы.";
        return;
    }
    try {
        await registerMutation.mutateAsync(parsed.data);
        loginForm.email = parsed.data.email;
        loginForm.password = parsed.data.password;
        formSuccess.value = "Регистрация успешна. Теперь выполните вход.";
        switchMode("login", { keepFeedback: true });
    }
    catch (error) {
        formError.value = getApiErrorMessage(error, {
            400: "Ошибка валидации. Проверьте введенные данные.",
            409: "Пользователь с таким email уже зарегистрирован.",
        }, "Не удалось зарегистрироваться.");
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
    ...{ class: "auth-backdrop page" },
});
/** @type {__VLS_StyleScopedClasses['auth-backdrop']} */ ;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "auth-window" },
});
/** @type {__VLS_StyleScopedClasses['auth-window']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "auth-form" },
});
/** @type {__VLS_StyleScopedClasses['auth-form']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "auth-form-brand" },
});
/** @type {__VLS_StyleScopedClasses['auth-form-brand']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "auth-switch" },
});
/** @type {__VLS_StyleScopedClasses['auth-switch']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    to: "/login",
    ...{ class: "auth-switch-item" },
    ...{ class: ({ active: __VLS_ctx.activeMode === 'login' }) },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    to: "/login",
    ...{ class: "auth-switch-item" },
    ...{ class: ({ active: __VLS_ctx.activeMode === 'login' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (__VLS_ctx.resetFeedback) });
/** @type {__VLS_StyleScopedClasses['auth-switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
const { default: __VLS_7 } = __VLS_3.slots;
// @ts-ignore
[activeMode, resetFeedback,];
var __VLS_3;
var __VLS_4;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    to: "/register",
    ...{ class: "auth-switch-item" },
    ...{ class: ({ active: __VLS_ctx.activeMode === 'register' }) },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    to: "/register",
    ...{ class: "auth-switch-item" },
    ...{ class: ({ active: __VLS_ctx.activeMode === 'register' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
const __VLS_14 = ({ click: {} },
    { onClick: (__VLS_ctx.resetFeedback) });
/** @type {__VLS_StyleScopedClasses['auth-switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
const { default: __VLS_15 } = __VLS_11.slots;
// @ts-ignore
[activeMode, resetFeedback,];
var __VLS_11;
var __VLS_12;
if (__VLS_ctx.formError) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "error-box" },
    });
    /** @type {__VLS_StyleScopedClasses['error-box']} */ ;
    (__VLS_ctx.formError);
}
if (__VLS_ctx.formSuccess) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "success-box" },
    });
    /** @type {__VLS_StyleScopedClasses['success-box']} */ ;
    (__VLS_ctx.formSuccess);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "auth-panel-wrap" },
    ...{ class: ({
            'mode-login': __VLS_ctx.activeMode === 'login',
            'mode-register': __VLS_ctx.activeMode === 'register',
        }) },
});
/** @type {__VLS_StyleScopedClasses['auth-panel-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-login']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-register']} */ ;
let __VLS_16;
/** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    name: "auth-panel",
    mode: "out-in",
}));
const __VLS_18 = __VLS_17({
    name: "auth-panel",
    mode: "out-in",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const { default: __VLS_21 } = __VLS_19.slots;
if (__VLS_ctx.activeMode === 'login') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_ctx.submitLogin) },
        key: "login",
        ...{ class: "stack auth-stack" },
    });
    /** @type {__VLS_StyleScopedClasses['stack']} */ ;
    /** @type {__VLS_StyleScopedClasses['auth-stack']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "field-label" },
    });
    /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "email",
        ...{ class: "field-input" },
        autocomplete: "email",
    });
    (__VLS_ctx.loginForm.email);
    /** @type {__VLS_StyleScopedClasses['field-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "field-label" },
    });
    /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "password",
        ...{ class: "field-input" },
        autocomplete: "current-password",
    });
    (__VLS_ctx.loginForm.password);
    /** @type {__VLS_StyleScopedClasses['field-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        ...{ class: "btn btn-primary" },
        disabled: (__VLS_ctx.isSubmitting),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    (__VLS_ctx.isSubmitting ? "Выполняю вход..." : "Войти");
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_ctx.submitRegister) },
        key: "register",
        ...{ class: "stack auth-stack" },
    });
    /** @type {__VLS_StyleScopedClasses['stack']} */ ;
    /** @type {__VLS_StyleScopedClasses['auth-stack']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "field-label" },
    });
    /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.registerForm.firstName),
        type: "text",
        ...{ class: "field-input" },
    });
    /** @type {__VLS_StyleScopedClasses['field-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "field-label" },
    });
    /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.registerForm.lastName),
        type: "text",
        ...{ class: "field-input" },
    });
    /** @type {__VLS_StyleScopedClasses['field-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "field-label" },
    });
    /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "email",
        ...{ class: "field-input" },
    });
    (__VLS_ctx.registerForm.email);
    /** @type {__VLS_StyleScopedClasses['field-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "field-label" },
    });
    /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "password",
        ...{ class: "field-input" },
    });
    (__VLS_ctx.registerForm.password);
    /** @type {__VLS_StyleScopedClasses['field-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        ...{ class: "btn btn-primary" },
        disabled: (__VLS_ctx.isSubmitting),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    (__VLS_ctx.isSubmitting ? "Создаю аккаунт..." : "Зарегистрироваться");
}
// @ts-ignore
[activeMode, activeMode, activeMode, formError, formError, formSuccess, formSuccess, submitLogin, loginForm, loginForm, isSubmitting, isSubmitting, isSubmitting, isSubmitting, submitRegister, registerForm, registerForm, registerForm, registerForm,];
var __VLS_19;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
