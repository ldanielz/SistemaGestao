# Backend Setup Guide

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker e Docker Compose (opcional, mas recomendado)

## Instalação Rápida com Docker

```bash
# 1. Na raiz do projeto
docker-compose up -d

# 2. No diretório backend
npm install

# 3. Gerar Prisma client e rodar migrations
npm run generate
npm run migrate

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

## Setup Manual (sem Docker)

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar banco de dados

#### PostgreSQL

```bash
# Criar banco de dados
createdb sgps_db

# Ou usando psql
psql -U postgres
CREATE DATABASE sgps_db;
```

#### Redis

```bash
# Iniciar Redis (se não estiver rodando)
redis-server
```

### 3. Gerar Prisma Client

```bash
npm run generate
```

### 4. Executar Migrations

```bash
npm run migrate
```

### 5. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## Variáveis de Ambiente

Criar arquivo `.env` na raiz do backend com:

```dotenv
# Database
DATABASE_URL=postgresql://usuario:senha@localhost:5432/sgps_db
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=sua-chave-super-secreta-aqui
REFRESH_TOKEN_SECRET=sua-chave-refresh-super-secreta

# Encryption (256-bit key em hex)
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Application
NODE_ENV=development
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:3001
```

## Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor com hot-reload
npm run build            # Compila TypeScript
npm run start            # Inicia servidor compilado

# Database
npm run migrate          # Roda migrations pendentes
npm run migrate:prod     # Roda migrations em produção
npm run seed             # Popula database com dados de teste
npm run studio           # Abre Prisma Studio (GUI)

# Testes
npm test                 # Roda testes uma vez
npm run test:watch      # Roda testes em modo watch
npm run test:coverage   # Gera relatório de coverage

# Code Quality
npm run lint            # Verifica lint
npm run format          # Formata código com Prettier

# Workers
npm run worker          # Inicia background job workers
```

## Estrutura de Diretórios

```
backend/
├── src/
│   ├── config/          # Configurações (database, redis, etc)
│   ├── controllers/     # Controladores HTTP
│   ├── services/        # Lógica de negócio
│   ├── repositories/    # Camada de dados
│   ├── routes/          # Definição de rotas
│   ├── middleware/      # Middlewares (auth, validation, error)
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilitários (logger, jwt, encryption)
│   ├── database/        # Scripts de migration e seed
│   ├── workers/         # Background jobs
│   ├── server.ts        # Configuração Express
│   └── index.ts         # Entry point
├── prisma/
│   └── schema.prisma    # Schema ORM
├── tests/               # Testes automatizados
├── .env                 # Variáveis de ambiente (não commitar)
├── .env.example         # Template de variáveis
└── package.json
```

## Endpoints Disponíveis

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/refresh` - Renovar access token
- `POST /api/auth/logout` - Fazer logout

## Troubleshooting

### Erro: "connect ECONNREFUSED 127.0.0.1:5432"

O PostgreSQL não está rodando. Inicie-o:

```bash
# macOS com Homebrew
brew services start postgresql

# Linux com systemd
sudo systemctl start postgresql

# Ou com Docker
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:14
```

### Erro: "ECONNREFUSED 127.0.0.1:6379"

Redis não está rodando:

```bash
# macOS com Homebrew
brew services start redis

# Linux com systemd
sudo systemctl start redis-server

# Ou com Docker
docker run --name redis -p 6379:6379 -d redis:7
```

### Erro ao rodar migrations

```bash
# Verificar status das migrations
npx prisma migrate status

# Reset database (⚠️ apaga tudo)
npx prisma migrate reset
```

## Desenvolvimento

### Adicionar novas rotas

1. Criar controller em `src/controllers/`
2. Criar service em `src/services/`
3. Criar repository em `src/repositories/`
4. Criar arquivo de rotas em `src/routes/`
5. Registrar rotas em `src/server.ts`

### Adicionar novo modelo

1. Atualizar `prisma/schema.prisma`
2. Executar `npm run migrate` para criar migration
3. Gerar tipos: `npm run generate`

## Health Check

```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{
  "statusCode": 200,
  "message": "API is healthy",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "environment": "development",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

## Próximas Etapas

1. ✅ Setup foundation (config, types, middleware)
2. ⏳ Implementar endpoints de projeto (CRUD)
3. ⏳ Implementar endpoints de tarefas (CRUD)
4. ⏳ Implementar endpoints de serviços (CRUD)
5. ⏳ Adicionar testes automatizados
6. ⏳ Deploy em produção
