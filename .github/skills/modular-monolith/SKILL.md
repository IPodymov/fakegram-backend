---
name: modular-monolith
description: 'Modular Monolith architecture skill for NestJS Instagram-clone backend. Use when: creating new modules, adding features, refactoring code, reviewing architecture, creating entities, services, controllers, events, or DTOs.'
---

# Modular Monolith Architecture

## Core Principles

1. **Single deployable unit** divided into independent feature modules
2. Modules **must not access each other's internals directly**
3. Communication through public services, interfaces, or events (preferred)
4. Build as a monolith, design as microservices

## Project Structure

```
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── posts/
│   ├── followers/
│   ├── notifications/
│   ├── stories/
│   ├── chats/
│   ├── short-links/
│   └── reels/
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   └── interceptors/
├── infrastructure/
│   ├── database/
│   ├── events/
│   └── cache/
├── config/
└── main.ts
```

## Module Internal Structure

Each module MUST follow:

```
<module>/
├── controllers/
│   └── <module>.controller.ts
├── services/
│   └── <module>.service.ts
├── domain/
│   ├── entities/
│   │   └── <entity>.entity.ts
│   └── interfaces/
│       └── <module>.interfaces.ts
├── dto/
│   └── <action>-<entity>.dto.ts
├── events/
│   └── <module>.events.ts
└── <module>.module.ts
```

## Dependency Rules (CRITICAL)

### Allowed:

- controllers → services
- services → domain (entities, interfaces)
- services → infrastructure (repositories via TypeORM)
- services → events (emit)

### Forbidden:

- ❌ controllers → repositories (direct DB access)
- ❌ modules accessing other module internals
- ❌ business logic inside controllers
- ❌ cross-module entity imports (use interfaces)

## Communication Between Modules

### Preferred: Events (loosely coupled)

```typescript
// Emitting
this.eventEmitter.emit('post.created', new PostCreatedEvent(post));

// Listening
@OnEvent('post.created')
handlePostCreated(event: PostCreatedEvent) { ... }
```

### Alternative: Public service interface (use sparingly)

## Domain Rules

- Domain layer is framework-agnostic (no NestJS decorators in domain interfaces)
- Business logic lives in services, not controllers
- Entities use TypeORM decorators (pragmatic choice for monolith phase)

## Events to Emit

All important actions MUST emit events:

- `post.created` / `post.deleted`
- `user.followed` / `user.unfollowed`
- `post.liked` / `post.unliked`
- `comment.added`
- `user.registered`

## Code Quality Rules

- Use DTOs for all external input/output
- Strict typing everywhere (no `any`)
- Use interfaces for cross-module contracts
- Keep services focused (no god services)
- Validate at system boundaries (controllers)

## Anti-Patterns to Avoid

- ❌ God services (too many responsibilities)
- ❌ Shared mutable state between modules
- ❌ Direct DB access from multiple modules for same entity
- ❌ Tight coupling between modules
- ❌ Business logic in controllers

## Scalability Path

1. **Current**: Single NestJS app with modular separation
2. **Extraction**: Auth → Auth Service, Notifications → Async Service
3. **Microservices**: Message broker, async event communication
