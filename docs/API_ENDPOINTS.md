# 🔌 API Endpoints - Referência Completa

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.gestao-projetos.com/api
```

## Autenticação
Todos os endpoints (exceto login) requerem token JWT no header:
```
Authorization: Bearer <access_token>
```

---

## 1️⃣ Autenticação e Usuários

### POST `/auth/register`
Registrar novo usuário
```json
REQUEST:
{
  "email": "usuario@example.com",
  "password": "senha_segura_123",
  "first_name": "João",
  "last_name": "Silva",
  "role": "DEVELOPER"
}

RESPONSE (201):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@example.com",
  "first_name": "João",
  "last_name": "Silva",
  "role": "DEVELOPER",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "created_at": "2026-02-02T10:30:00Z"
}

ERRORS:
- 400: Email já registrado
- 422: Dados inválidos
```

### POST `/auth/login`
Login de usuário
```json
REQUEST:
{
  "email": "usuario@example.com",
  "password": "senha_segura_123"
}

RESPONSE (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@example.com",
    "first_name": "João",
    "role": "DEVELOPER",
    "avatar_url": "https://..."
  }
}

ERRORS:
- 401: Email ou senha incorretos
- 429: Muitas tentativas (rate limit)
```

### POST `/auth/refresh`
Renovar access token
```json
REQUEST:
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}

RESPONSE (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}

ERRORS:
- 401: Refresh token expirado ou inválido
```

### POST `/auth/logout`
Logout do usuário
```json
REQUEST:
{}

RESPONSE (200):
{
  "message": "Logout realizado com sucesso"
}
```

### GET `/auth/me`
Obter informações do usuário autenticado
```json
RESPONSE (200):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@example.com",
  "first_name": "João",
  "last_name": "Silva",
  "role": "DEVELOPER",
  "status": "ACTIVE",
  "avatar_url": "https://...",
  "created_at": "2026-01-15T08:00:00Z"
}
```

### GET `/users/:id`
Obter informações de um usuário específico (ADMIN/MANAGER)
```json
RESPONSE (200):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@example.com",
  "first_name": "João",
  "last_name": "Silva",
  "role": "DEVELOPER",
  "phone": "+55 11 99999-9999",
  "status": "ACTIVE",
  "last_login": "2026-02-02T09:15:00Z",
  "created_at": "2026-01-15T08:00:00Z"
}
```

### PUT `/users/:id`
Atualizar perfil do usuário
```json
REQUEST:
{
  "first_name": "João Pedro",
  "phone": "+55 11 98888-8888",
  "avatar_url": "https://..."
}

RESPONSE (200):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "first_name": "João Pedro",
  "phone": "+55 11 98888-8888",
  "updated_at": "2026-02-02T10:45:00Z"
}

ERRORS:
- 403: Sem permissão para editar outro usuário
- 404: Usuário não encontrado
```

### GET `/users`
Listar todos os usuários (ADMIN/MANAGER)
```json
RESPONSE (200):
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "usuario@example.com",
      "first_name": "João",
      "role": "DEVELOPER",
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "pages": 8
  }
}

QUERY PARAMS:
- page: número da página (default: 1)
- limit: itens por página (default: 20, max: 100)
- role: filtrar por papel
- status: filtrar por status
- search: buscar por nome ou email
```

---

## 2️⃣ Projetos

### POST `/projects`
Criar novo projeto
```json
REQUEST:
{
  "name": "Redesign do Portal Web",
  "description": "Atualizar interface do portal com design moderno",
  "start_date": "2026-02-15",
  "end_date": "2026-05-15",
  "priority": "HIGH",
  "budget": 50000.00,
  "owner_id": "550e8400-e29b-41d4-a716-446655440001"
}

RESPONSE (201):
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Redesign do Portal Web",
  "description": "Atualizar interface do portal com design moderno",
  "status": "PLANNING",
  "priority": "HIGH",
  "start_date": "2026-02-15",
  "end_date": "2026-05-15",
  "budget": 50000.00,
  "owner": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Maria Silva"
  },
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-02-02T11:00:00Z",
  "_links": {
    "self": "/projects/660e8400-e29b-41d4-a716-446655440000"
  }
}

