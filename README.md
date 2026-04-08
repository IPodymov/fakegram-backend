# 📸 Fakegram Backend

Instagram Clone REST API построенный на **NestJS**, **TypeORM** и **PostgreSQL**.

## 📋 Описание

Полнофункциональный backend для социальной сети в стиле Instagram с поддержкой:

- ✅ Регистрации и аутентификации пользователей (JWT + Cookie-based auth)
- ✅ Постов с фото/видео
- ✅ Историй (stories) с 24-часовым сроком действия
- ✅ Комментариев и лайков
- ✅ Системы подписок (followers/following)
- ✅ Уведомлений в реальном времени
- ✅ Чатов и групповых переписок
- ✅ Reels (короткие видео)
- ✅ Двухфакторной аутентификации через email
- ✅ Загрузки и хранения файлов
- ✅ Коротких ссылок для шаринга

## 🚀 Технологический стек

- **Framework**: NestJS 11
- **Architecture**: Modular Monolith + Event-Driven
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM 0.3
- **Authentication**: JWT + httpOnly Cookies
- **Events**: @nestjs/event-emitter
- **Validation**: class-validator, class-transformer
- **API Docs**: Swagger (auto-generated)
- **Password Hashing**: bcrypt

## 📦 Установка

```bash
# Клонирование репозитория
git clone https://github.com/IPodymov/fakegram-backend.git
cd fakegram-backend

# Установка зависимостей
npm install

# Сборка проекта
npm run build
```

## ⚙️ Настройка переменных окружения

Создайте файл `.env` в корне проекта с переменными:

```env
# Database - подключение к PostgreSQL
DATABASE_URL=postgresql://user:password@host:port/database

# JWT - конфигурация авторизации
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=7d

# App - основные параметры приложения
PORT=7777
NODE_ENV=development

# CORS - разрешенные источники (используйте URL фронтенда в production)
CORS_ORIGIN=http://localhost:3000

# URLs
BASE_URL=http://localhost:7777
FRONTEND_URL=http://localhost:3000
```

### Описание переменных:

| Переменная       | Описание                                  | Пример                                           |
| ---------------- | ----------------------------------------- | ------------------------------------------------ |
| `DATABASE_URL`   | Строка подключения к PostgreSQL           | `postgresql://user:pass@localhost:5432/fakegram` |
| `JWT_SECRET`     | Секретный ключ для подписания JWT токенов | `your-secret-key`                                |
| `JWT_EXPIRATION` | Время жизни токена                        | `7d`, `24h`, `3600`                              |
| `PORT`           | Порт запуска сервера                      | `7777`                                           |
| `NODE_ENV`       | Окружение                                 | `development`, `production`                      |
| `CORS_ORIGIN`    | Адрес фронтенда для CORS                  | `http://localhost:3000`                          |
| `BASE_URL`       | Базовый URL приложения                    | `http://localhost:7777`                          |
| `FRONTEND_URL`   | URL фронтенда                             | `http://localhost:3000`                          |

## 🔧 Запуск

```bash
# Development (с автоперезагрузкой)
npm run start:dev

# Production
npm run build
npm run start:prod

# Debug режим
npm run start:debug
```

## 🧪 Тестирование

```bash
# Unit тесты
npm test

# Тесты с покрытием
npm test:cov

# E2E тесты
npm run test:e2e
```

## 📚 Документация

Полная документация разделена на несколько файлов в папке `docs/`:

- [**API.md**](docs/API.md) - Полное описание всех API endpoint'ов
- [**STRUCTURE.md**](docs/STRUCTURE.md) - Архитектура и структура проекта
- [**2FA_IMPLEMENTATION.md**](docs/2FA_IMPLEMENTATION.md) - Двухфакторная аутентификация
- [**UPLOAD_IMAGES.md**](docs/UPLOAD_IMAGES.md) - Загрузка изображений и файлов
- [**TERMS_OF_SERVICE.md**](docs/TERMS_OF_SERVICE.md) - Условия использования

## 🔐 Аутентификация

API использует JWT токены, которые хранятся в httpOnly cookies. Это обеспечивает защиту от XSS атак.

При запросах с фронтенда используйте:

```javascript
// Fetch API
fetch('http://localhost:7777/api/endpoint', {
  credentials: 'include',  // Обязательно для отправки cookies
});

// Axios
axios.defaults.withCredentials = true;
```

## 📝 Лицензия

MIT - см. [LICENSE.md](LICENSE.md)

## 👤 Автор

[Ivan Podymov](https://github.com/IPodymov)

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
