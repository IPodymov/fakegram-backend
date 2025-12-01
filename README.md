# 📸 Fakegram Backend

Instagram Clone REST API построенный на NestJS, TypeORM и PostgreSQL.

## 📋 Описание

Полнофункциональный backend для социальной сети в стиле Instagram с поддержкой:
- Регистрации и аутентификации пользователей
- Постов с фото/видео
- Историй (stories) с 24-часовым сроком действия
- Комментариев и лайков
- Системы подписок (followers/following)
- Личных сообщений
- Уведомлений
- Reels (короткие видео)

## 🚀 Технологический стек

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM 0.3
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator, class-transformer
- **Password Hashing**: bcrypt
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
DB_HOST=your-database-host
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_DATABASE=fakegram

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d

# App
PORT=3000
NODE_ENV=development
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
- **posts** - Посты с фото/видео
- **stories** - Истории (24 часа)
- **comments** - Комментарии к постам
- **likes** - Лайки постов
- **followers** - Подписки между пользователями
- **direct_messages** - Личные сообщения
- **notifications** - Уведомления
- **reels** - Короткие видео
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
        └─< user_reel_history

posts ──┬─< comments
        └─< likes

reels ──< user_reel_history

comments ──< comments (parent_comment_id)
```

## 📡 API Endpoints

### 🔐 Аутентификация

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
    ...
  }
}
```

**Errors:**
- `401 Unauthorized` - Неверные учетные данные

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
    "profilePictureUrl": "https://...",
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

#### Создать пользователя
```http
POST /users
Content-Type: application/json

{
  "username": "jane_doe",
  "email": "jane@example.com",
  "passwordHash": "hashed_password",
  "fullName": "Jane Doe",
  "bio": "Travel blogger",
  "isPrivate": false
}
```

#### Обновить пользователя
```http
PUT /users/:id
Content-Type: application/json

{
  "fullName": "Jane Smith",
  "bio": "Updated bio",
  "profilePictureUrl": "https://...",
  "website": "https://janesmith.com",
  "isPrivate": true
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
│   │   ├── guards/            # Guards (JwtAuthGuard)
│   │   ├── filters/           # Exception фильтры
│   │   └── interceptors/      # Interceptors
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
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/            # Пользователи
│   │   ├── posts/            # Посты
│   │   ├── stories/          # Истории
│   │   ├── comments/         # Комментарии
│   │   ├── likes/            # Лайки
│   │   ├── followers/        # Подписки
│   │   ├── messages/         # Сообщения
│   │   ├── notifications/    # Уведомления
│   │   └── reels/            # Reels
│   ├── app.module.ts         # Корневой модуль
│   └── main.ts               # Entry point
├── test/                      # Тесты
├── .env.example              # Пример env файла
├── package.json
└── tsconfig.json
```

## 🔧 Валидация данных

Проект использует `class-validator` для валидации входных данных:

### RegisterDto
- `username`: минимум 3 символа, обязательное
- `email`: валидный email, обязательное
- `password`: минимум 6 символов, обязательное

### LoginDto
- `username`: строка, обязательное
- `password`: строка, обязательное

### UpdateUserDto
- `fullName`: строка, опциональное
- `bio`: строка, опциональное
- `profilePictureUrl`: валидный URL, опциональное
- `website`: валидный URL, опциональное
- `isPrivate`: boolean, опциональное

### CreatePostDto
- `userId`: строка, обязательное
- `mediaUrl`: валидный URL, обязательное
- `caption`: строка, опциональное
- `isVideo`: boolean, опциональное
- `location`: строка, опциональное

## 🛡️ Безопасность

- Пароли хешируются с использованием bcrypt (10 rounds)
- JWT токены с настраиваемым временем жизни (по умолчанию 7 дней)
- Проверка уникальности username и email при регистрации
- Валидация всех входных данных
- TypeORM параметризованные запросы (защита от SQL-инъекций)
- CORS настройки

## 📈 Планируемые функции

- [ ] WebSocket для real-time чата и уведомлений
- [ ] Загрузка файлов (локально и в S3)
- [ ] Пагинация для списков
- [ ] Rate limiting
- [ ] Email верификация
- [ ] Двухфакторная аутентификация
- [ ] Расширенный поиск
- [ ] Рекомендательная система
- [ ] Аналитика и статистика

## 📝 Документация API

Подробная документация API доступна в файле [API.md](./API.md)

## 🤝 Contributing

Contributions, issues and feature requests приветствуются!

## 📄 Лицензия

[MIT](LICENSE)

## 👨‍💻 Автор

**Ivan Podymov**
- GitHub: [@IPodymov](https://github.com/IPodymov)

---

⭐️ Если проект был полезен, поставьте звездочку!
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

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