PERMISSIONS: ADMIN, MANAGER
ERRORS:
- 400: Datas inválidas (end_date < start_date)
- 422: Dados incompletos
- 403: Sem permissão
```

### GET `/projects`
Listar projetos do usuário
```json
RESPONSE (200):
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "Redesign do Portal Web",
      "status": "ACTIVE",
      "priority": "HIGH",
      "progress": 45,
      "owner": "Maria Silva",
      "team_size": 5,
      "task_count": 24,
      "completed_tasks": 11,
      "start_date": "2026-02-15",
      "end_date": "2026-05-15"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12
  }
}

QUERY PARAMS:
- status: PLANNING, ACTIVE, ON_HOLD, COMPLETED, ARCHIVED
- priority: LOW, MEDIUM, HIGH, CRITICAL
- search: buscar por nome
- sort: name, created_at, end_date (prefix com - para DESC)
```

### GET `/projects/:id`
Obter detalhes completos do projeto
```json
RESPONSE (200):
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Redesign do Portal Web",
  "description": "Atualizar interface do portal com design moderno",
  "status": "ACTIVE",
  "priority": "HIGH",
  "budget": 50000.00,
  "spent": 35000.00,
  "start_date": "2026-02-15",
  "end_date": "2026-05-15",
  "owner": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Maria Silva",
    "email": "maria@example.com"
  },
  "team": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "João Dev",
      "role": "LEAD",
      "hours_allocated": 40,
      "joined_at": "2026-02-15"
    }
  ],
  "metrics": {
    "progress": 45,
    "total_tasks": 24,
    "completed_tasks": 11,
    "in_progress": 8,
    "pending": 5,
    "velocity": 8.5,
    "health": "GREEN"
  },
  "timeline": {
    "planned_end": "2026-05-15",
    "estimated_end": "2026-05-10",
    "days_remaining": 102
  },
  "created_at": "2026-02-01T09:00:00Z",
  "updated_at": "2026-02-02T11:00:00Z"
}

PERMISSIONS: Membro do projeto ou ADMIN
```

### PUT `/projects/:id`
Atualizar projeto
```json
REQUEST:
{
  "name": "Redesign Completo do Portal",
  "priority": "CRITICAL",
  "status": "ON_HOLD",
  "budget": 65000.00
}

RESPONSE (200):
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Redesign Completo do Portal",
  "priority": "CRITICAL",
  "status": "ON_HOLD",
  "budget": 65000.00,
  "updated_at": "2026-02-02T12:30:00Z"
}

PERMISSIONS: Owner, MANAGER, ADMIN
```

### DELETE `/projects/:id`
Deletar projeto
```json
REQUEST:
{
  "confirm_deletion": true,
  "reason": "Projeto cancelado pelo cliente"
}

RESPONSE (204):
No content

PERMISSIONS: Owner, ADMIN
ERRORS:
- 400: Projeto não pode ser deletado (em produção)
- 409: Confirme a deleção
```

### GET `/projects/:id/dashboard`
Obter dashboard do projeto com visualizações
```json
RESPONSE (200):
{
  "overview": {
    "progress": 45,
    "health": "GREEN",
    "status": "ACTIVE",
    "schedule_status": "ON_TRACK"
  },
  "tasks_by_status": {
    "PENDING": 5,
    "IN_PROGRESS": 8,
    "IN_REVIEW": 3,
    "COMPLETED": 11,
    "BLOCKED": 2
  },
  "team_performance": [
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "João Dev",
      "tasks_completed": 8,
      "tasks_in_progress": 2,
      "productivity_score": 92
    }
  ],
  "timeline": {
    "start": "2026-02-15",
    "end": "2026-05-15",
    "progress_line": [
      { "week": 1, "planned": 4, "actual": 3 },
      { "week": 2, "planned": 8, "actual": 7 }
    ]
  },
  "risks": [
    {
      "id": "770e8400",
      "description": "Atraso na aprovação de design",
      "impact": "HIGH",
      "mitigation": "Agendar review com cliente"
    }
  ]
}
```

### POST `/projects/:id/members`
Adicionar membro ao projeto
```json
REQUEST:
{
  "user_id": "550e8400-e29b-41d4-a716-446655440003",
  "role": "MEMBER",
  "hours_allocated": 30
}

