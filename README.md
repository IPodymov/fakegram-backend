# 📸 Fakegram Backend

Instagram Clone REST API построенный на NestJS, TypeORM и PostgreSQL.

## 📋 Описание

Полнофункциональный backend для социальной сети в стиле Instagram с поддержкой:
- Регистрации и аутентификации пользователей (JWT + Cookie-based auth)
- Постов с фото/видео и возможностью загрузки изображений (base64)
- Историй (stories) с 24-часовым сроком действия
- Комментариев и лайков
- Системы подписок (followers/following)
- Уведомлений (лайки, подписки, новые посты)
- Личных сообщений
- Reels (короткие видео)
- Двухфакторной аутентификации через email (опционально)
- Загрузки фотографий профиля
- Коротких ссылок для шаринга профилей
- Рекомендаций пользователей для подписки

## 🚀 Технологический стек

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL (Railway)
- **ORM**: TypeORM 0.3
- **Authentication**: JWT (JSON Web Tokens) + httpOnly Cookies
- **Validation**: class-validator, class-transformer
- **Password Hashing**: bcrypt
- **File Upload**: Multer + Base64 processing
- **Cookie Parser**: cookie-parser
- **Testing**: Jest

## 📦 Установка

```bash
# Клонирование репозитория
git clone https://github.com/IPodymov/fakegram-backend.git
cd fakegram-backend

# Установка зависимостей
npm install
```

## ⚙️ Настройка окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Настройте переменные окружения:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d

# App
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*

# URLs
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

## 🏃 Запуск приложения

```bash
# Development режим
npm run start:dev

# Production режим
npm run build
npm run start:prod

# Debug режим
npm run start:debug
```

Приложение будет доступно по адресу: `http://localhost:3000`

## 🗄️ Структура базы данных

### Таблицы

- **users** - Пользователи системы
  - Поддержка 2FA (опционально)
  - Загрузка фотографий профиля
  - Валидация username (только английские буквы, цифры, _, .)
  - Автоматическая генерация shareUrl для шаринга
- **posts** - Посты с фото/видео (base64 загрузка)
- **stories** - Истории (24 часа)
- **comments** - Комментарии к постам
- **likes** - Лайки постов
- **followers** - Подписки между пользователями
- **direct_messages** - Личные сообщения
- **notifications** - Уведомления (лайки, подписки, комментарии, новые посты)
- **reels** - Короткие видео
- **short_links** - Короткие ссылки для профилей (автоматическая генерация)
- **user_reel_history** - История просмотров reels

### ER-диаграмма

```
users ──┬─< posts
        ├─< stories
        ├─< comments
        ├─< likes
        ├─< followers (follower_id)
        ├─< followers (following_id)
        ├─< direct_messages (sender_id)
        ├─< direct_messages (receiver_id)
        ├─< notifications
        ├─< reels
        ├─< short_links
        └─< user_reel_history

posts ──┬─< comments
        └─< likes

reels ──< user_reel_history

comments ──< comments (parent_comment_id)
```

## 📡 API Endpoints

### 🔐 Аутентификация (Cookie-based)

Все эндпоинты аутентификации автоматически устанавливают JWT токен в httpOnly cookie с именем `access_token`. Cookie действует 7 дней.

#### Регистрация
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Правила валидации:**
- `username`: минимум 3 символа, только английские буквы, цифры, подчеркивание и точка
- `email`: валидный email адрес
- `password`: минимум 6 символов

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": null,
    "bio": null,
    "profilePictureUrl": null,
    "website": null,
    "isPrivate": false,
    "createdAt": "2025-12-01T10:00:00.000Z"
  }
}
```

**Errors:**
- `409 Conflict` - Username или email уже существует
- `400 Bad Request` - Ошибка валидации

#### Вход
```http
POST /auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "twoFactorEnabled": false,
    ...
  }
}
```

**Errors:**
- `401 Unauthorized` - Неверные учетные данные

#### Включение/выключение 2FA (опционально)
```http
PATCH /auth/toggle-2fa
Authorization: Bearer <token>
Content-Type: application/json

{
  "enable": true
}
```

#### Подтверждение 2FA кода (опционально)
```http
POST /auth/verify-2fa
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "123456"
}
```

---

### 👤 Пользователи

#### Получить всех пользователей
```http
GET /users
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "bio": "Photography enthusiast",
    "profilePictureUrl": "/uploads/profile-pictures/...",
    "website": "https://johndoe.com",
    "isPrivate": false,
    "createdAt": "2025-12-01T10:00:00.000Z"
  }
]
```

#### Получить пользователя по ID
```http
GET /users/:id
```

#### Получить пользователя по username
```http
GET /users/username/:username
```

#### Обновить пользователя
```http
PUT /users/:id
Content-Type: application/json

