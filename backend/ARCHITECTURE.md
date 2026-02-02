# 🏗️ Backend Architecture - Layer Diagram

## Camadas de Arquitetura Implementadas

```
┌────────────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                        │
│            (React 18 em http://localhost:3001)              │
└───────────────────┬──────────────────────────────────────────┘
                    │ HTTP/REST
                    │ JWT Tokens
                    ▼
┌────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                         │
│  (Express Server na porta 3000)                            │
│  - CORS Middleware                                         │
│  - Rate Limiting                                           │
│  - Request Logging                                         │
└───────────────────┬──────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────┐
│               AUTHENTICATION LAYER                         │
│  - JWT Middleware (auth.middleware.ts)                    │
│  - Token Verification                                      │
│  - Role-Based Access Control (RBAC)                        │
│  - Auth Routes (register, login, refresh, logout)          │
└───────────────────┬──────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────┐
│              VALIDATION & ERROR LAYER                      │
│  - Input Validation (express-validator)                    │
│  - Error Handler Middleware                                │
│  - Custom Error Types (ApiError)                           │
│  - Request Sanitization                                    │
└───────────────────┬──────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────┐
│                CONTROLLER LAYER                            │
│  (src/controllers/*.ts)                                    │
│  - Handle HTTP Requests                                    │
│  - Parse Query Parameters                                  │
│  - Call Services                                           │
│  - Return HTTP Responses                                   │
└───────────────────┬──────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────┐
│                SERVICE LAYER (BUSINESS LOGIC)              │
│  (src/services/*.ts)                                       │
│  - Project Management Logic                                │
│  - Task Management Logic                                   │
│  - User Management Logic                                   │
│  - Notification Logic                                      │
│  - Authorization Checks                                    │
│  - Business Rule Validation                                │
└───────────────────┬──────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────┐
│              REPOSITORY LAYER (DATA ACCESS)                │
│  (src/repositories/*.ts)                                   │
│  - Database Queries                                        │
│  - Data Abstraction                                        │
│  - Query Optimization                                      │
│  - Caching Logic (Redis)                                   │
└───────────────────┬──────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    ┌────────┐ ┌────────┐  ┌─────────┐
    │ Redis  │ │ Prisma │  │ Logging │
    │ Cache  │ │ ORM    │  │ (File)  │
    └────────┘ └────────┘  └─────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │  PostgreSQL Database   │
        │  (Port 5432)           │
        │                        │
        │  11 Tables:            │
        │  - users               │
        │  - projects            │
        │  - tasks               │
        │  - services            │
        │  - notifications       │
        │  - audit_logs          │
        │  - integrations        │
        │  - comments            │
        │  - attachments         │
        │  - history             │
        │  - project_members     │
        │  - task_assignees      │
        └────────────────────────┘
```

---

## Fluxo de uma Requisição Autenticada

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CLIENT: POST /api/projects                               │
│    Headers: Authorization: Bearer <JWT_TOKEN>               │
│    Body: { name, description, ... }                         │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. MIDDLEWARE: requestLogger                                │
│    - Log: method, path, timestamp                           │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. MIDDLEWARE: corsMiddleware                               │
│    - Add CORS headers                                       │
│    - Check origin                                           │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. MIDDLEWARE: authMiddleware                               │
│    - Extract JWT from Authorization header                  │
│    - Verify JWT signature                                   │
│    - Check token expiration                                 │
│    - Attach user info to req.user                           │
│    - Check RBAC requirements                                │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. MIDDLEWARE: validateCreateProject                        │
│    - Validate input (name, dates, budget, etc)              │
│    - Sanitize strings                                       │
│    - Return 422 if validation fails                         │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. CONTROLLER: projectController.create()                   │
│    - Extract validated data from req.body                   │
│    - Call projectService.create()                           │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. SERVICE: ProjectService.create()                         │
│    - Check user permissions (owner can create)              │
│    - Business logic validation                              │
│    - Call projectRepository.create()                        │
│    - Create audit log                                       │
│    - Emit notification events                               │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. REPOSITORY: ProjectRepository.create()                   │
│    - Create record in database (via Prisma)                 │
│    - Invalidate cache (Redis)                               │
│    - Return created project                                 │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. DATABASE: PostgreSQL                                     │
│    INSERT INTO projects (name, description, ...)            │
│    VALUES (...)                                             │
│    RETURNING *;                                             │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. RESPONSE FLOW (reverse)                                 │
│     Project created ✅                                       │
│     200 OK                                                  │
│     { statusCode: 201, data: {...} }                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Diretórios - Responsabilidades

