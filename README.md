# Autorent Internal Frontend

CRM-интерфейс для внутренней команды Autorent на **Vue 3 + TypeScript + Vite**.

## Стек

- Vue 3 + Vue Router
- @tanstack/vue-query
- Axios
- Zod

## Запуск в разработке

```bash
npm install
npm run dev
```

Настройки берутся из `.env`:

- `VITE_API_URL` — адрес бэкенда (по умолчанию `http://localhost:5253`)
- `VITE_FRONTEND_PORT` — порт фронтенда (по умолчанию `5173`)

Пример переменных: [.env.example](./.env.example).

## Вызовы API

- Все запросы выполняются напрямую через сервис `apiClient`.
- Базовый URL берется из `VITE_API_URL`.
- Проксирование через Vite не используется.

## Маршруты

Публичные:

- `/login`
- `/register`

Internal:

- `/internal/tickets`
- `/internal/tickets/:type/:id`

## Примечания

- Токен хранится в памяти и в `localStorage`.
- Роль internal определяется проверкой `GET /tickets?page=1&pageSize=1`.
- При `401` сессия очищается и выполняется переход на `/login`.
- Создание тикетов во фронтенде отключено: система предназначена для обработки входящих клиентских тикетов.
