# Загрузка изображений

## Два способа загрузки изображений

### 1. Base64 загрузка (Текущий метод)

Изображения передаются в формате base64 строки непосредственно в JSON теле запроса.

**Преимущества:**
- Простота реализации
- Не требуется дополнительное хранилище
- Изображения хранятся в базе данных

**Недостатки:**
- Большой размер данных (на ~33% больше бинарного)
- Нагрузка на базу данных

**Пример создания поста с изображением:**

```javascript
const imageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';

fetch('http://localhost:3000/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    caption: 'My new post',
    mediaUrl: imageBase64, // Base64 строка
    mediaType: 'image'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

**Пример обновления аватара пользователя:**

```javascript
const avatarBase64 = 'data:image/png;base64,iVBORw0KGgo...';

fetch('http://localhost:3000/users/USER_ID', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    profilePictureUrl: avatarBase64
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

**Формат base64 строки:**
```
data:[MIME_TYPE];base64,[BASE64_DATA]
```

Примеры:
- `data:image/jpeg;base64,/9j/4AAQSkZJRg...`
- `data:image/png;base64,iVBORw0KGgo...`
- `data:image/webp;base64,UklGRiQA...`

### 2. Multipart/form-data загрузка (Альтернативный метод)

## API для обновления фотографии профиля (multipart/form-data)

### Загрузка фотографии профиля

**PATCH** `/users/:id/profile-picture`

**Content-Type:** `multipart/form-data`

**Параметры:**
- `file` - файл изображения (обязательный)

**Ограничения:**
- Размер файла: максимум 5MB
- Форматы: jpg, jpeg, png, gif, webp

**Пример запроса (curl):**
```bash
curl -X PATCH http://localhost:3000/users/USER_ID/profile-picture \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

**Пример запроса (JavaScript/Fetch):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:3000/users/USER_ID/profile-picture', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data));
```

**Ответ:**
```json
{
  "profilePictureUrl": "/uploads/profile-pictures/USER_ID-1234567890-987654321.jpg"
}
```

### Обновление профиля без загрузки файла

**PUT** `/users/:id`

**Content-Type:** `application/json`

**Body:**
```json
{
  "username": "new_username",
  "fullName": "John Doe",
  "bio": "My bio",
  "profilePictureUrl": "https://example.com/image.jpg",
  "website": "https://example.com",
  "isPrivate": false
}
```

Все поля опциональны.

## Структура директорий

```
fakegram-backend/
├── uploads/
│   └── profile-pictures/
│       └── [USER_ID]-[TIMESTAMP]-[RANDOM].[ext]
```

## Доступ к загруженным файлам

Загруженные файлы доступны по URL:
```
http://localhost:3000/uploads/profile-pictures/filename.jpg
```

## Примечания

1. Файлы сохраняются локально в директории `uploads/profile-pictures/`
2. Имя файла генерируется автоматически: `USER_ID-TIMESTAMP-RANDOM.ext`
3. После успешной загрузки поле `profilePictureUrl` в БД обновляется автоматически
4. Старые фотографии не удаляются автоматически (нужно реализовать отдельно)

## Для продакшена

Рекомендуется использовать облачное хранилище (AWS S3, Cloudinary, etc.) вместо локального хранения:

### Пример с Cloudinary:

```bash
npm install cloudinary
```

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Patch(':id/profile-picture')
async uploadProfilePicture(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
) {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'profile-pictures',
    public_id: id,
  });

  const profilePictureUrl = result.secure_url;
  await this.usersService.update(id, { profilePictureUrl });

  return { profilePictureUrl };
}
```
