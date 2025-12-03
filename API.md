# Fakegram API Documentation

## Авторизация и регистрация

### Регистрация нового пользователя

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `username`: минимум 3 символа, обязательное поле
- `email`: валидный email адрес, обязательное поле
- `password`: минимум 6 символов, обязательное поле

**Success Response (201):**
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

**Error Responses:**

- **409 Conflict** - Username уже существует
```json
{
  "statusCode": 409,
  "message": "Username already exists"
}
```

- **409 Conflict** - Email уже существует
```json
{
  "statusCode": 409,
  "message": "Email already exists"
}
```

- **400 Bad Request** - Ошибка валидации
```json
{
  "statusCode": 400,
  "message": [
    "username must be longer than or equal to 3 characters",
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

---

### Вход в систему

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

**Error Responses:**

- **401 Unauthorized** - Неверные учетные данные
```json
{
  "statusCode": 401,
  "message": "Invalid username or password"
}
```

- **400 Bad Request** - Ошибка валидации
```json
{
  "statusCode": 400,
  "message": [
    "username should not be empty",
    "password should not be empty"
  ],
  "error": "Bad Request"
}
```

---

## Примеры использования

### cURL

**Регистрация:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Логин:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securePassword123"
  }'
```

### JavaScript (Fetch API)

**Регистрация:**
```javascript
const register = async () => {
  const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'john_doe',
      email: 'john@example.com',
      password: 'securePassword123'
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

**Логин:**
```javascript
const login = async () => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'john_doe',
      password: 'securePassword123'
    })
  });
  
  const data = await response.json();
  
  // Сохраняем токен для последующих запросов
  localStorage.setItem('access_token', data.access_token);
  console.log(data);
};
```

**Использование токена для защищенных запросов:**
```javascript
const getProtectedData = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:3000/posts', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  console.log(data);
};
```

### Axios

```javascript
import axios from 'axios';

// Регистрация
const register = async () => {
  try {
    const response = await axios.post('http://localhost:3000/auth/register', {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'securePassword123'
    });
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
  }
};

// Логин
const login = async () => {
  try {
    const response = await axios.post('http://localhost:3000/auth/login', {
      username: 'john_doe',
      password: 'securePassword123'
    });
    
    // Сохраняем токен
    localStorage.setItem('access_token', response.data.access_token);
    
    // Настраиваем axios для использования токена по умолчанию
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
  }
};
```

---

## Безопасность

### JWT Token
- Токен действителен в течение 7 дней (настраивается в `.env`)
- Токен должен передаваться в заголовке `Authorization` как `Bearer {token}`
- Пароли хешируются с использованием bcrypt (10 rounds)

### Защищенные эндпоинты
Для использования защищенных эндпоинтов необходимо добавить guard в контроллер:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user) {
  return user;
}
```

---

## Структура JWT Payload

```json
{
  "username": "john_doe",
  "sub": "user-uuid",
  "email": "john@example.com",
  "iat": 1701432000,
  "exp": 1702036800
}
```

- `sub` - ID пользователя
- `iat` - время создания токена (issued at)
- `exp` - время истечения токена (expiration)

---

## Посты

### Создание поста

**Endpoint:** `POST /posts`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Мой первый пост",
  "content": "Это содержимое моего поста",
  "published": true,
  "mediaUrl": "https://example.com/image.jpg"
}
```

**Validation Rules:**
- `title`: строка, обязательное поле
- `content`: строка, обязательное поле
- `published`: boolean, необязательное (по умолчанию `true`)
- `mediaUrl`: строка (URL или base64), необязательное

**Success Response (201):**
```json
{
  "id": "uuid",
  "title": "Мой первый пост",
  "content": "Это содержимое моего поста",
  "published": true,
  "mediaUrl": "https://example.com/image.jpg",
  "userId": "user-uuid",
  "createdAt": "2025-12-03T10:00:00.000Z",
  "updatedAt": "2025-12-03T10:00:00.000Z"
}
```

---

### Получение всех постов

**Endpoint:** `GET /posts`

**Query Parameters:**
- `userId` (optional) - фильтр по ID пользователя

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Мой первый пост",
    "content": "Это содержимое моего поста",
    "published": true,
    "mediaUrl": "https://example.com/image.jpg",
    "userId": "user-uuid",
    "createdAt": "2025-12-03T10:00:00.000Z",
    "updatedAt": "2025-12-03T10:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "username": "john_doe",
      "fullName": "John Doe",
      "profilePictureUrl": "https://example.com/avatar.jpg"
    },
    "comments": [],
    "likes": []
  }
]
```

