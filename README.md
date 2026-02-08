# МИМИ — Telegram Mini App для доставки еды

MVP приложения для ресторана «МИМИ» (Шушары): каталог, корзина, оформление заказа, уведомления в Telegram и простая админка заказов.

## Стек

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **State:** Zustand + localStorage (корзина)
- **Backend:** Next.js Route Handlers + Prisma
- **DB:** PostgreSQL (Docker локально; Supabase/Railway в проде)
- **Telegram:** WebApp SDK + node-telegram-bot-api (уведомления)
- **Deploy:** Vercel (frontend + API) + облачная Postgres

## Быстрый старт локально

### 1. Поднять PostgreSQL

```bash
docker compose up -d
```

### 2. Установить зависимости и подготовить БД

```bash
npm i
cp .env.example .env
# DATABASE_URL из .env.example подходит для docker-compose
npm run db:push
npm run db:seed
```

Для сборки (`npm run build`) нужен файл `.env` с `DATABASE_URL` (при сборке без запущенной БД возможны предупреждения при генерации страниц — сборка всё равно завершится).

### 3. Запустить приложение

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000). В браузере без Telegram будут подставлены тестовые данные пользователя.

## Переменные окружения (.env)

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | Строка подключения PostgreSQL |
| `ADMIN_TOKEN` | Секрет для доступа к `/admin/orders?token=...` |
| `TG_BOT_TOKEN` | Токен бота от @BotFather |
| `TG_CHAT_ID` | ID чата/группы для уведомлений о новых заказах |
| `NEXT_PUBLIC_APP_URL` | Публичный URL приложения (для продакшена) |
| `YOOKASSA_SHOP_ID` | Идентификатор магазина ЮKassa (если нужна оплата) |
| `YOOKASSA_SECRET_KEY` | Секретный ключ ЮKassa |

## Где указать URL Mini App в BotFather

1. Откройте [@BotFather](https://t.me/BotFather).
2. Выберите бота или создайте нового: `/newbot`.
3. Отправьте команду: **`/setmenubutton`** (или через меню бота — «Bot Settings» → «Menu Button»).
4. Укажите URL вашего приложения, например:
   - Локально (для теста через ngrok): `https://xxxx.ngrok.io`
   - Прод: `https://your-app.vercel.app`
5. Текст кнопки можно оставить по умолчанию или задать, например: «Открыть меню».

После этого в интерфейсе бота появится кнопка меню, открывающая Mini App.

## Как получить TG_CHAT_ID

1. Создайте группу в Telegram (или используйте существующую).
2. Добавьте вашего бота в группу и при необходимости сделайте его админом.
3. Напишите в группе любое сообщение (например: «Привет»).
4. Откройте в браузере:
   ```
   https://api.telegram.org/bot<ВАШ_TG_BOT_TOKEN>/getUpdates
   ```
5. В ответе найдите объект с полем `"chat"`. Например:
   `"chat":{"id":-1001234567890,"title":"Менеджеры МИМИ",...}`
6. Значение `id` (например, `-1001234567890`) — это и есть **TG_CHAT_ID**. Для групп оно отрицательное.

Подставьте его в `.env` как `TG_CHAT_ID=-1001234567890`.

## Деплой (Vercel + облачная БД)

1. **База данных:** создайте проект в [Supabase](https://supabase.com) или [Railway](https://railway.app), получите `DATABASE_URL`.
2. **Репозиторий:** залейте код в GitHub.
3. **Vercel:** [vercel.com](https://vercel.com) → New Project → импорт репозитория.
4. В настройках проекта добавьте переменные окружения из `.env.example`.
5. В **Build Command** оставьте `next build`. В **Install Command** — `npm install` (Prisma подтянется и сгенерируется при сборке).
6. После деплоя возьмите URL вида `https://your-project.vercel.app` и укажите его в BotFather как URL Mini App и при необходимости в `NEXT_PUBLIC_APP_URL`.

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Сборка для продакшена |
| `npm run start` | Запуск прод-сервера |
| `npm run db:push` | Применить схему Prisma к БД (без миграций) |
| `npm run db:migrate` | Создать и применить миграцию |
| `npm run db:seed` | Заполнить БД тестовыми данными (категории, товары, промокод FIRST10) |
| `npm run db:studio` | Открыть Prisma Studio |

## Структура проекта

- `app/` — страницы и API (App Router)
- `app/api/` — Route Handlers (menu, promocode, orders, admin)
- `components/` — UI-компоненты
- `lib/` — telegram, validations (zod), money, prisma, payment-provider (заглушка)
- `store/` — Zustand (корзина, пользователь)
- `prisma/` — schema.prisma, seed.ts

## Оплата (ЮKassa)

Если в `.env` **не заданы** `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY`, заказы создаются без оплаты (как раньше): кнопка «Подтвердить заказ» сразу создаёт заказ и перенаправляет на страницу успеха.

Чтобы включить оплату картой:

1. Зарегистрируйтесь в [ЮKassa](https://yookassa.ru), получите **Идентификатор магазина** (shopId) и **Секретный ключ**.
2. В `.env` добавьте:
   ```env
   YOOKASSA_SHOP_ID="ваш_shop_id"
   YOOKASSA_SECRET_KEY="live_ваш_секретный_ключ"
   NEXT_PUBLIC_APP_URL="https://ваш-домен.ru"
   ```
3. В личном кабинете ЮKassa → Настройки → Уведомления укажите URL:
   ```text
   https://ваш-домен.ru/api/payments/webhook
   ```
   и включите событие **payment.succeeded**.

После этого при оформлении заказа пользователь будет переходить на страницу ЮKassa, оплачивать заказ и возвращаться на ваш сайт. После успешной оплаты webhook переведёт заказ в статус «Новый» и отправит уведомление в Telegram.

## Промокод MVP

- **FIRST10** — скидка 10% при сумме заказа от 1000 ₽ (от 100 000 копеек в БД).