{
  "username": "new_username",
  "fullName": "Jane Smith",
  "bio": "Updated bio",
  "website": "https://janesmith.com",
  "isPrivate": true
}
```

**Примечание:** Username должен содержать только английские буквы, цифры, подчеркивание и точку.

#### Загрузить фото профиля
```http
PATCH /users/:id/profile-picture
Content-Type: multipart/form-data

file: <image-file>
```

**Ограничения:**
- Максимальный размер: 5MB
- Форматы: jpg, jpeg, png, gif, webp

**Response (200):**
```json
{
  "profilePictureUrl": "/uploads/profile-pictures/user-id-timestamp.jpg"
}
```

#### Удалить пользователя
```http
DELETE /users/:id
```

---

### 📸 Посты

#### Получить все посты
```http
GET /posts
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "user-uuid",
    "mediaUrl": "https://...",
    "caption": "Beautiful sunset 🌅",
    "isVideo": false,
    "location": "Bali, Indonesia",
    "createdAt": "2025-12-01T10:00:00.000Z",
    "user": { ... },
    "comments": [ ... ],
    "likes": [ ... ]
  }
]
```

#### Получить посты пользователя
```http
GET /posts?userId=user-uuid
```

#### Получить пост по ID
```http
GET /posts/:id
```

**Response (200):**
```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "mediaUrl": "https://...",
  "caption": "Beautiful sunset 🌅",
  "isVideo": false,
  "location": "Bali, Indonesia",
  "createdAt": "2025-12-01T10:00:00.000Z",
  "user": {
    "id": "user-uuid",
    "username": "john_doe",
    ...
  },
  "comments": [
    {
      "id": "comment-uuid",
      "content": "Amazing!",
      "user": { ... }
    }
  ],
  "likes": [
    {
      "id": "like-uuid",
      "userId": "user-uuid"
    }
  ]
}
```

#### Создать пост
```http
POST /posts
Content-Type: application/json

{
  "userId": "user-uuid",
  "mediaUrl": "https://...",
  "caption": "Beautiful sunset 🌅",
  "isVideo": false,
  "location": "Bali, Indonesia"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "mediaUrl": "https://...",
  "caption": "Beautiful sunset 🌅",
  "isVideo": false,
  "location": "Bali, Indonesia",
  "createdAt": "2025-12-01T10:00:00.000Z"
}
```

#### Обновить пост
```http
PUT /posts/:id
Content-Type: application/json

{
  "caption": "Updated caption",
  "location": "New location"
}
```

#### Удалить пост
```http
DELETE /posts/:id
```

**Response (200):** No content

---

## 🔒 Аутентификация и авторизация

### JWT Token

Для доступа к защищенным эндпоинтам необходимо передавать JWT токен в заголовке:

```http
Authorization: Bearer <access_token>
```

### Пример с cURL

```bash
# Логин
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"password123"}' \
  | jq -r '.access_token')

# Использование токена
curl http://localhost:3000/users/me \
  -H "Authorization: Bearer $TOKEN"
```

### Пример с JavaScript

```javascript
// Логин
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'password123'
  })
});

const { access_token } = await response.json();

