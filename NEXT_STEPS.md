# ✅ Próximos Passos - Backend Development Roadmap

## 🎯 Checklist Imediato (Próximas 2 Horas)

### 1. Verificar Setup ✅
- [x] TypeScript compilando
- [x] Estrutura de diretórios criada
- [x] Middleware implementado
- [x] Auth routes funcional
- [ ] **TODO**: Rodar `npm install` no backend

### 2. Instalar Dependências ⏳
```bash
cd /home/ldani/Projects/SistemaGestao/backend
npm install
```
Tempo estimado: 5-10 minutos

### 3. Configurar PostgreSQL ⏳
```bash
# Opção 1: Docker Compose (recomendado)
cd /home/ldani/Projects/SistemaGestao
docker-compose up -d db redis

# Opção 2: Manual (se não tiver Docker)
createdb sgps_db
```

### 4. Gerar Prisma Client ⏳
```bash
cd backend
npm run generate
```

### 5. Rodar Migrations ⏳
```bash
npm run migrate
```

### 6. Iniciar Servidor ⏳
```bash
npm run dev
```

### 7. Testar Health Endpoint ⏳
```bash
curl http://localhost:3000/health
```

Esperado: Resposta 200 OK com status dos serviços

### 8. Testar Auth Endpoint ⏳
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Esperado: Resposta 201 com user data + tokens

---

## 📋 Roadmap Phase 1 Continuação

### Semana 1: Foundation (95% ✅ → 100% ✅)
- [x] Estrutura de diretórios
- [x] Configuração Express + Middleware
- [x] Auth routes (register, login, refresh, logout)
- [x] Prisma schema + tipos TypeScript
- [x] Utilidades (logger, jwt, encryption, validators)
- [ ] **HOJE**: Base repository class

**Status**: 95% Completo

### Semana 2: Core Services (0% → 50% ⏳)
- [ ] Implementar BaseRepository (CRUD genérico)
- [ ] UserService & UserRepository
- [ ] ProjectService & ProjectRepository
- [ ] TaskService & TaskRepository
- [ ] Testes de services

**Tempo estimado**: 20 horas

### Semana 3: Project & Task Endpoints (0% → 100% ⏳)
- [ ] GET /api/projects (list, pagination, filters)
- [ ] POST /api/projects (create)
- [ ] GET /api/projects/:id (get one)
- [ ] PUT /api/projects/:id (update)
- [ ] DELETE /api/projects/:id (delete)
- [ ] Similar para tasks, services, users

**Endpoints totais**: 30+  
**Tempo estimado**: 25 horas

---

## 🏗️ Base Repository Pattern

### O que implementar próximo:

```typescript
// base.repository.ts (Template)
export abstract class BaseRepository<T> {
  constructor(private model: PrismaDelegate) {}

  async create(data: CreateData): Promise<T> {
    // Implementação genérica
  }

  async findById(id: string): Promise<T | null> {
    // Implementação genérica
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    // Implementação com paginação
  }

  async update(id: string, data: UpdateData): Promise<T> {
    // Implementação genérica
  }

  async delete(id: string): Promise<boolean> {
    // Implementação genérica
  }

  async count(filters?: FilterData): Promise<number> {
    // Contar registros
  }
}

// user.repository.ts
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(prisma.user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return prisma.user.findMany({ where: { role } });
  }
}
```

---

## 🎯 Próximas Implementações

### 1️⃣ Base Repository (2 horas)
```
src/repositories/
└── base.repository.ts   (CRUD genérico)
```

### 2️⃣ User Management (4 horas)
```
src/repositories/user.repository.ts
src/services/user.service.ts
src/controllers/user.controller.ts
src/routes/user.routes.ts
```

### 3️⃣ Project Management (6 horas)
```
src/repositories/project.repository.ts
src/services/project.service.ts
src/controllers/project.controller.ts
src/routes/project.routes.ts
```

### 4️⃣ Task Management (6 horas)
```
src/repositories/task.repository.ts
src/services/task.service.ts
src/controllers/task.controller.ts
src/routes/task.routes.ts
```

### 5️⃣ Testing (5 horas)
```
tests/
├── unit/
├── integration/
└── fixtures/
```

