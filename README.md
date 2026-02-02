# Sistema de Gestão de Projetos e Serviços (SGPS)

## 📋 Visão Geral

Sistema completo e escalável para gerenciamento de projetos, tarefas e serviços, com suporte a múltiplos usuários, colaboração em tempo real e análises detalhadas.

## 🎯 Objetivos Principais

- ✅ Centralizar o gerenciamento de projetos e tarefas
- ✅ Melhorar a colaboração entre equipes
- ✅ Forneccer visibilidade em tempo real do progresso
- ✅ Automatizar fluxos de trabalho e notificações
- ✅ Gerar relatórios e análises de desempenho
- ✅ Integrar com ferramentas externas

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                    │
│  React.js / Vue.js / Angular - Dashboard Web e Mobile       │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│              GATEWAY & CAMADA DE SERVIÇOS                    │
│  Express.js / Node.js - API RESTful + WebSocket            │
│  Autenticação JWT/OAuth2, Rate Limiting, Cache              │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│              CAMADA DE LÓGICA DE NEGÓCIO                     │
│  Services, Controllers, Validações, Regras de Negócio      │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│              CAMADA DE ACESSO A DADOS                        │
│  ORM (Prisma/Sequelize), Repositories, Migrations          │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│         BANCO DE DADOS & CACHE & FILA                       │
│  PostgreSQL, Redis, RabbitMQ/Bull Queue                     │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estrutura de Diretórios

```
SistemaGestao/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Controladores
│   │   ├── services/          # Lógica de negócio
│   │   ├── models/            # Modelos de dados
│   │   ├── routes/            # Rotas da API
│   │   ├── middleware/        # Middlewares
│   │   ├── utils/             # Utilitários
│   │   ├── validators/        # Validações
│   │   └── config/            # Configurações
│   ├── tests/
│   ├── migrations/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/             # Páginas
│   │   ├── services/          # Serviços API
│   │   ├── store/             # Redux/Pinia
│   │   ├── hooks/             # Custom hooks
│   │   └── styles/            # Estilos globais
│   ├── public/
│   └── package.json
├── database/
│   ├── schema.sql             # Esquema do banco
│   ├── migrations/            # Migrações
│   └── seeds/                 # Dados iniciais
├── docs/
│   ├── ARCHITECTURE.md        # Arquitetura
│   ├── API_ENDPOINTS.md       # Endpoints
│   ├── DATABASE_SCHEMA.md     # Esquema DB
│   ├── WORKFLOW.md            # Fluxos de trabalho
│   └── SECURITY.md            # Segurança
├── docker-compose.yml
└── README.md
```

## 🚀 Stack Tecnológico Recomendado

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + TailwindCSS |
| Backend | Node.js + Express.js + TypeScript |
| Banco de Dados | PostgreSQL 14+ |
| Cache | Redis |
| Fila de Mensagens | Bull Queue / RabbitMQ |
| Autenticação | JWT + OAuth2 |
| ORM | Prisma |
| Testes | Jest + Supertest |
| Hospedagem | AWS / Docker |

## 📚 Documentação

- [Arquitetura Detalhada](docs/ARCHITECTURE.md)
- [Endpoints da API](docs/API_ENDPOINTS.md)
- [Esquema do Banco de Dados](docs/DATABASE_SCHEMA.md)
- [Fluxos de Trabalho](docs/WORKFLOW.md)
- [Guia de Segurança](docs/SECURITY.md)

## 🔐 Segurança

- ✅ JWT com refresh tokens
- ✅ Controle de acesso baseado em papéis (RBAC)
- ✅ Criptografia de dados sensíveis
- ✅ Rate limiting e proteção contra ataques
- ✅ Logs de auditoria completos
- ✅ Backup automático diário

## 📦 Instalação

```bash
# Clone o repositório
git clone <[repo-url](https://github.com/ldanielz/SistemaGestao)>

# Backend
cd backend
npm install
npm run migrate
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## 📄 Licença

MIT