RESPONSE (201):
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "project_id": "660e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440003",
  "role": "MEMBER",
  "hours_allocated": 30,
  "joined_at": "2026-02-02T12:45:00Z"
}

PERMISSIONS: Owner, MANAGER, ADMIN
```

### DELETE `/projects/:id/members/:user_id`
Remover membro do projeto
```json
RESPONSE (204):
No content

PERMISSIONS: Owner, MANAGER, ADMIN
```

---

## 3️⃣ Tarefas

### POST `/projects/:id/tasks`
Criar nova tarefa
```json
REQUEST:
{
  "title": "Implementar autenticação OAuth2",
  "description": "Integrar Google OAuth2 no sistema de login",
  "priority": "HIGH",
  "start_date": "2026-02-10",
  "end_date": "2026-02-20",
  "estimated_hours": 16,
  "assigned_to": ["550e8400-e29b-41d4-a716-446655440002"],
  "tags": ["backend", "security"]
}

RESPONSE (201):
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "project_id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Implementar autenticação OAuth2",
  "description": "Integrar Google OAuth2 no sistema de login",
  "status": "PENDING",
  "priority": "HIGH",
  "start_date": "2026-02-10",
  "end_date": "2026-02-20",
  "estimated_hours": 16,
  "actual_hours": 0,
  "assigned_to": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "João Dev",
      "allocated_hours": 16
    }
  ],
  "created_at": "2026-02-02T13:00:00Z"
}

PERMISSIONS: Membro do projeto com permissão de criar tarefas
```

### GET `/projects/:id/tasks`
Listar tarefas do projeto
```json
RESPONSE (200):
{
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440000",
      "title": "Implementar autenticação OAuth2",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "assigned_to": "João Dev",
      "progress": 60,
      "end_date": "2026-02-20",
      "days_remaining": 18,
      "estimated_hours": 16,
      "actual_hours": 9.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 24
  }
}

QUERY PARAMS:
- status: PENDING, IN_PROGRESS, IN_REVIEW, COMPLETED, BLOCKED, CANCELLED
- priority: LOW, MEDIUM, HIGH, CRITICAL
- assigned_to: user_id
- sort: end_date, priority, created_at
```

### GET `/tasks/:id`
Obter detalhes da tarefa
```json
RESPONSE (200):
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "project_id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Implementar autenticação OAuth2",
  "description": "Integrar Google OAuth2 no sistema de login",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "start_date": "2026-02-10",
  "end_date": "2026-02-20",
  "estimated_hours": 16,
  "actual_hours": 9.5,
  "created_by": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Maria Silva"
  },
  "assigned_to": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "João Dev",
      "allocated_hours": 16,
      "status": "IN_PROGRESS"
    }
  ],
  "attachments": [
    {
      "id": "aa0e8400",
      "file_name": "oauth2-diagram.pdf",
      "file_size": 2048000,
      "uploaded_by": "Maria Silva",
      "uploaded_at": "2026-02-10T10:00:00Z"
    }
  ],
  "comments": [
    {
      "id": "bb0e8400",
      "user": "João Dev",
      "comment": "Iniciando implementação",
      "created_at": "2026-02-10T14:30:00Z"
    }
  ],
  "history": [
    {
      "field": "status",
      "old_value": "PENDING",
      "new_value": "IN_PROGRESS",
      "changed_by": "João Dev",
      "changed_at": "2026-02-10T14:30:00Z"
    }
  ],
  "created_at": "2026-02-02T13:00:00Z"
}
```

### PUT `/tasks/:id`
Atualizar tarefa
```json
REQUEST:
{
  "title": "Implementar autenticação OAuth2 (Google, GitHub)",
  "status": "IN_REVIEW",
  "actual_hours": 12.5,
  "priority": "CRITICAL"
}

RESPONSE (200):
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "title": "Implementar autenticação OAuth2 (Google, GitHub)",
  "status": "IN_REVIEW",
  "actual_hours": 12.5,
  "priority": "CRITICAL",
  "updated_at": "2026-02-02T14:15:00Z"
}

