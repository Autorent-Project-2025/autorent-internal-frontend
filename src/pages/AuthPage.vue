<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import { ensureInternalRole } from "@/features/auth/roleResolver";
import { clearSession, setSessionToken } from "@/features/auth/session";
import { loginUser, registerUser } from "@/shared/api/authApi";
import { getApiErrorMessage } from "@/shared/lib/apiError";

type AuthMode = "login" | "register";

const route = useRoute();
const router = useRouter();

const routeMode = computed<AuthMode>(() => (route.path === "/register" ? "register" : "login"));
const activeMode = computed<AuthMode>(() => routeMode.value);

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

const isSubmitting = computed(
  () => loginMutation.isPending.value || registerMutation.isPending.value,
);

function resetFeedback(): void {
  formError.value = "";
  formSuccess.value = "";
}

function switchMode(mode: AuthMode, options?: { keepFeedback?: boolean }): void {
  if (!options?.keepFeedback) {
    resetFeedback();
  }

  const targetPath = mode === "login" ? "/login" : "/register";
  void router.replace(targetPath);
}

async function submitLogin(): Promise<void> {
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
  } catch (error: unknown) {
    formError.value = getApiErrorMessage(
      error,
      {
        400: "Некорректный формат запроса.",
        401: "Неверный email или пароль.",
      },
      "Не удалось выполнить вход.",
    );
  }
}

async function submitRegister(): Promise<void> {
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
  } catch (error: unknown) {
    formError.value = getApiErrorMessage(
      error,
      {
        400: "Ошибка валидации. Проверьте введенные данные.",
        409: "Пользователь с таким email уже зарегистрирован.",
      },
      "Не удалось зарегистрироваться.",
    );
  }
}
</script>

<template>
  <section class="auth-backdrop page">
    <div class="auth-window">
      <section class="auth-form">
        <h1 class="auth-form-brand">Autorent internal</h1>

        <div class="auth-switch">
          <RouterLink
            to="/login"
            class="auth-switch-item"
            :class="{ active: activeMode === 'login' }"
            @click="resetFeedback"
          >
            Вход
          </RouterLink>
          <RouterLink
            to="/register"
            class="auth-switch-item"
            :class="{ active: activeMode === 'register' }"
            @click="resetFeedback"
          >
            Регистрация
          </RouterLink>
        </div>

        <p v-if="formError" class="error-box">{{ formError }}</p>
        <p v-if="formSuccess" class="success-box">{{ formSuccess }}</p>

        <div
          class="auth-panel-wrap"
          :class="{
            'mode-login': activeMode === 'login',
            'mode-register': activeMode === 'register',
          }"
        >
          <Transition name="auth-panel" mode="out-in">
            <form
              v-if="activeMode === 'login'"
              key="login"
              class="stack auth-stack"
              @submit.prevent="submitLogin"
            >
              <label class="field">
                <span class="field-label">Email</span>
                <input
                  v-model="loginForm.email"
                  type="email"
                  class="field-input"
                  autocomplete="email"
                />
              </label>

              <label class="field">
                <span class="field-label">Пароль</span>
                <input
                  v-model="loginForm.password"
                  type="password"
                  class="field-input"
                  autocomplete="current-password"
                />
              </label>

              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? "Выполняю вход..." : "Войти" }}
              </button>
            </form>

            <form
              v-else
              key="register"
              class="stack auth-stack"
              @submit.prevent="submitRegister"
            >
              <label class="field">
                <span class="field-label">Имя</span>
                <input v-model="registerForm.firstName" type="text" class="field-input" />
              </label>

              <label class="field">
                <span class="field-label">Фамилия</span>
                <input v-model="registerForm.lastName" type="text" class="field-input" />
              </label>

              <label class="field">
                <span class="field-label">Email</span>
                <input v-model="registerForm.email" type="email" class="field-input" />
              </label>

              <label class="field">
                <span class="field-label">Пароль</span>
                <input v-model="registerForm.password" type="password" class="field-input" />
              </label>

              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? "Создаю аккаунт..." : "Зарегистрироваться" }}
              </button>
            </form>
          </Transition>
        </div>
      </section>
    </div>
  </section>
</template>
