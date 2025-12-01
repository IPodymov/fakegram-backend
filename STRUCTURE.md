# Fakegram Backend

Instagram Clone Backend API построенный на NestJS, TypeORM и PostgreSQL.

## 📁 Структура проекта

```
src/
├── config/                 # Конфигурационные файлы
│   ├── database.config.ts  # Настройки PostgreSQL/TypeORM
│   └── jwt.config.ts       # Настройки JWT авторизации
├── common/                 # Общие модули
│   ├── guards/            # Guard'ы (JwtAuthGuard)
│   ├── decorators/        # Декораторы (@CurrentUser)
│   ├── interceptors/      # Interceptor'ы
│   └── filters/           # Exception фильтры
├── entities/              # TypeORM Entities (модели БД)
│   ├── user.entity.ts
│   ├── post.entity.ts
│   ├── story.entity.ts
│   ├── comment.entity.ts
│   ├── like.entity.ts
│   ├── follower.entity.ts
│   ├── direct-message.entity.ts
│   ├── notification.entity.ts
│   ├── reel.entity.ts
│   └── user-reel-history.entity.ts
└── modules/               # Функциональные модули
    ├── auth/             # Аутентификация (login, register)
    │   ├── dto/
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   └── auth.module.ts
    ├── users/            # Управление пользователями
    │   ├── dto/
    │   ├── users.controller.ts
    │   ├── users.service.ts
    │   └── users.module.ts
    ├── posts/            # Посты
    │   ├── dto/
    │   ├── posts.controller.ts
    │   ├── posts.service.ts
    │   └── posts.module.ts
    ├── stories/          # Истории (24ч)
    ├── comments/         # Комментарии к постам
    ├── likes/            # Лайки
    ├── followers/        # Подписки
    ├── messages/         # Личные сообщения
    ├── notifications/    # Уведомления
    └── reels/            # Reels видео
```

## 🗄️ База данных

Схема базы данных включает следующие таблицы:

- **users** - пользователи
- **posts** - посты с фото/видео
- **stories** - истории (24 часа)
- **comments** - комментарии к постам
- **likes** - лайки постов
- **followers** - подписки между пользователями
- **direct_messages** - личные сообщения
- **notifications** - уведомления
- **reels** - короткие видео
- **user_reel_history** - история просмотров reels

## 🚀 Установка зависимостей

### Production зависимости

```bash
npm install @nestjs/common@^11.0.1
npm install @nestjs/config@^3.2.2
npm install @nestjs/core@^11.0.1
npm install @nestjs/jwt@^10.2.0
npm install @nestjs/platform-express@^11.0.1
npm install @nestjs/typeorm@^10.0.2
npm install bcrypt@^5.1.1
npm install class-transformer@^0.5.1
npm install class-validator@^0.14.1
npm install pg@^8.11.3
npm install reflect-metadata@^0.2.2
npm install rxjs@^7.8.1
npm install typeorm@^0.3.20
```

### Development зависимости

```bash
npm install -D @types/bcrypt@^5.0.2
```

## 📦 Установка одной командой

```bash
npm install
```

## ⚙️ Настройка окружения

Скопируйте `.env.example` в `.env` и настройте переменные окружения:

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите параметры вашей базы данных PostgreSQL.

## 🏃 Запуск проекта

```bash
# Development режим
npm run start:dev

# Production режим
npm run build
npm run start:prod
```

## 📝 API Endpoints

### Аутентификация
- `POST /auth/register` - Регистрация пользователя
- `POST /auth/login` - Авторизация

### Пользователи
- `GET /users` - Список пользователей
- `GET /users/:id` - Профиль пользователя
- `GET /users/username/:username` - Поиск по username
- `PUT /users/:id` - Обновление профиля
- `DELETE /users/:id` - Удаление пользователя

### Посты
- `GET /posts` - Лента постов
- `GET /posts?userId=:id` - Посты пользователя
- `GET /posts/:id` - Один пост
- `POST /posts` - Создать пост
- `PUT /posts/:id` - Обновить пост
- `DELETE /posts/:id` - Удалить пост

## 🔧 Технологии

- **NestJS** - фреймворк для Node.js
- **TypeORM** - ORM для работы с БД
- **PostgreSQL** - реляционная база данных
- **JWT** - аутентификация через токены
- **bcrypt** - хеширование паролей
- **class-validator** - валидация данных
- **class-transformer** - трансформация объектов

## 📚 Дополнительно

Для полноценной работы необходимо реализовать:
- Модули для stories, comments, likes, followers, messages, notifications, reels
- Загрузку файлов (локально или в S3)
- WebSocket для real-time чата и уведомлений
- Пагинацию для списков
- Rate limiting
- Тесты
