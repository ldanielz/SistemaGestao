# 📋 Guia de Implementação - Quick Start

## Fase 1: Configuração Inicial (Semana 1)

### 1.1 Preparar Ambiente

```bash
# Clonar repositório
git clone <repo-url>
cd SistemaGestao

# Backend
cd backend
npm install
cp .env.example .env
npm run migrate
npm run seed

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 1.2 Subir Stack com Docker

```bash
# Na raiz do projeto
docker-compose up -d

# Verificar status
docker-compose ps

# Acessar services
- API: http://localhost:3000/api
- Frontend: http://localhost:3001
- PgAdmin: http://localhost:5050
- Redis: localhost:6379
```

### 1.3 Testar Conectividade

```bash
# Testar API
curl http://localhost:3000/api/health

# Teste de autenticação
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Fase 2: Implementação Backend (Semanas 2-3)

### 2.1 Estrutura de Diretórios

```
backend/src/
├── controllers/
│   ├── AuthController.ts
│   ├── ProjectController.ts
│   ├── TaskController.ts
│   ├── UserController.ts
│   └── ReportController.ts
├── services/
│   ├── AuthService.ts
│   ├── ProjectService.ts
│   ├── TaskService.ts
│   ├── NotificationService.ts
│   └── ReportService.ts
├── repositories/
│   ├── UserRepository.ts
│   ├── ProjectRepository.ts
│   ├── TaskRepository.ts
│   └── BaseRepository.ts
├── models/
│   └── (Prisma schemas)
├── routes/
│   ├── auth.routes.ts
│   ├── projects.routes.ts
│   ├── tasks.routes.ts
│   └── index.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── errorHandler.middleware.ts
│   ├── validation.middleware.ts
│   └── rateLimiter.middleware.ts
├── utils/
│   ├── jwt.utils.ts
│   ├── encryption.utils.ts
│   ├── logger.ts
│   └── validators.ts
├── config/
│   ├── database.ts
│   ├── redis.ts
│   └── mailer.ts
├── workers/
│   ├── NotificationWorker.ts
│   ├── ReportWorker.ts
│   └── index.ts
├── types/
│   └── index.ts
└── server.ts
```

### 2.2 Implementar Endpoints Prioritários

**Priority 1 (Essencial):**
- ✅ POST `/auth/register`
- ✅ POST `/auth/login`
- ✅ GET `/auth/me`
- ✅ POST `/projects`
- ✅ GET `/projects`
- ✅ GET `/projects/:id`

**Priority 2 (Importante):**
- ✅ POST `/projects/:id/tasks`
- ✅ GET `/projects/:id/tasks`
- ✅ PATCH `/tasks/:id/status`
- ✅ POST `/projects/:id/members`
- ✅ GET `/projects/:id/dashboard`

**Priority 3 (Funcionalidades):**
- ✅ POST `/tasks/:id/comments`
- ✅ POST `/tasks/:id/attachments`
- ✅ GET `/notifications`
- ✅ POST `/reports/export`

### 2.3 Template: Implementar Autenticação

```typescript
// src/services/AuthService.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

interface LoginDTO {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    role: string;
  };
}

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async login(data: LoginDTO): Promise<AuthResponse> {
    // 1. Buscar usuário
    const user = await this.prisma.users.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 2. Validar senha
    const isValidPassword = await bcrypt.compare(
      data.password,
      user.password_hash
    );

    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // 3. Gerar tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // 4. Registrar login
    await this.prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        role: user.role
      }
    };
  }

  private generateAccessToken(user: any): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
  }

  private generateRefreshToken(user: any): string {
    return jwt.sign(
      {
        sub: user.id,
        type: 'refresh'
      },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' }
    );
  }
}
```

### 2.4 Template: Implementar Projeto Controller

```typescript
// src/controllers/ProjectController.ts
import { Request, Response } from 'express';
import { ProjectService } from '../services/ProjectService';

export class ProjectController {
  constructor(private projectService: ProjectService) {}

  async create(req: Request, res: Response) {
    try {
      const { name, description, start_date, end_date, priority, budget } = req.body;
      const userId = (req as any).user.id;

      const project = await this.projectService.createProject({
        name,
        description,
        start_date,
        end_date,
        priority,
        budget,
        owner_id: userId,
        created_by: userId
      });

      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { status, priority, page = 1, limit = 10 } = req.query;
      const userId = (req as any).user.id;

      const projects = await this.projectService.getUserProjects(userId, {
        status: status as string,
        priority: priority as string,
        page: Number(page),
        limit: Number(limit)
      });

      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectDetails(id);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const project = await this.projectService.updateProject(id, updates);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getDashboard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dashboard = await this.projectService.getProjectDashboard(id);

      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

## Fase 3: Implementação Frontend (Semanas 4-5)

### 3.1 Estrutura de Componentes

```
frontend/src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── ProjectList.tsx
│   │   └── ProjectDashboard.tsx
│   ├── tasks/
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskDetail.tsx
│   │   └── StatusBadge.tsx
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   └── ErrorBoundary.tsx
│   └── dashboard/
│       ├── Dashboard.tsx
│       ├── MetricsCard.tsx
│       └── Charts.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProjectsPage.tsx
│   ├── ProjectDetailPage.tsx
│   ├── TasksPage.tsx
│   └── ProfilePage.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useProject.ts
│   ├── useTask.ts
│   └── useFetch.ts
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── projectService.ts
│   ├── taskService.ts
│   └── reportService.ts
├── store/
│   ├── authStore.ts
│   ├── projectStore.ts
│   └── uiStore.ts
├── styles/
│   ├── global.css
│   ├── tailwind.css
│   └── variables.css
├── types/
│   └── index.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
└── App.tsx
```

### 3.2 Template: Custom Hook para Autenticação

```typescript
// src/hooks/useAuth.ts
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

