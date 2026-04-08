# Fakegram Backend

Instagram Clone Backend API построенный на NestJS, TypeORM и PostgreSQL.
Архитектура — **Modular Monolith** с event-driven коммуникацией между модулями.

## 📁 Структура проекта

```
src/
├── config/                          # Конфигурационные файлы
│   └── jwt.config.ts                # Настройки JWT авторизации
├── infrastructure/                  # Инфраструктурный слой
│   ├── database/
│   │   ├── database.module.ts       # Глобальный модуль TypeORM
│   │   └── database.config.ts       # Настройки PostgreSQL/TypeORM
│   └── events/
│       └── events.module.ts         # Глобальный модуль EventEmitter
├── common/                          # Общие модули
│   ├── common.module.ts             # Глобальный модуль (UrlService)
│   ├── guards/                      # Guard'ы (JwtAuthGuard)
│   ├── decorators/                  # Декораторы (@CurrentUser)
│   ├── filters/                     # Exception фильтры
│   ├── services/                    # Общие сервисы (UrlService)
│   └── utils/                       # Утилиты (FileUtils)
└── modules/                         # Функциональные модули
    ├── auth/                        # Аутентификация
    │   ├── controllers/
    │   │   └── auth.controller.ts
    │   ├── services/
    │   │   └── auth.service.ts
    │   ├── domain/
    │   │   └── interfaces/
    │   │       └── email.interface.ts
    │   ├── dto/
    │   │   ├── login.dto.ts
    │   │   ├── register.dto.ts
    │   │   ├── enable-2fa.dto.ts
    │   │   └── verify-2fa.dto.ts
    │   └── auth.module.ts
    ├── users/                       # Управление пользователями
    │   ├── controllers/
    │   │   └── users.controller.ts
    │   ├── services/
    │   │   └── users.service.ts
    │   ├── domain/
    │   │   └── entities/
    │   │       └── user.entity.ts
    │   ├── dto/
    │   │   └── update-user.dto.ts
    │   ├── events/
    │   │   └── user.events.ts       # UserRegisteredEvent
    │   └── users.module.ts
    ├── posts/                       # Посты, комментарии, лайки, reels
    │   ├── controllers/
    │   │   └── posts.controller.ts
    │   ├── services/
    │   │   └── posts.service.ts
    │   ├── domain/
    │   │   └── entities/
    │   │       ├── post.entity.ts
    │   │       ├── comment.entity.ts
    │   │       ├── like.entity.ts
    │   │       ├── reel.entity.ts
    │   │       └── user-reel-history.entity.ts
    │   ├── dto/
    │   │   ├── create-post.dto.ts
    │   │   └── update-post.dto.ts
    │   ├── events/
    │   │   └── post.events.ts       # PostCreatedEvent, PostLikedEvent, CommentAddedEvent...
    │   └── posts.module.ts
    ├── stories/                     # Истории (24ч)
    │   ├── controllers/
    │   │   └── stories.controller.ts
    │   ├── services/
    │   │   └── stories.service.ts
    │   ├── domain/
    │   │   └── entities/
    │   │       └── story.entity.ts
    │   ├── dto/
    │   │   └── create-story.dto.ts
    │   └── stories.module.ts
    ├── followers/                   # Подписки
    │   ├── controllers/
    │   │   └── followers.controller.ts
    │   ├── services/
    │   │   └── followers.service.ts
    │   ├── domain/
    │   │   └── entities/
    │   │       └── follower.entity.ts
    │   ├── events/
    │   │   └── follower.events.ts   # UserFollowedEvent, UserUnfollowedEvent
    │   └── followers.module.ts
    ├── notifications/               # Уведомления (event-driven)
    │   ├── controllers/
    │   │   └── notifications.controller.ts
    │   ├── services/
    │   │   └── notifications.service.ts  # @OnEvent listeners
    │   ├── domain/
    │   │   └── entities/
    │   │       └── notification.entity.ts
    │   ├── events/
    │   │   └── notification.events.ts
    │   └── notifications.module.ts
    ├── chats/                       # Чаты и сообщения
    │   ├── controllers/
    │   │   └── chats.controller.ts
    │   ├── services/
    │   │   └── chats.service.ts
    │   ├── domain/
    │   │   └── entities/
    │   │       ├── chat.entity.ts
    │   │       ├── chat-member.entity.ts
    │   │       └── message.entity.ts
    │   ├── dto/
    │   │   ├── create-chat.dto.ts
    │   │   ├── join-chat.dto.ts
    │   │   └── send-message.dto.ts
    │   └── chats.module.ts
    └── short-links/                 # Короткие ссылки
        ├── controllers/
        │   └── short-links.controller.ts
        ├── services/
        │   └── short-links.service.ts
        ├── domain/
        │   └── entities/
        │       └── short-link.entity.ts
        └── short-links.module.ts
```

## 🧩 Архитектура: Modular Monolith

Проект построен по принципу **Modular Monolith** — каждый модуль инкапсулирует свою бизнес-логику и данные.

### Принципы

1. **Один модуль = один домен** — каждый модуль владеет своими сущностями, сервисами и контроллерами
2. **Event-driven коммуникация** — модули общаются через события (`@nestjs/event-emitter`), а не прямые вызовы сервисов соседних модулей
3. **Инфраструктурный слой** — `DatabaseModule` и `EventsModule` вынесены в `src/infrastructure/` как глобальные модули
4. **Общий слой** — `CommonModule` содержит guards, decorators, filters и утилиты, которые используются всеми модулями

