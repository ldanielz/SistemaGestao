# 📊 Esquema de Banco de Dados

## Diagrama ER (Entity-Relationship)

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │
│ email           │◄────────────────┐
│ password_hash   │                 │
│ first_name      │                 │
│ last_name       │        ┌────────┴──────────┐
│ role            │        │                   │
│ status          │        │                   │
│ created_at      │        │                   │
│ updated_at      │        │                   │
└─────────────────┘        │                   │
         ▲                  │                   │
         │                  │                   │
         │                  │    ┌──────────────┴──────────┐
         │                  │    │                         │
         │                  │    │                         │
┌────────┴────────┐   ┌─────▼──────────────┐   ┌──────────▼──────┐
│  PROJECT_MEMBERS│   │    PROJECTS        │   │      TASKS      │
├─────────────────┤   ├────────────────────┤   ├─────────────────┤
│ id (PK)         │   │ id (PK)            │   │ id (PK)         │
│ project_id (FK) │───┤ id                 │   │ project_id (FK) │◄──┐
│ user_id (FK)    │   │ name               │   │ title           │   │
│ role            │   │ description        │   │ description     │   │
│ joined_at       │   │ status             │───┤ status          │   │
└─────────────────┘   │ priority           │   │ priority        │   │
                      │ start_date         │   │ assigned_to (FK)│   │
                      │ end_date           │   │ start_date      │   │
                      │ budget             │   │ end_date        │   │
                      │ created_by (FK)    │   │ estimated_hours │   │
                      │ created_at         │   │ actual_hours    │   │
                      │ updated_at         │   │ created_by (FK) │   │
                      └────────────────────┘   │ created_at      │   │
                             ▲                 │ updated_at      │   │
                             │                 └─────────────────┘   │
                             │                         │              │
                             │                         │              │
                      ┌──────┴────────┐         ┌──────┴──────┐      │
                      │               │         │             │      │
                      │               │    ┌────▼───────────┐│      │
                  ┌───┴────────────┐  │    │ TASK_ASSIGNEES││      │
                  │ SERVICES       │  │    ├────────────────┤│      │
                  ├────────────────┤  │    │ id (PK)        ││      │
                  │ id (PK)        │  │    │ task_id (FK)   ├┘      │
                  │ project_id (FK)├──┘    │ user_id (FK)   ├───────┘
                  │ name           │       │ assigned_at    │
                  │ description    │       └────────────────┘
                  │ type           │
                  │ status         │       ┌────────────────────┐
                  │ assigned_to(FK)│       │  TASK_COMMENTS     │
                  │ created_by(FK) │       ├────────────────────┤
                  │ created_at     │       │ id (PK)            │
                  │ updated_at     │       │ task_id (FK)       │
                  └────────────────┘       │ user_id (FK)       │
                                           │ comment            │
                                           │ created_at         │
                                           │ updated_at         │
                                           └────────────────────┘

                    ┌────────────────────┐
                    │ TASK_ATTACHMENTS   │
                    ├────────────────────┤
                    │ id (PK)            │
                    │ task_id (FK)       │
                    │ file_url           │
                    │ file_name          │
                    │ file_size          │
                    │ uploaded_by (FK)   │
                    │ created_at         │
                    └────────────────────┘

                    ┌────────────────────┐
                    │ TASK_HISTORY       │
                    ├────────────────────┤
                    │ id (PK)            │
                    │ task_id (FK)       │
                    │ field_changed      │
                    │ old_value          │
                    │ new_value          │
                    │ changed_by (FK)    │
                    │ changed_at         │
                    └────────────────────┘

                    ┌────────────────────┐
                    │ NOTIFICATIONS      │
                    ├────────────────────┤
                    │ id (PK)            │
                    │ user_id (FK)       │
                    │ type               │
                    │ message            │
                    │ related_entity_id  │
                    │ is_read            │
                    │ created_at         │
                    └────────────────────┘

                    ┌────────────────────┐
                    │ AUDIT_LOGS         │
                    ├────────────────────┤
                    │ id (PK)            │
                    │ user_id (FK)       │
                    │ action             │
                    │ entity_type        │
                    │ entity_id          │
                    │ old_values         │
                    │ new_values         │
                    │ ip_address         │
                    │ created_at         │
                    └────────────────────┘
