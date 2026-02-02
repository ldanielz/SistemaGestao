# 🏗️ Arquitetura Detalhada do Sistema

## 1. Visão Geral da Arquitetura

### Padrão de Arquitetura: Clean Architecture + DDD

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                        │
│          (React Components, Pages, Views)                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│              CAMADA DE APLICAÇÃO (Controllers)                   │
│     Orquestração de requisições, validações básicas              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│          CAMADA DE LÓGICA DE NEGÓCIO (Services/UseCases)        │
│     Regras de negócio, cálculos, orquestração                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│              CAMADA DE ACESSO A DADOS (Repositories)             │
│     Abstrações para persistência, queries                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│      CAMADA DE DADOS (Banco, Cache, Fila)                       │
│     PostgreSQL, Redis, Bull Queue                               │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Módulos Principais

### 2.1 Módulo de Autenticação e Autorização

**Componentes:**
- Login/Logout
- Registro de usuários
- Gerenciamento de sessões
- Controle de permissões (RBAC)
- OAuth2 integration

**Fluxo de Autenticação:**
```
Cliente → Login → JWT gerado → Token armazenado → Requisições com token
                                                   ↓
                                           Middleware valida JWT
                                                   ↓
                                           ✅ Acesso autorizado
```

**Tokens:**
- Access Token: 15 minutos de validade
- Refresh Token: 7 dias de validade
- ID Token: Informações do usuário

### 2.2 Módulo de Gerenciamento de Projetos

**Entidades Principais:**
- Project
- ProjectMember
- ProjectMetrics
- ProjectTimeline

**Funcionalidades:**
- CRUD de projetos
- Atribuição de membros
- Definição de objetivos e KPIs
- Acompanhamento de progresso
- Archivamento de projetos

### 2.3 Módulo de Gerenciamento de Tarefas

**Entidades Principais:**
- Task
- Subtask
- TaskAttachment
- TaskComment
- TaskHistory

**Status de Tarefas:**
- `PENDING` - Pendente (não iniciada)
- `IN_PROGRESS` - Em andamento
- `IN_REVIEW` - Em revisão
- `COMPLETED` - Concluída
- `BLOCKED` - Bloqueada
- `CANCELLED` - Cancelada

**Prioridades:**
- `LOW` - Baixa
- `MEDIUM` - Média
- `HIGH` - Alta
- `CRITICAL` - Crítica

### 2.4 Módulo de Gestão de Usuários

**Papéis (Roles):**
- `ADMIN` - Administrador do sistema
- `MANAGER` - Gerente de projetos
- `LEAD` - Lead de equipe
- `DEVELOPER` - Desenvolvedor/Colaborador
- `CLIENT` - Cliente

**Permissões por Papel:**
```
ADMIN: Todas as permissões

MANAGER:
  - Criar/Editar/Deletar projetos
  - Gerenciar membros do projeto
  - Ver relatórios
  - Atribuir tarefas

LEAD:
  - Criar/Editar tarefas
  - Visualizar projeto
  - Comentar em tarefas
  - Visualizar próprias tarefas

DEVELOPER:
  - Executar tarefas atribuídas
  - Comentar em tarefas
  - Atualizar status de tarefas

CLIENT:
  - Visualizar projetos (somente permissões)
  - Ver progresso
  - Comentar em tarefas
```

### 2.5 Módulo de Notificações

**Canais:**
- Email (SMTP)
- Push Notifications (Firebase)
- In-app Notifications (WebSocket)

**Eventos que Disparam Notificações:**
- Tarefa atribuída
- Tarefa concluída
- Projeto iniciado/finalizado
- Comentário em tarefa
- Bloqueio de tarefa
- Mudança de status
- Deadline próximo

### 2.6 Módulo de Relatórios e Análises

**Tipos de Relatórios:**
1. **Relatório de Projeto**
   - Progresso geral
   - Distribuição de tarefas por status
   - Velocidade de conclusão
   - Recursos utilizados

2. **Relatório de Equipe**
   - Produtividade por membro
   - Tempo médio de conclusão
   - Tarefas completadas
   - Desempenho por período

3. **Relatório de Tempo**
   - Tempo gasto por tarefa
   - Tempo total por projeto
   - Estimado vs Realizado

**Formatos de Exportação:**
- PDF (ReportLab/PDFKit)
- Excel (ExcelJS)
- CSV (padrão)
- JSON (API)

### 2.7 Módulo de Integrações

**Integrações Previstas:**
- Google Calendar
- Microsoft Outlook
- Slack
- GitHub
- Jira
- Webhooks customizados