---

### Получение поста по ID

**Endpoint:** `GET /posts/:id`

**Success Response (200):**
```json
{
  "id": "uuid",
  "title": "Мой первый пост",
  "content": "Это содержимое моего поста",
  "published": true,
  "mediaUrl": "https://example.com/image.jpg",
  "userId": "user-uuid",
  "createdAt": "2025-12-03T10:00:00.000Z",
  "updatedAt": "2025-12-03T10:00:00.000Z",
  "user": {
    "id": "user-uuid",
    "username": "john_doe",
    "fullName": "John Doe"
  },
  "comments": [],
  "likes": []
}
```

---

### Обновление поста

**Endpoint:** `PUT /posts/:id`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Обновленный заголовок",
  "content": "Обновленное содержимое",
  "published": false,
  "mediaUrl": "https://example.com/new-image.jpg"
}
```

**Note:** Все поля необязательные

---

### Удаление поста

**Endpoint:** `DELETE /posts/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```
(void)
```

---

## Истории (Stories)

### Создание истории

**Endpoint:** `POST /stories`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Это моя история",
  "mediaUrl": "https://example.com/story-image.jpg"
}
```

**Validation Rules:**
- `content`: строка, обязательное поле
- `mediaUrl`: строка (URL или base64), необязательное

**Success Response (201):**
```json
{
  "id": "uuid",
  "content": "Это моя история",
  "mediaUrl": "https://example.com/story-image.jpg",
  "userId": "user-uuid",
  "createdAt": "2025-12-03T10:00:00.000Z",
  "expiresAt": "2025-12-04T10:00:00.000Z"
}
```

---

### Получение всех историй

**Endpoint:** `GET /stories`

**Query Parameters:**
- `userId` (optional) - фильтр по ID пользователя

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "content": "Это моя история",
    "mediaUrl": "https://example.com/story-image.jpg",
    "userId": "user-uuid",
    "createdAt": "2025-12-03T10:00:00.000Z",
    "expiresAt": "2025-12-04T10:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "username": "john_doe",
      "fullName": "John Doe",
      "profilePictureUrl": "https://example.com/avatar.jpg"
    }
  }
]
```

---

### Получение истории по ID

**Endpoint:** `GET /stories/:id`

**Success Response (200):**
```json
{
  "id": "uuid",
  "content": "Это моя история",
  "mediaUrl": "https://example.com/story-image.jpg",
  "userId": "user-uuid",
  "createdAt": "2025-12-03T10:00:00.000Z",
  "expiresAt": "2025-12-04T10:00:00.000Z",
  "user": {
    "id": "user-uuid",
    "username": "john_doe",
    "fullName": "John Doe"
  }
}
```

---

### Удаление истории

**Endpoint:** `DELETE /stories/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```
(void)
```

---

## Примеры использования постов и историй

### JavaScript (Fetch API)

**Создание поста:**
```javascript
const createPost = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:3000/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Мой пост',
      content: 'Содержимое поста',
      published: true,
      mediaUrl: 'https://example.com/image.jpg'
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

**Создание истории:**
```javascript
const createStory = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:3000/stories', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: 'Моя история',
      mediaUrl: 'https://example.com/story.jpg'
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

**Получение постов пользователя:**
```javascript
const getUserPosts = async (userId) => {
  const response = await fetch(`http://localhost:3000/posts?userId=${userId}`);
  const data = await response.json();
  console.log(data);
};
```