```

## Tabelas Detalhadas

### 1. USERS
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(20),
  role ENUM('ADMIN', 'MANAGER', 'LEAD', 'DEVELOPER', 'CLIENT') NOT NULL,
  status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
);
```

### 2. PROJECTS
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED') DEFAULT 'PLANNING',
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(15, 2),
  owner_id UUID NOT NULL REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_owner_id (owner_id),
  INDEX idx_priority (priority)
);
```

### 3. PROJECT_MEMBERS
```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role ENUM('MEMBER', 'LEAD', 'MANAGER') DEFAULT 'MEMBER',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  hours_allocated INT DEFAULT 40, -- horas por semana
  UNIQUE KEY unique_project_member (project_id, user_id),
  INDEX idx_project_id (project_id),
  INDEX idx_user_id (user_id)
);
```

### 4. TASKS
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED', 'CANCELLED') DEFAULT 'PENDING',
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  start_date DATE,
  end_date DATE NOT NULL,
  estimated_hours DECIMAL(8, 2),
  actual_hours DECIMAL(8, 2) DEFAULT 0,
  assigned_to UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  blocked_reason VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_id (project_id),
  INDEX idx_status (status),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_priority (priority),
  INDEX idx_end_date (end_date)
);
```

### 5. TASK_ASSIGNEES (Para múltiplos assignees)
```sql
CREATE TABLE task_assignees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  allocated_hours DECIMAL(8, 2),
  UNIQUE KEY unique_task_assignee (task_id, user_id),
  INDEX idx_task_id (task_id),
  INDEX idx_user_id (user_id)
);
```

### 6. TASK_COMMENTS
```sql
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_task_id (task_id),
  INDEX idx_user_id (user_id)
);
```

### 7. TASK_ATTACHMENTS
```sql
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  file_type VARCHAR(50),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_task_id (task_id)
);
```

### 8. TASK_HISTORY
```sql
CREATE TABLE task_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  field_changed VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID NOT NULL REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_task_id (task_id),
  INDEX idx_changed_at (changed_at)
);
```

### 9. SERVICES
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('DEVELOPMENT', 'DESIGN', 'TESTING', 'DEPLOYMENT', 'SUPPORT', 'CONSULTATION') DEFAULT 'DEVELOPMENT',
  status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
  start_date DATE,
  end_date DATE,
  cost DECIMAL(15, 2),
  assigned_to UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_id (project_id),
  INDEX idx_status (status)
);
```

### 10. NOTIFICATIONS
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type ENUM('TASK_ASSIGNED', 'TASK_COMPLETED', 'COMMENT_ADDED', 'PROJECT_STARTED', 'DEADLINE_ALERT', 'STATUS_CHANGED', 'MENTION') NOT NULL,
  message TEXT NOT NULL,
  related_entity_type VARCHAR(50), -- 'task', 'project', 'comment'
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);
```

### 11. AUDIT_LOGS
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, EXPORT
  entity_type VARCHAR(50) NOT NULL, -- 'project', 'task', 'user'
  entity_id UUID NOT NULL,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20), -- SUCCESS, FAILED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_entity_type (entity_type),
  INDEX idx_created_at (created_at)
);
```

## Índices Importantes

```sql
-- Performance para dashboards
CREATE INDEX idx_tasks_by_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_by_assignee_status ON tasks(assigned_to, status);

-- Performance para relatórios
CREATE INDEX idx_tasks_completed ON tasks(project_id, status, updated_at) WHERE status = 'COMPLETED';
CREATE INDEX idx_tasks_timeline ON tasks(project_id, end_date, start_date);

-- Performance para notificações
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at);

-- Performance para auditoria
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id, created_at);
```

## Constraints e Relacionamentos

### Integridade Referencial
- ON DELETE CASCADE para manter consistência
- ON UPDATE CASCADE para propagação de mudanças
- Foreign keys em todas as relações

### Validações em Nível de Banco
- end_date >= start_date
- budget >= 0
- estimated_hours > 0
- email deve ser válido
- status deve estar em enum permitidos

## Particionamento (Para grandes volumes)

```sql
-- Particionar tabelas_tasks por ano de criação
PARTITION BY RANGE (YEAR(created_at)) (
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION pfuture VALUES LESS THAN MAXVALUE
);
```
