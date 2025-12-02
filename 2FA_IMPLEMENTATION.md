# Двухфакторная аутентификация (2FA) через Email

## Описание реализации

Система поддерживает двухфакторную аутентификацию через email. Когда пользователь входит в систему с включенной 2FA, на его email отправляется 6-значный код подтверждения, который действителен в течение 10 минут.

## API Endpoints

### 1. Вход в систему (Login)
**POST** `/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Ответ (если 2FA выключена):**
```json
{
  "access_token": "jwt-token",
  "user": {
    "id": "uuid",
    "username": "username",
    "email": "user@example.com",
    "twoFactorEnabled": false,
    ...
  }
}
```

**Ответ (если 2FA включена):**
```json
{
  "message": "Verification code sent to your email",
  "requires2FA": true
}
```

### 2. Подтверждение 2FA кода
**POST** `/auth/verify-2fa`

**Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Ответ:**
```json
{
  "access_token": "jwt-token",
  "user": {
    ...
  }
}
```

### 3. Включение/выключение 2FA
**PATCH** `/auth/toggle-2fa`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Body:**
```json
{
  "enable": true
}
```

**Ответ:**
```json
{
  "message": "2FA enabled successfully"
}
```

## Структура БД

В таблицу `users` добавлены следующие поля:

```typescript
{
  twoFactorEnabled: boolean;        // Включена ли 2FA
  twoFactorCode: string | null;     // Временный код (6 цифр)
  twoFactorCodeExpiresAt: Date | null; // Время истечения кода
}
```

## Процесс работы 2FA

1. **Включение 2FA:**
   - Пользователь отправляет запрос `PATCH /auth/toggle-2fa` с `{ "enable": true }`
   - Система устанавливает `twoFactorEnabled = true`

2. **Вход с 2FA:**
   - Пользователь отправляет `POST /auth/login` с email и паролем
   - Система проверяет учетные данные
   - Если `twoFactorEnabled = true`:
     - Генерируется 6-значный код
     - Код сохраняется в БД вместе со временем истечения (+10 минут)
     - Код отправляется на email
     - Возвращается `{ requires2FA: true }`

3. **Подтверждение кода:**
   - Пользователь вводит полученный код
   - Отправляет `POST /auth/verify-2fa` с email и кодом
   - Система проверяет:
     - Существует ли код
     - Не истек ли срок действия
     - Совпадает ли код
   - При успехе:
     - Код удаляется из БД
     - Возвращается JWT токен

## Интеграция Email-сервиса

Сейчас используется заглушка (`console.log`). Для продакшена нужно интегрировать email-сервис.

### Рекомендуемые сервисы:

#### 1. Nodemailer (с Gmail/SMTP)
```bash
npm install nodemailer
```

```typescript
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async sendVerificationCode(email: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your verification code',
    html: `
      <h2>Your verification code</h2>
      <p>Your code is: <strong>${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `,
  });
}
```

**.env:**
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

#### 2. SendGrid
```bash
npm install @sendgrid/mail
```

```typescript
import * as sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async sendVerificationCode(email: string, code: string): Promise<void> {
  await sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Your verification code',
    html: `
      <h2>Your verification code</h2>
      <p>Your code is: <strong>${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `,
  });
}
```

**.env:**
```
SENDGRID_API_KEY=your-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

#### 3. AWS SES
```bash
npm install @aws-sdk/client-ses
```

```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const client = new SESClient({ region: 'us-east-1' });

async sendVerificationCode(email: string, code: string): Promise<void> {
  const command = new SendEmailCommand({
    Source: process.env.AWS_SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: 'Your verification code',
      },
      Body: {
        Html: {
          Data: `
            <h2>Your verification code</h2>
            <p>Your code is: <strong>${code}</strong></p>
            <p>This code will expire in 10 minutes.</p>
          `,
        },
      },
    },
  });

  await client.send(command);
}
```

**.env:**
```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
```

## Безопасность

### Рекомендации:

1. **Rate Limiting:** Ограничить количество попыток отправки/проверки кода
2. **Короткий срок жизни:** Код действителен только 10 минут
3. **Одноразовые коды:** Код удаляется после успешной проверки
4. **HTTPS только:** Все запросы должны идти через HTTPS
5. **Хеширование кодов:** Рассмотрите возможность хеширования кодов в БД
6. **Логирование:** Логируйте все попытки входа и верификации

### Добавление Rate Limiting:

```bash
npm install @nestjs/throttler
```

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 минута
      limit: 5,   // 5 запросов
    }]),
    // ...
  ],
})
```

```typescript
// auth.controller.ts
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 3, ttl: 60000 } })
@Post('verify-2fa')
async verify2FA(@Body() verify2FADto: Verify2FADto) {
  // ...
}
```

## Пример использования

### 1. Включить 2FA для пользователя
```bash
curl -X PATCH http://localhost:3000/auth/toggle-2fa \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enable": true}'
```

### 2. Войти с 2FA
```bash
# Шаг 1: Отправить логин
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Ответ: { "message": "Verification code sent to your email", "requires2FA": true }

# Шаг 2: Подтвердить код (проверить email)
curl -X POST http://localhost:3000/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "code": "123456"
  }'

# Ответ: { "access_token": "...", "user": {...} }
```

## Миграция базы данных

После обновления сущности User необходимо запустить приложение с `synchronize: true` (только для development) или создать миграцию:

```bash
npm run build
npm run typeorm migration:generate -- -n AddTwoFactorFields
npm run typeorm migration:run
```

Для production рекомендуется использовать миграции вместо `synchronize: true`.
