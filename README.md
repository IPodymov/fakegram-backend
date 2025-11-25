# Fakegram Backend

Это серверная часть (Backend API) для проекта **Fakegram** — клона популярной социальной сети Instagram. Приложение построено на базе фреймворка [NestJS](https://github.com/nestjs/nest).

## 🛠 Технологический стек

- **Фреймворк:** NestJS (Node.js)
- **Язык:** TypeScript
- **База данных:** PostgreSQL
- **ORM:** TypeORM
- **Аутентификация:** JWT, Passport
- **Тестирование:** Jest, Supertest
- **Линтинг/Форматирование:** ESLint, Prettier

## 🚀 Начало работы

Следуйте этим инструкциям, чтобы запустить копию проекта на локальной машине для разработки и тестирования.

### Предварительные требования

Убедитесь, что у вас установлены:

- [Node.js](https://nodejs.org/) (версии 16 или выше)
- Менеджер пакетов `npm` или `yarn`

### Установка

1. Клонируйте репозиторий:

   ```bash
   git clone https://github.com/IPodymov/fakegram-backend.git
   cd fakegram-backend
   ```

2. Установите зависимости:
   ```bash
   npm install
   # или
   yarn install
   ```

### Конфигурация

Создайте файл `.env` в корне проекта. Вы можете скопировать пример ниже:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fakegram
JWT_SECRET=super-secret-key
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=fakegram
```

### Запуск приложения

```bash
# режим разработки (с горячей перезагрузкой)
npm run start:dev

# режим отладки
npm run start:debug

# продакшн режим
npm run start:prod
```

### 🐳 Запуск через Docker

Для быстрого развертывания приложения вместе с базой данных используйте Docker Compose:

```bash
# Сборка и запуск контейнеров
docker-compose up --build -d

# Просмотр логов
docker-compose logs -f
```

После запуска сервер будет доступен по адресу `http://localhost:3000`.

## 🧪 Тестирование

Проект включает в себя юнит-тесты и e2e тесты.

```bash
# запуск юнит-тестов
npm run test

# запуск тестов с покрытием кода
npm run test:cov

# запуск e2e (end-to-end) тестов
npm run test:e2e
```

## 📦 Основные модули

- **Auth**: Регистрация, вход в систему, JWT-аутентификация.
- **Users**: Профили пользователей, история просмотров.
- **Posts**: Создание постов, лента новостей.
- **Reels**: Короткие видеоролики.
- **Uploads**: Загрузка и раздача статических файлов.

## 📁 Структура проекта

Проект следует стандартной архитектуре NestJS:

- `src/` — Исходный код приложения
  - `main.ts` — Точка входа
  - `app.module.ts` — Корневой модуль
- `test/` — E2E тесты

## 📝 Лицензия

Этот проект является учебным/демонстрационным и не имеет специальной лицензии (UNLICENSED).

## 📡 API Endpoints

### Auth (`/auth`)
- `POST /auth/register` — Регистрация нового пользователя
- `POST /auth/login` — Авторизация и получение JWT токена

### Posts (`/posts`)
- `GET /posts` — Получение списка всех постов
- `POST /posts` — Создание нового поста (требуется JWT, `multipart/form-data` с полем `file`)

### Reels (`/reels`)
- `GET /reels` — Получение списка всех рилсов
- `GET /reels/:id` — Получение информации о конкретном рилсе
- `POST /reels` — Загрузка нового рилса (требуется JWT, `multipart/form-data` с полем `file`, только видео)
- `POST /reels/:id/watch` — Отметить рилс как просмотренный (требуется JWT)

### Users (`/users`)
- `GET /users/history/reels` — Получение истории просмотренных рилсов (требуется JWT)

### App (`/`)
- `GET /` — Проверка работоспособности API