NOTIFICATIONS:
- Se status changed para COMPLETED: notificar assignee e owner
- Se blocked: notificar com motivo
- Se reassigned: notificar novo assignee
```

### PATCH `/tasks/:id/status`
Atualizar apenas status da tarefa
```json
REQUEST:
{
  "status": "COMPLETED",
  "comment": "Implementação concluída com sucesso"
}

RESPONSE (200):
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "status": "COMPLETED",
  "updated_at": "2026-02-02T15:00:00Z"
}
```

### POST `/tasks/:id/assign`
Atribuir tarefa a usuário(s)
```json
REQUEST:
{
  "user_ids": ["550e8400-e29b-41d4-a716-446655440002", "550e8400-e29b-41d4-a716-446655440003"],
  "allocated_hours": [16, 8]
}

RESPONSE (201):
{
  "task_id": "990e8400-e29b-41d4-a716-446655440000",
  "assigned_to": [
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440002",
      "allocated_hours": 16
    },
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440003",
      "allocated_hours": 8
    }
  ]
}

NOTIFICATIONS: Notificar usuários da atribuição
```

### POST `/tasks/:id/comments`
Adicionar comentário à tarefa
```json
REQUEST:
{
  "comment": "Iniciando testes de integração",
  "is_internal": false
}

RESPONSE (201):
{
  "id": "cc0e8400-e29b-41d4-a716-446655440000",
  "task_id": "990e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "João Dev"
  },
  "comment": "Iniciando testes de integração",
  "is_internal": false,
  "created_at": "2026-02-02T15:30:00Z"
}

NOTIFICATIONS: Se menção (@username), notificar usuário
```

### POST `/tasks/:id/attachments`
Fazer upload de attachment
```
REQUEST:
Multipart form-data com arquivo

RESPONSE (201):
{
  "id": "dd0e8400-e29b-41d4-a716-446655440000",
  "task_id": "990e8400-e29b-41d4-a716-446655440000",
  "file_name": "test-results.pdf",
  "file_size": 512000,
  "file_url": "https://storage.example.com/files/dd0e8400",
  "uploaded_by": "João Dev",
  "created_at": "2026-02-02T16:00:00Z"
}

CONSTRAINTS:
- Máximo 10MB por arquivo
- Permitidos: pdf, doc, docx, xls, xlsx, jpg, png, zip
```

---

## 4️⃣ Relatórios e Análises

### GET `/projects/:id/reports/performance`
Relatório de desempenho do projeto
```json
RESPONSE (200):
{
  "project": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Redesign do Portal Web",
    "period": "2026-02-15 a 2026-05-15"
  },
  "summary": {
    "total_tasks": 24,
    "completed": 11,
    "completion_rate": 45.8,
    "on_schedule": true,
    "budget_utilization": 70.0
  },
  "metrics": {
    "average_task_duration": 5.2,
    "velocity": 8.5,
    "schedule_variance": -5,
    "cost_variance": -15000.00,
    "burn_down": [
      { "date": "2026-02-15", "planned": 0, "actual": 0 },
      { "date": "2026-02-22", "planned": 3, "actual": 2 },
      { "date": "2026-03-01", "planned": 6, "actual": 7 }
    ]
  },
  "team_metrics": [
    {
      "user": "João Dev",
      "tasks_completed": 8,
      "hours_spent": 45.5,
      "productivity": 0.176,
      "quality_score": 95
    }
  ],
  "risks": [
    {
      "description": "Dependência externa não atendida",
      "probability": "MEDIUM",
      "impact": "HIGH",
      "mitigation": "Agendar reunião com provider"
    }
  ]
}
```

### POST `/reports/export`
Exportar relatório
```json
REQUEST:
{
  "type": "performance",
  "project_id": "660e8400-e29b-41d4-a716-446655440000",
  "format": "pdf",
  "include": ["summary", "metrics", "team_performance", "risks"]
}

RESPONSE (200):
{
  "file_url": "https://storage.example.com/reports/report-2026-02-02.pdf",
  "file_name": "report-2026-02-02.pdf",
  "file_size": 2048000,
  "generated_at": "2026-02-02T17:00:00Z"
}