```
src/
├── config/                    # Configurações & Inicialização
│   ├── database.ts           # Prisma client singleton
│   └── redis.ts              # Redis client singleton
│
├── middleware/               # Middleware Express
│   ├── auth.middleware.ts    # Autenticação JWT & RBAC
│   ├── error.middleware.ts   # Error handling centralizado
│   └── common.middleware.ts  # CORS, logging, rate limiting
│
├── routes/                   # Definição de rotas
│   ├── auth.routes.ts        # Rotas de autenticação
│   ├── projects.routes.ts    # Rotas de projetos (TODO)
│   ├── tasks.routes.ts       # Rotas de tarefas (TODO)
│   └── users.routes.ts       # Rotas de usuários (TODO)
│
├── controllers/              # HTTP Request Handlers
│   ├── auth.controller.ts    # Lógica de auth (TODO)
│   ├── project.controller.ts # Lógica de projetos (TODO)
│   └── task.controller.ts    # Lógica de tarefas (TODO)
│
├── services/                 # Lógica de Negócio
│   ├── auth.service.ts       # Service de autenticação (TODO)
│   ├── project.service.ts    # Service de projetos (TODO)
│   ├── task.service.ts       # Service de tarefas (TODO)
│   ├── user.service.ts       # Service de usuários (TODO)
│   ├── notification.service.ts # Service de notificações (TODO)
│   └── report.service.ts     # Service de relatórios (TODO)
│
├── repositories/             # Camada de Dados
│   ├── base.repository.ts    # Base class com CRUD genérico (TODO)
│   ├── user.repository.ts    # User data access (TODO)
│   ├── project.repository.ts # Project data access (TODO)
│   ├── task.repository.ts    # Task data access (TODO)
│   └── cache.repository.ts   # Cache with Redis (TODO)
│
├── types/                    # TypeScript Interfaces
│   └── index.ts              # All type definitions
│
├── utils/                    # Utilidades Reutilizáveis
│   ├── logger.ts            # Winston logging
│   ├── jwt.ts               # JWT token utilities
│   ├── encryption.ts        # AES-256 encryption
│   ├── validators.ts        # Input validation rules
│   ├── errors.ts            # Custom error classes (TODO)
│   └── helpers.ts           # Helper functions (TODO)
│
├── workers/                  # Background Jobs
│   └── index.ts             # Bull Queue workers (TODO)
│
├── database/                 # Database Scripts
│   ├── migrations/           # Prisma migrations (auto)
│   ├── seed.ts              # Database seeding (TODO)
│   └── init.sql             # SQL initialization (TODO)
│
├── server.ts                # Express Configuration
│   └── Middleware setup
│   └── Route registration
│   └── Graceful shutdown
│
└── index.ts                 # Application Entry Point
```

---

## Componentes Chave Implementados

### 1️⃣ Logger (Winston)
```
Saída para console + arquivos
├── logs/error.log      (apenas erros)
├── logs/combined.log   (todos os logs)
└── Console output com cores
```

### 2️⃣ JWT Authentication
```
Access Token  (15 minutos)
├── sub: user.id
├── email: user.email
├── role: user.role
└── Signing: HS256

Refresh Token (7 dias)
├── sub: user.id
├── type: 'refresh'
└── Stored in Redis
```

### 3️⃣ Encryption (AES-256-GCM)
```
Dados sensíveis criptografados
├── IV: 16 bytes aleatório
├── Auth Tag: Para integridade
├── Cipher: AES-256-GCM
└── Format: iv:authTag:encrypted
```

### 4️⃣ RBAC (Role-Based Access Control)
```
5 Roles implementados:
├── ADMIN       (acesso total)
├── MANAGER     (gerencia projetos)
├── LEAD        (lidera tarefas)
├── DEVELOPER   (executa tarefas)
└── CLIENT      (visualiza projetos)
```

---

## Tecnologias Stack

```
Backend:
├── Runtime: Node.js 18+
├── Language: TypeScript 5+
├── Framework: Express 4.18+
├── ORM: Prisma 4.16+
├── Database: PostgreSQL 14+
├── Cache: Redis 7+
├── Authentication: JWT + bcrypt
├── Logging: Winston 3.8+
├── Validation: express-validator 7+
└── Async: Native Promises

Frontend (próximo):
├── Library: React 18+
├── Language: TypeScript
├── Styling: TailwindCSS 3+
├── State: Zustand
├── HTTP: React Query 3+
└── Build: Vite

DevOps:
├── Container: Docker
├── Orchestration: Docker Compose
├── Environment: .env files
└── Version Control: Git + GitHub
```

---

## Health Check Implementado

```
GET /health

Response 200 OK:
{
  "statusCode": 200,
  "message": "API is healthy",
  "timestamp": "2024-01-01T10:00:00Z",
  "environment": "development",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

---

## Exemplo de Fluxo de Erro

```
┌─────────────────────────────────┐
│ POST /api/auth/register         │
│ Validação falha: email inválido │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ validators.validateCreateUser   │
│ body('email').isEmail()         │
│ ❌ Falha: "invalid email"       │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ handleValidationErrors()        │
│ Captura erros                   │
│ Retorna 422                     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Response 422 UNPROCESSABLE      │
│ {                               │
│   "statusCode": 422,            │
│   "error": "Validação falhou",  │
│   "details": [...]              │
│ }                               │
└─────────────────────────────────┘
```

---

**Arquitetura pronta para escalar! 🚀**