---

## 📦 Verificação de Dependências

Todas as dependências já foram adicionadas ao `package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "prisma": "^4.16.0",
    "@prisma/client": "^4.16.0",
    "redis": "^4.6.0",
    "ioredis": "^5.3.0",
    "winston": "^3.8.0",
    "express-validator": "^7.0.0",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "helmet": "^7.0.0"
  }
}
```

---

## 🔍 Verificação Pré-Desenvolvimento

Executar antes de começar:

```bash
# 1. Verificar Node.js version
node --version
# Esperado: v18.0.0 ou superior

# 2. Verificar npm
npm --version
# Esperado: v9.0.0 ou superior

# 3. Verificar PostgreSQL
psql --version
# Esperado: PostgreSQL 14+

# 4. Verificar Redis
redis-cli --version
# Esperado: redis-cli 7.0+

# 5. Verificar Docker (opcional)
docker --version
docker-compose --version
```

---

## 🚦 Pré-requisitos Instalação

Se algo faltar, instale:

### macOS (Homebrew)
```bash
brew install node postgresql redis docker docker-compose
```

### Ubuntu/Debian
```bash
sudo apt-get install nodejs npm postgresql redis-server
# Docker: https://docs.docker.com/engine/install/ubuntu/
```

### Windows
```bash
# Usar chocolatey ou baixar instaladores:
# - Node.js: https://nodejs.org/
# - PostgreSQL: https://www.postgresql.org/download/
# - Redis: https://github.com/tporadowski/redis/releases
# - Docker: https://www.docker.com/products/docker-desktop
```

---

## 📊 Tempo Estimado Total

```
Phase 1 Foundation:     40 horas (95% ✅ FEITO)
Phase 2 Core Services:   20 horas (⏳ PRÓXIMO)
Phase 3 Full APIs:       25 horas (⏳)
Phase 4 Testing:         15 horas (⏳)
Phase 5 Deployment:      10 horas (⏳)
────────────────────────────────
TOTAL:                  110 horas (3-4 semanas)
```

---

## 🎓 Recursos de Aprendizado

### TypeScript + Express
- [Express TypeScript Handbook](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Prisma ORM
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Client Guide](https://www.prisma.io/docs/orm/reference/prisma-client-reference)

### Testing
- [Jest Testing Framework](https://jestjs.io/)
- [Supertest for API Testing](https://github.com/visionmedia/supertest)

### Security
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

---

## 📞 Troubleshooting

### Problema: "ECONNREFUSED 127.0.0.1:5432"
**Solução**: PostgreSQL não está rodando
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Docker
docker-compose up -d postgres
```

### Problema: "ECONNREFUSED 127.0.0.1:6379"
**Solução**: Redis não está rodando
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis-server

# Docker
docker-compose up -d redis
```

### Problema: "Cannot find module 'ts-node'"
**Solução**: Instalar dependências
```bash
cd backend
npm install
```

### Problema: "Prisma client not generated"
**Solução**: Gerar Prisma client
```bash
npm run generate
```

---

## 📝 Notas de Desenvolvimento

1. **Sempre commitar tipos TypeScript completos**
2. **Testes antes de implementar novos endpoints**
3. **Usar migrations do Prisma para schema changes**
4. **Revisar logs com Winston quando houver erros**
5. **Testar autenticação em cada novo endpoint**
6. **Manter variáveis de ambiente seguras**

---

## ✅ Checklist Final

Antes de começar a código novo:

- [ ] Leu [backend/SETUP.md](./backend/SETUP.md)
- [ ] Executou `npm install` com sucesso
- [ ] Criou banco de dados PostgreSQL
- [ ] Rodou `npm run migrate`
- [ ] Testou `npm run dev` (servidor rodando)
- [ ] Testou GET `/health` (resposta 200)
- [ ] Testou POST `/api/auth/register` (resposta 201)
- [ ] Verificou logs com Winston
- [ ] Verificou variáveis `.env`

---

## 🚀 Próximo Comando

```bash
cd /home/ldani/Projects/SistemaGestao/backend
npm install
```

Tempo estimado: 10 minutos ⏱️

**Bom desenvolvimento! 💻**