// Использование токена
const userResponse = await fetch('http://localhost:3000/users/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

## 🧪 Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Покрытие тестами
npm run test:cov
```

## 📁 Структура проекта

```
fakegram-backend/
├── src/
│   ├── common/                 # Общие модули
│   │   ├── decorators/        # Декораторы (@CurrentUser)
│   │   └── guards/            # Guards (JwtAuthGuard)
│   ├── config/                # Конфигурация
│   │   ├── database.config.ts # Настройки БД
│   │   └── jwt.config.ts      # Настройки JWT
│   ├── entities/              # TypeORM entities
│   │   ├── user.entity.ts
│   │   ├── post.entity.ts
│   │   ├── story.entity.ts
│   │   ├── comment.entity.ts
│   │   ├── like.entity.ts
│   │   ├── follower.entity.ts
│   │   ├── direct-message.entity.ts
│   │   ├── notification.entity.ts
│   │   ├── reel.entity.ts
│   │   └── user-reel-history.entity.ts
│   ├── modules/               # Функциональные модули
│   │   ├── auth/             # Аутентификация
│   │   │   ├── dto/          # Data Transfer Objects
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── enable-2fa.dto.ts
│   │   │   │   └── verify-2fa.dto.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/            # Пользователи
│   │   │   ├── dto/
│   │   │   │   └── update-user.dto.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   └── posts/            # Посты
│   │       ├── dto/
│   │       │   ├── create-post.dto.ts
│   │       │   └── update-post.dto.ts
│   │       ├── posts.controller.ts
│   │       ├── posts.service.ts
│   │       └── posts.module.ts
│   ├── app.module.ts         # Корневой модуль
│   └── main.ts               # Entry point
├── uploads/                   # Загруженные файлы (gitignored)
│   └── profile-pictures/
├── test/                      # Тесты
├── .env                       # Переменные окружения (gitignored)
├── .env.example              # Пример env файла
├── API.md                    # Подробная API документация
├── 2FA_IMPLEMENTATION.md     # Документация по 2FA
├── UPLOAD_IMAGES.md          # Документация по загрузке изображений
├── package.json
└── tsconfig.json
```

## 🔧 Валидация данных

Проект использует `class-validator` и глобальный `ValidationPipe` для валидации входных данных:

### RegisterDto
- `username`: минимум 3 символа, только английские буквы, цифры, подчеркивание и точка
- `email`: валидный email адрес
- `password`: минимум 6 символов

### LoginDto
- `username`: строка (для входа используется username)
- `password`: строка

### UpdateUserDto (все поля опциональны)
- `username`: минимум 3 символа, только английские буквы, цифры, _, .
- `fullName`: строка
- `bio`: строка
- `website`: строка
- `isPrivate`: boolean

### CreatePostDto
- `userId`: строка UUID
- `mediaUrl`: валидный URL
- `caption`: строка (опционально)
- `isVideo`: boolean (опционально)
- `location`: строка (опционально)

## 🛡️ Безопасность

- Пароли хешируются с использованием bcrypt (10 rounds)
- JWT токены с настраиваемым временем жизни (по умолчанию 7 дней)
- Проверка уникальности username и email при регистрации
- Валидация всех входных данных с `whitelist` и `forbidNonWhitelisted`
- TypeORM параметризованные запросы (защита от SQL-инъекций)
- CORS настройки с возможностью ограничения origin
- Загрузка файлов: ограничение размера (5MB) и типов файлов

## 🚀 Расширенные функции

### Двухфакторная аутентификация (2FA)
- Опциональная 2FA через email
- 6-значные коды с истечением через 10 минут
- См. [2FA_IMPLEMENTATION.md](./2FA_IMPLEMENTATION.md)

### Загрузка изображений
- Загрузка фотографий профиля через multipart/form-data
- Локальное хранение в `uploads/profile-pictures/`
- Автоматическая генерация имён файлов
- См. [UPLOAD_IMAGES.md](./UPLOAD_IMAGES.md)

### Валидация username
- Только английские буквы (a-z, A-Z)
- Цифры (0-9)
- Подчеркивание (_) и точка (.)
- Минимум 3 символа
- Уникальность проверяется при регистрации и обновлении

## 📈 Планируемые функции

- [ ] WebSocket для real-time чата и уведомлений
- [ ] Облачное хранилище (AWS S3, Cloudinary)
- [ ] Пагинация для списков
- [ ] Rate limiting
- [ ] Email верификация
- [x] Двухфакторная аутентификация (базовая реализация)
- [ ] Расширенный поиск
- [ ] Рекомендательная система
- [ ] Аналитика и статистика

## 📝 Документация

- [API.md](./API.md) - Подробная документация всех API endpoints
- [2FA_IMPLEMENTATION.md](./2FA_IMPLEMENTATION.md) - Руководство по двухфакторной аутентификации
- [UPLOAD_IMAGES.md](./UPLOAD_IMAGES.md) - Руководство по загрузке изображений
- [STRUCTURE.md](./STRUCTURE.md) - Структура проекта
- [LICENSE.md](./LICENSE.md) - Лицензия MIT
- [TERMS_OF_SERVICE.md](./TERMS_OF_SERVICE.md) - Пользовательское соглашение

## 🤝 Contributing

Contributions, issues and feature requests приветствуются!

Перед началом работы ознакомьтесь с:
- [Пользовательским соглашением](./TERMS_OF_SERVICE.md)
- [Лицензией проекта](./LICENSE.md)

## 📄 Лицензия

Этот проект лицензирован под **MIT License** - см. файл [LICENSE.md](./LICENSE.md) для подробностей.

### Основные права:
- ✅ Коммерческое использование
- ✅ Модификация
- ✅ Распространение
- ✅ Частное использование

### Ограничения:
- ❌ Отсутствие гарантий
- ❌ Отсутствие ответственности

## ⚖️ Условия использования

См. полные [Условия использования](./TERMS_OF_SERVICE.md) для информации о:
- Ответственности пользователя
- Политике конфиденциальности
- Использовании API
- Ограничениях загрузки файлов
- Отказе от ответственности

**Важно:** Это учебный/демонстрационный проект. Не рекомендуется использовать в production без надлежащего аудита безопасности.

## 👨‍💻 Автор

**Ivan Podymov**
- GitHub: [@IPodymov](https://github.com/IPodymov)

---

⭐️ Если проект был полезен, поставьте звездочку!

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
