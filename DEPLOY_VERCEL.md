# Деплой МИМИ на Vercel + Supabase

Пошаговая инструкция.

---

## Шаг 1. Репозиторий на GitHub

На своём компьютере в папке проекта:

```bash
cd /Users/nikitaocagov/Documents/Telegram-miniapp1
git init
git add .
git commit -m "МИМИ: каталог, корзина, заказы, админка, оплата"
```

1. Зайди на [github.com](https://github.com) → **New repository**.
2. Название, например: `mimi-telegram-app`. Создать (без README).
3. В терминале выполни (подставь свой логин и имя репо):

```bash
git remote add origin https://github.com/ВАШ_ЛОГИН/mimi-telegram-app.git
git branch -M main
git push -u origin main
```

---

## Шаг 2. База данных Supabase

1. Зайди на [supabase.com](https://supabase.com) → **Start your project** (войди через GitHub или email).
2. **New project** → выбери организацию → имя проекта (например `mimi-db`), пароль для БД (сохрани его), регион (ближайший). **Create project**.
3. В левом меню: **Settings** (шестерёнка) → **Database**.
4. В блоке **Connection string** выбери вкладку **URI**, скопируй строку. Она выглядит так:
   ```
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
5. Замени `[YOUR-PASSWORD]` на пароль, который задал при создании проекта. Это твой **DATABASE_URL** — сохрани в блокнот.

---

## Шаг 3. Проект на Vercel

1. Зайди на [vercel.com](https://vercel.com) → **Sign Up** / войди (удобно через GitHub).
2. **Add New** → **Project**.
3. Импортируй репозиторий `mimi-telegram-app` (если не видно — нажми **Import Git Repository** и дай доступ к GitHub).
4. **Configure Project**:  
   - Framework Preset: **Next.js** (определится сам).  
   - Root Directory: оставь пустым.  
   - **Environment Variables** — добавь переменные (см. ниже).
5. Нажми **Deploy**. Дождись окончания сборки.

---

## Шаг 4. Переменные окружения в Vercel

В проекте Vercel открой **Settings** → **Environment Variables**. Добавь по одной:

| Name | Value | Примечание |
|------|--------|------------|
| `DATABASE_URL` | `postgresql://postgres.[ref]:ТВОЙ_ПАРОЛЬ@aws-0-....pooler.supabase.com:6543/postgres` | Строка из Supabase (шаг 2), с подставленным паролем |
| `ADMIN_TOKEN` | Любая длинная случайная строка | Секрет для доступа к админке |
| `TG_BOT_TOKEN` | Токен от @BotFather | Получишь на шаге 6 |
| `TG_CHAT_ID` | Число, например `-1001234567890` | Получишь на шаге 7 |
| `NEXT_PUBLIC_APP_URL` | `https://твой-проект.vercel.app` | URL после деплоя (скопируй из Vercel) |

Для каждой переменной выбери **Production** (и при необходимости Preview). Сохрани.

---

### Подробно: как задать DATABASE_URL и сделать Redeploy

1. **Зайди в проект на Vercel**  
   [vercel.com](https://vercel.com) → **Dashboard** → выбери свой проект (например `mimi-telegram-app`).

2. **Открой настройки переменных**  
   В верхнем меню проекта: **Settings** → в левом сайдбаре выбери **Environment Variables**.

3. **Добавь DATABASE_URL**  
   - В поле **Key** введи: `DATABASE_URL`  
   - В поле **Value** вставь полную строку подключения к Supabase **с параметром SSL в конце**:  
     `postgresql://postgres.jdhtdggncjgvmckhabxk:ТВОЙ_ПАРОЛЬ@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require`  
     (строка из Supabase: **Settings** → **Database** → **Connection string** → вкладка **URI**; подставь пароль вместо `[YOUR-PASSWORD]` и добавь в конец **`?sslmode=require`** — без этого подключение с Vercel часто падает).  
   - Отметь окружения: **Production** (и при желании **Preview**).  
   - Нажми **Save**.

4. **Сохрани остальные переменные** (если ещё не добавлены):  
   `ADMIN_TOKEN`, `TG_BOT_TOKEN`, `TG_CHAT_ID`, `NEXT_PUBLIC_APP_URL` — так же: Key, Value, окружения, Save.

5. **Сделать Redeploy, чтобы приложение подхватило переменные**  
   - В верхнем меню проекта перейди на вкладку **Deployments**.  
   - В списке деплоев найди последний (самый верхний).  
   - Справа у этого деплоя нажми на **три точки (⋯)**.  
   - В меню выбери **Redeploy**.  
   - В диалоге подтверди **Redeploy** (без изменений — просто пересобрать с текущими переменными).  
   - Дождись окончания сборки (статус **Ready**).  

После этого приложение на Vercel будет использовать твою базу Supabase. Каталог и заказы будут читаться/писаться в неё.

---

## Шаг 5. Применить схему и данные к БД

Один раз на своём компьютере (подставь свой `DATABASE_URL` из шага 2):

```bash
cd /Users/nikitaocagov/Documents/Telegram-miniapp1
DATABASE_URL="postgresql://postgres.xxx:ПАРОЛЬ@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" npm run db:push
DATABASE_URL="postgresql://postgres.xxx:ПАРОЛЬ@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" npm run db:seed
```

Должно выполниться без ошибок. В Supabase в разделе **Table Editor** появятся таблицы и данные меню.

---

## Шаг 6. Бот в Telegram

1. Открой [@BotFather](https://t.me/BotFather).
2. Отправь **`/newbot`** → придумай имя (например «МИМИ Заказы») → придумай username (должен заканчиваться на `bot`, например `mimi_shushary_bot`).
3. BotFather пришлёт сообщение с **токеном** вида `7123456789:AAH...`. Скопируй его.
4. В Vercel в **Settings** → **Environment Variables** добавь (или измени) переменную **`TG_BOT_TOKEN`** = этот токен. Сделай **Redeploy**.

---

## Шаг 7. Кнопка меню (Mini App)

1. В BotFather отправь **`/setmenubutton`**.
2. Выбери своего бота.
3. Введи URL приложения: **`https://твой-проект.vercel.app`** (тот же, что в `NEXT_PUBLIC_APP_URL`).
4. Текст кнопки можно оставить по умолчанию или написать, например: **Открыть меню**.

Теперь в чате с ботом слева от поля ввода появится кнопка — по нажатию откроется твой каталог.

---

## Шаг 8. Уведомления о заказах (TG_CHAT_ID)

1. Создай группу в Telegram (или используй существующую для менеджеров).
2. Добавь в группу своего бота (поиск по username). При необходимости сделай его администратором.
3. Напиши в группе любое сообщение (например «тест»).
4. В браузере открой (подставь свой токен бота):
   ```
   https://api.telegram.org/bot7123456789:AAHxxxxxx/getUpdates
   ```
5. В ответе найди блок `"chat": { "id": -1001234567890, ... }`. Число **id** (с минусом) — это **TG_CHAT_ID**.
6. В Vercel добавь переменную **`TG_CHAT_ID`** = это число (например `-1001234567890`). **Redeploy**.

После этого при каждом новом заказе в эту группу будет приходить сообщение от бота.

---

## Шаг 9. Проверка

1. Открой бота в Telegram → нажми кнопку меню → должен открыться каталог МИМИ.
2. Добавь товар в корзину, оформи заказ (можно тестовые данные).
3. В группе должно прийти уведомление о заказе.
4. Админка заказов: в браузере открой  
   `https://твой-проект.vercel.app/admin/orders?token=ТВОЙ_ADMIN_TOKEN`  
   — должен отображаться список заказов.
5. Админка меню:  
   `https://твой-проект.vercel.app/admin/menu/categories?token=ТВОЙ_ADMIN_TOKEN`

---

## Оплата (позже)

Когда захочешь включить ЮKassa:

1. В Vercel добавь переменные: **`YOOKASSA_SHOP_ID`**, **`YOOKASSA_SECRET_KEY`**, обнови **`NEXT_PUBLIC_APP_URL`** если нужно.
2. В кабинете ЮKassa укажи webhook: `https://твой-проект.vercel.app/api/payments/webhook`, событие **payment.succeeded**.

Без этих переменных заказы работают без оплаты (оплата при оформлении не запрашивается).