### Event-driven коммуникация

| Событие | Источник | Обработчик |
|---------|----------|------------|
| `user.registered` | AuthService | — |
| `post.created` | PostsService | — |
| `post.deleted` | PostsService | — |
| `post.liked` | PostsService | NotificationsService |
| `comment.added` | PostsService | NotificationsService |
| `user.followed` | FollowersService | NotificationsService |
| `user.unfollowed` | FollowersService | — |

### Структура модуля

```
module/
├── controllers/          # HTTP-эндпоинты
├── services/             # Бизнес-логика
├── domain/
│   ├── entities/         # TypeORM-сущности
│   └── interfaces/       # Интерфейсы домена
├── dto/                  # Data Transfer Objects
├── events/               # Event-классы
└── module.ts             # NestJS модуль
```

## 🗄️ База данных

Схема базы данных включает следующие таблицы:

- **users** - пользователи
- **posts** - посты с фото/видео (base64 загрузка)
- **stories** - истории (24 часа)
- **comments** - комментарии к постам
- **likes** - лайки постов
- **followers** - подписки между пользователями
- **chats** - чаты (личные и групповые)
- **chat_members** - участники чатов
- **messages** - сообщения в чатах
- **notifications** - уведомления (лайки, подписки, комментарии)
- **short_links** - короткие ссылки для шаринга профилей
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
npm install cookie-parser@^1.4.6
npm install pg@^8.11.3
npm install reflect-metadata@^0.2.2
npm install rxjs@^7.8.1
npm install typeorm@^0.3.20
```

### Development зависимости

```bash
npm install -D @types/bcrypt@^5.0.2
npm install -D @types/cookie-parser@^1.4.7
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

> Все эндпоинты имеют глобальный префикс `/api`.

### Аутентификация (Cookie-based)
- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Авторизация (устанавливает httpOnly cookie)
- `POST /api/auth/logout` - Выход (очищает cookie)
- `GET /api/auth/me` - Текущий пользователь

### Пользователи
- `GET /api/users` - Список пользователей
- `GET /api/users/:id` - Профиль пользователя
- `GET /api/users/username/:username` - Поиск по username
- `GET /api/users/suggestions` - Рекомендации пользователей для подписки
- `GET /api/users/search?query=...` - Поиск по запросу
- `PUT /api/users/:id` - Обновление профиля
- `DELETE /api/users/:id` - Удаление пользователя

### Посты
- `GET /api/posts` - Лента постов
- `GET /api/posts?userId=:id` - Посты пользователя
- `GET /api/posts/:id` - Один пост
- `POST /api/posts` - Создать пост (с base64 изображением)
- `PUT /api/posts/:id` - Обновить пост
- `DELETE /api/posts/:id` - Удалить пост

### Уведомления
- `GET /api/notifications` - Все уведомления
- `GET /api/notifications/unread` - Непрочитанные уведомления
- `GET /api/notifications/unread-count` - Количество непрочитанных
- `PATCH /api/notifications/:id/read` - Пометить как прочитанное
- `PATCH /api/notifications/read-all` - Пометить все как прочитанные
- `DELETE /api/notifications/:id` - Удалить уведомление
- `DELETE /api/notifications` - Удалить все уведомления

### Короткие ссылки
- `POST /api/short-links` - Создать короткую ссылку
- `GET /api/short-links/me` - Получить свою короткую ссылку
- `GET /api/s/:code` - Перейти по короткой ссылке (redirect)
- `DELETE /api/short-links` - Удалить короткую ссылку

### Чаты
- `POST /api/chats` - Создать чат (direct или группа)
- `GET /api/chats` - Список чатов текущего пользователя
- `GET /api/chats/:id` - Детали чата
- `POST /api/chats/join` - Присоединиться по инвайт-коду
- `POST /api/chats/:id/messages` - Отправить сообщение
- `GET /api/chats/:id/messages` - Получить сообщения чата
- `POST /api/chats/:id/invite` - Создать инвайт-ссылку

## 🔧 Технологии

- **NestJS** - фреймворк для Node.js
- **TypeORM** - ORM для работы с БД
- **PostgreSQL** - реляционная база данных
- **JWT** - аутентификация через токены
- **httpOnly Cookies** - хранение JWT в защищенных cookie
- **@nestjs/event-emitter** - event-driven коммуникация между модулями
- **cookie-parser** - middleware для работы с cookies
- **bcrypt** - хеширование паролей
- **class-validator** - валидация данных
- **class-transformer** - трансформация объектов
- **Swagger** - автогенерация API документации
- **Base64** - загрузка изображений в строковом формате

## 📚 Дополнительно

Реализованные модули:
- ✅ Аутентификация с cookie-based JWT
- ✅ Двухфакторная аутентификация через email
- ✅ Управление пользователями с рекомендациями
- ✅ Посты с base64 загрузкой изображений
- ✅ Истории (stories) с 24-часовым сроком действия
- ✅ Уведомления (event-driven: лайки, подписки, комментарии)
- ✅ Короткие ссылки для шаринга профилей
- ✅ Система подписок
- ✅ Лайки и комментарии
- ✅ Чаты (личные и групповые) с инвайт-ссылками
- ✅ Reels (короткие видео)
- ✅ Modular Monolith архитектура с event-driven коммуникацией

Требуется реализовать:
- WebSocket для real-time чата и уведомлений
- Rate limiting
- Тесты