FORMATS: pdf, excel, csv
BACKGROUND TASK: Relatórios grandes são processados assincronamente
```

### GET `/dashboard`
Dashboard pessoal do usuário
```json
RESPONSE (200):
{
  "summary": {
    "projects_count": 5,
    "active_projects": 3,
    "tasks_assigned": 12,
    "tasks_due_soon": 3,
    "tasks_overdue": 1
  },
  "my_tasks": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440000",
      "title": "Implementar autenticação OAuth2",
      "project": "Redesign do Portal Web",
      "priority": "HIGH",
      "due_date": "2026-02-20",
      "status": "IN_PROGRESS",
      "days_remaining": 18
    }
  ],
  "projects_overview": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "Redesign do Portal Web",
      "progress": 45,
      "health": "GREEN",
      "my_role": "LEAD"
    }
  ],
  "notifications_pending": 5,
  "calendar_events": [
    {
      "date": "2026-02-10",
      "type": "DEADLINE",
      "description": "Prazo: OAuth2 implementation"
    }
  ]
}
```

---

## 5️⃣ Notificações

### GET `/notifications`
Listar notificações do usuário
```json
RESPONSE (200):
{
  "data": [
    {
      "id": "ee0e8400-e29b-41d4-a716-446655440000",
      "type": "TASK_ASSIGNED",
      "message": "Você foi atribuído à tarefa: Implementar autenticação OAuth2",
      "related_entity_type": "task",
      "related_entity_id": "990e8400-e29b-41d4-a716-446655440000",
      "is_read": false,
      "created_at": "2026-02-02T13:00:00Z"
    }
  ],
  "unread_count": 5
}

QUERY PARAMS:
- is_read: true/false
- type: TASK_ASSIGNED, TASK_COMPLETED, COMMENT_ADDED, etc
```

### PATCH `/notifications/:id/read`
Marcar notificação como lida
```json
RESPONSE (200):
{
  "id": "ee0e8400-e29b-41d4-a716-446655440000",
  "is_read": true,
  "read_at": "2026-02-02T17:30:00Z"
}
```

### PATCH `/notifications/read-all`
Marcar todas as notificações como lidas
```json
RESPONSE (200):
{
  "updated_count": 5
}
```

---

## 6️⃣ Integrações

### POST `/integrations/calendar/sync`
Sincronizar com Google Calendar
```json
REQUEST:
{
  "calendar_id": "primary",
  "project_id": "660e8400-e29b-41d4-a716-446655440000"
}

RESPONSE (200):
{
  "synced": true,
  "events_created": 12,
  "events_updated": 3,
  "last_sync": "2026-02-02T18:00:00Z"
}
```

### GET `/integrations/status`
Status das integrações
```json
RESPONSE (200):
{
  "google_calendar": {
    "connected": true,
    "last_sync": "2026-02-02T18:00:00Z"
  },
  "slack": {
    "connected": false,
    "error": "Token inválido"
  },
  "github": {
    "connected": true,
    "last_sync": "2026-02-02T17:45:00Z"
  }
}
```

---

## Códigos de Status HTTP

| Código | Significado |
|--------|------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado |
| 204 | No Content - Sucesso sem resposta |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Sem autenticação |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 422 | Unprocessable Entity - Validação falhou |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro do servidor |

---

## Rate Limiting

```
Limit: 1000 requisições por hora
Por usuário autenticado: 5000 requisições por hora
Headers retornados:
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 999
  X-RateLimit-Reset: 1643814000
```

---

## Paginação

Todos os endpoints de listagem suportam paginação:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}

QUERY PARAMS:
- page: Número da página (default: 1)
- limit: Itens por página (default: 20, max: 100)
```

---

## Filtros Avançados

```
GET /projects?status=ACTIVE&priority=HIGH&owner_id=550e8400&sort=-created_at

Operadores suportados:
- eq: igualdade (default)
- gt: maior que
- gte: maior ou igual
- lt: menor que
- lte: menor ou igual
- in: está em lista
- contains: contém string
```