export function useAuth() {
  const navigate = useNavigate();
  const { user, setUser, clearAuth } = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    login,
    logout
  };
}
```

### 3.3 Template: Componente de Listagem de Projetos

```typescript
// src/components/projects/ProjectList.tsx
import React, { useEffect, useState } from 'react';
import { useProject } from '../../hooks/useProject';
import ProjectCard from './ProjectCard';
import Loading from '../common/Loading';

export default function ProjectList() {
  const { projects, isLoading, getProjects } = useProject();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getProjects({ status: filter || undefined });
  }, [filter]);

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('')}
          className={`px-4 py-2 rounded ${!filter ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('ACTIVE')}
          className={`px-4 py-2 rounded ${filter === 'ACTIVE' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Ativos
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`px-4 py-2 rounded ${filter === 'COMPLETED' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Concluídos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum projeto encontrado</p>
        </div>
      )}
    </div>
  );
}
```

## Fase 4: Testes e QA (Semana 6)

### 4.1 Testes Unitários Backend

```typescript
// src/__tests__/services/AuthService.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { AuthService } from '../../services/AuthService';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    // Mock setup
  });

  it('should login successfully with valid credentials', async () => {
    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('refresh_token');
    expect(result.user).toHaveProperty('id');
  });

  it('should throw error for invalid credentials', async () => {
    expect(async () => {
      await authService.login({
        email: 'invalid@example.com',
        password: 'wrong'
      });
    }).rejects.toThrow();
  });
});
```

### 4.2 Testes de API

```typescript
// src/__tests__/routes/projects.test.ts
import request from 'supertest';
import app from '../../server';

describe('Projects API', () => {
  let token: string;

  beforeAll(async () => {
    // Login and get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    token = res.body.access_token;
  });

  it('should create a project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project',
        start_date: '2026-02-15',
        end_date: '2026-05-15'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should list projects', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
```

## Fase 5: Deploy e Monitoramento (Semana 7+)

### 5.1 Build para Produção

```bash
# Backend
cd backend
npm run build
docker build -t sistema-gestao-api:latest .

# Frontend
cd frontend
npm run build
docker build -t sistema-gestao-web:latest .

# Push para registry
docker push sistema-gestao-api:latest
docker push sistema-gestao-web:latest
```

### 5.2 Deploy no AWS

```bash
# ECS Task Definition
# ECR Repositories
# RDS PostgreSQL
# ElastiCache Redis
# CloudFront CDN
# CloudWatch Monitoring
# Auto Scaling
```

### 5.3 Monitoramento

```typescript
// Prometheus metrics
import promClient from 'prom-client';

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

// LogErrors to ELK Stack
// Setup Grafana Dashboards
// Configure Alerts
```

## Checklist de Implementação

### Backend
- [ ] Estrutura base e configurações
- [ ] Autenticação JWT
- [ ] CRUD de Projetos
- [ ] CRUD de Tarefas
- [ ] Sistema de notificações
- [ ] Geração de relatórios
- [ ] Validações e erros
- [ ] Testes unitários
- [ ] Documentação de API

### Frontend
- [ ] Layout base e navegação
- [ ] Páginas de autenticação
- [ ] Dashboard principal
- [ ] Listagem de projetos
- [ ] Detalhe de projeto
- [ ] Gerenciamento de tarefas
- [ ] Sistema de notificações
- [ ] Responsividade
- [ ] Testes de componentes

### DevOps
- [ ] Docker containers
- [ ] Docker Compose
- [ ] CI/CD pipeline
- [ ] Staging environment
- [ ] Produção setup
- [ ] Monitoramento
- [ ] Backup/Recovery
- [ ] Performance tuning

## Próximas Etapas

1. **Integração com Google Calendar**
   - Sincronizar eventos de projeto
   - Duas vias: Sistema ↔ Calendário

2. **Chat/Messaging em Tempo Real**
   - WebSocket para chat interno
   - Integração Slack opcional

3. **Mobile App**
   - React Native
   - Notificações push
   - Acesso offline

4. **Analytics Avançada**
   - Previsões de conclusão
   - Análise de tendências
   - Relatórios preditivos

5. **Inteligência Artificial**
   - Sugestões de alocação
   - Detecção de riscos
   - Otimização automática