## 3. Fluxo de Dados

### Exemplo: Criar uma Tarefa

```
1. Frontend enviá POST /api/tasks
   └─ Payload: { title, description, projectId, assignees, deadline }

2. Backend recebe na rota
   └─ Middleware valida JWT
   └─ Middleware valida permissões

3. Controller processa
   └─ Validação de dados
   └─ Chamar TaskService.create()

4. Service executa regras de negócio
   └─ Verificar projeto existe
   └─ Verificar usuários existem
   └─ Calcular prioridade se automática
   └─ Chamar TaskRepository.create()

5. Repository persiste no BD
   └─ INSERT em tasks
   └─ INSERT em task_assignees
   └─ INSERT em task_history

6. Event Publisher dispara evento
   └─ TaskCreated event
   └─ Enqueue: send notifications
   └─ Enqueue: update metrics

7. Queue Worker processa
   └─ Enviar notificações aos assignees
   └─ Atualizar dashboard

8. Response retorna ao Frontend
   └─ Task criada com ID
   └─ Status 201 Created
```

## 4. Padrões de Design Utilizados

### 4.1 Repository Pattern
```typescript
interface ITaskRepository {
  create(data: CreateTaskDTO): Promise<Task>;
  findById(id: string): Promise<Task>;
  update(id: string, data: UpdateTaskDTO): Promise<Task>;
  delete(id: string): Promise<void>;
  findByProject(projectId: string): Promise<Task[]>;
}
```

### 4.2 Service Layer Pattern
```typescript
class TaskService {
  constructor(private taskRepository: ITaskRepository) {}
  
  async createTask(data: CreateTaskDTO): Promise<Task> {
    // Validações e regras de negócio
    return this.taskRepository.create(data);
  }
}
```

### 4.3 Dependency Injection
```typescript
const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService);
```

### 4.4 Observer Pattern (Eventos)
```typescript
eventEmitter.on('task:created', (task) => {
  notificationService.sendNotifications(task);
  metricsService.updateProjectMetrics(task.projectId);
});
```

### 4.5 Strategy Pattern (Priorização)
```typescript
interface PrioritizationStrategy {
  calculate(task: Task): number;
}

class UrgencyStrategy implements PrioritizationStrategy {
  calculate(task: Task): number { /* ... */ }
}

class ResourceAvailabilityStrategy implements PrioritizationStrategy {
  calculate(task: Task): number { /* ... */ }
}
```

## 5. Escalabilidade

### Estratégias de Escalabilidade

1. **Horizontal Scaling**
   - Docker containers
   - Load balancing (Nginx)
   - Multi-instance deployment

2. **Caching Strategy**
   - Redis para cache de sessões
   - Cache de projetos/tarefas frequentes
   - Cache de relatórios pré-calculados

3. **Database Optimization**
   - Índices apropriados
   - Particionamento de tabelas grandes
   - Read replicas para consultas pesadas

4. **Async Processing**
   - Tarefas pesadas em filas (Bull/RabbitMQ)
   - Processamento de relatórios em background
   - Notificações assíncronas

5. **CDN para Frontend**
   - Distribuição global de assets
   - Redução de latência

## 6. Observabilidade

### Logging
```typescript
logger.info('Project created', { projectId, userId });
logger.error('Database connection failed', { error, retry });
logger.debug('Calculating metrics...', { projectId });
```

### Monitoring
- Prometheus para métricas
- Grafana para dashboards
- ELK Stack para logs centralizados

### Tracing
- Jaeger para distributed tracing
- Rastreamento de requisições end-to-end

## 7. Deployment

### Ambientes
- **Development**: Local, com seed data
- **Staging**: Réplica do produção
- **Production**: AWS/Azure com alta disponibilidade

### CI/CD
```
Git Push → GitHub Actions → Build → Test → Deploy → Monitor
```

### Docker Compose (Local)
```yaml
services:
  api:
    build: ./backend
    ports: ["3000:3000"]
    
  web:
    build: ./frontend
    ports: ["3001:3001"]
    
  db:
    image: postgres:14
    
  redis:
    image: redis:7
    
  worker:
    build: ./backend
    command: npm run worker
```

## 8. Performance

### SLOs (Service Level Objectives)
- Latência P99: < 200ms
- Disponibilidade: 99.9%
- Taxa de erro: < 0.1%

### Targets
- Homepage carrega em < 2s
- Dashboard atualiza em < 500ms
- API responde em < 100ms (p99)
