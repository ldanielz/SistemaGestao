# 🧪 Testing Guide - Core Service Endpoints

## 📋 Pré-requisitos

1. Backend rodando: `npm run dev` na porta 3000
2. PostgreSQL e Redis rodando
3. Database com migrations executadas
4. Postman, Insomnia, ou cURL instalado

---

## 🚀 Quick Test Workflow

### 1. Registrar Novo Usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "Test@123456",
    "firstName": "João",
    "lastName": "Silva"
  }'
```

**Resposta esperada (201)**:
```json
{
  "statusCode": 201,
  "message": "Usuário criado com sucesso",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "teste@example.com",
      "firstName": "João",
      "lastName": "Silva",
      "role": "DEVELOPER",
      "createdAt": "2024-02-02T10:00:00Z"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Guardar**: `ACCESS_TOKEN` para os próximos testes

---

### 2. Fazer Login (Alternativa)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "Test@123456"
  }'
```

---

## 👤 User Endpoints Tests

### Obter Usuário Atual

```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Resposta (200)**:
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "email": "teste@example.com",
    "firstName": "João",
    "lastName": "Silva",
    "role": "DEVELOPER",
    "status": "ACTIVE"
  }
}
```

### Atualizar Perfil

```bash
curl -X PUT http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "João",
    "lastName": "Silva Costa",
    "phone": "+5511999999999"
  }'
```

---

## 📁 Project Endpoints Tests

### Criar Projeto

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Projeto Novo",
    "description": "Descrição do projeto",
    "startDate": "2024-02-15",
    "endDate": "2024-03-15",
    "priority": "HIGH",
    "budget": 50000
  }'
```

**Resposta (201)**:
```json
{
  "statusCode": 201,
  "message": "Projeto criado com sucesso",
  "data": {
    "id": "project-uuid",
    "name": "Projeto Novo",
    "status": "PLANNING",
    "priority": "HIGH",
    "budget": "50000",
    "ownerId": "user-uuid",
    "createdAt": "2024-02-02T10:00:00Z"
  }
}
```

**Guardar**: `PROJECT_ID`

### Listar Meus Projetos

```bash
curl -X GET "http://localhost:3000/api/projects/my-projects?page=1&pageSize=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Obter Projeto com Detalhes

```bash
curl -X GET http://localhost:3000/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Atualizar Projeto

```bash
curl -X PUT http://localhost:3000/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Projeto Atualizado",
    "status": "ACTIVE",
    "priority": "CRITICAL"
  }'
```

### Adicionar Membro ao Projeto

```bash
# Precisa de outro USER_ID
curl -X POST http://localhost:3000/api/projects/$PROJECT_ID/members \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "other-user-uuid",
    "role": "LEAD"
  }'
```

---

## 📝 Task Endpoints Tests

### Criar Tarefa

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "$PROJECT_ID",
    "title": "Implementar Login",
    "description": "Criar sistema de autenticação",
    "priority": "MEDIUM",
    "endDate": "2024-02-28",
    "estimatedHours": 8
  }'
```

**Resposta (201)**:
```json
{
  "statusCode": 201,
  "message": "Tarefa criada com sucesso",
  "data": {
    "id": "task-uuid",
    "projectId": "project-uuid",
    "title": "Implementar Login",
    "status": "PENDING",
    "priority": "MEDIUM",
    "estimatedHours": 8,
    "actualHours": 0,
    "createdAt": "2024-02-02T10:00:00Z"
  }
}
```

**Guardar**: `TASK_ID`

### Listar Tarefas do Projeto

```bash
curl -X GET "http://localhost:3000/api/tasks/project/$PROJECT_ID?page=1&pageSize=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Obter Tarefa

```bash
curl -X GET http://localhost:3000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Atualizar Tarefa

```bash
curl -X PUT http://localhost:3000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "actualHours": 2
  }'
```

### Atribuir Usuário à Tarefa

```bash
curl -X POST http://localhost:3000/api/tasks/$TASK_ID/assign \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid"
  }'
```

### Adicionar Comentário

```bash
curl -X POST http://localhost:3000/api/tasks/$TASK_ID/comments \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Iniciando desenvolvimento",
    "isInternal": false
  }'
```

### Minhas Tarefas

```bash
curl -X GET "http://localhost:3000/api/tasks/assigned-to-me?page=1&pageSize=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Tarefas Vencidas

```bash
curl -X GET http://localhost:3000/api/tasks/overdue \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## 📊 Complete Test Scenario

### 1. Registrar 2 usuários
```bash
# Usuário 1: Manager
export USER1_EMAIL="manager@example.com"
export USER1_PASS="Manager@123456"

# Usuário 2: Developer
export USER2_EMAIL="dev@example.com"
export USER2_PASS="Dev@123456"
```

### 2. Criar Projeto
```bash
# Com token do USER1
export PROJECT_ID=$(curl -s -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{"name":"Test Project",...}' | jq -r '.data.id')
```

### 3. Adicionar Membro
```bash
curl -X POST http://localhost:3000/api/projects/$PROJECT_ID/members \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{\"userId\":\"$USER2_ID\",\"role\":\"MEMBER\"}"
```

### 4. Criar Tarefa
```bash
export TASK_ID=$(curl -s -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{\"projectId\":\"$PROJECT_ID\",\"title\":\"Test Task\",...}" | jq -r '.data.id')
```

### 5. Atribuir Tarefa
```bash
curl -X POST http://localhost:3000/api/tasks/$TASK_ID/assign \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{\"userId\":\"$USER2_ID\"}"
```

### 6. Atualizar Status
```bash
curl -X PUT http://localhost:3000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{"status":"IN_PROGRESS"}'
```

### 7. Adicionar Comentário
```bash
curl -X POST http://localhost:3000/api/tasks/$TASK_ID/comments \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{"comment":"Starting work on this"}'
```

---

## ✅ Validation Error Tests

### Teste: Data inválida
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "projectId": "uuid",
    "title": "Task",
    "endDate": "2000-01-01"  # Data no passado!
  }'
```

**Esperado (400)**:
```json
{
  "statusCode": 400,
  "error": "Data de término deve ser no futuro"
}
```

### Teste: Título muito curto
```bash
curl -X POST http://localhost:3000/api/tasks \
  -d '{"projectId":"uuid","title":"ab",...}'
```

**Esperado (422)**:
```json
{
  "statusCode": 422,
  "error": "Validação falhou",
  "details": [...]
}
```

### Teste: Sem autorização
```bash
curl -X DELETE http://localhost:3000/api/projects/$OTHER_PROJECT_ID \
  -H "Authorization: Bearer $YOUR_TOKEN"
```

**Esperado (403)**:
```json
{
  "statusCode": 403,
  "error": "Sem permissão para deletar este projeto"
}
```

---

## 🔍 Debugging Tips

### Ver logs do servidor
```bash
# Abrir outro terminal
cd backend
npm run dev
# Veja console output para todos os requests
```

### Verificar banco de dados
```bash
# Abrir Prisma Studio
npm run studio
# Acesse em http://localhost:5555
```

### Verificar Redis
```bash
redis-cli
KEYS *
GET 'Project:list:*'
```

---

## 📈 Performance Tests

### Teste de cache
```bash
# Primeira requisição (sem cache)
time curl -X GET http://localhost:3000/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"

# Segunda requisição (com cache)
time curl -X GET http://localhost:3000/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

Esperado: Segunda requisição muito mais rápida!

---

## 📝 Postman Collection Template

```json
{
  "info": {
    "name": "SGPS API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/auth/register"
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "BASE_URL",
      "value": "http://localhost:3000"
    },
    {
      "key": "ACCESS_TOKEN",
      "value": ""
    }
  ]
}
```

---

## 🎯 Success Criteria

✅ Registrar usuário - 201  
✅ Fazer login - 200 com tokens  
✅ Criar projeto - 201 com ID  
✅ Listar projetos - 200 com paginação  
✅ Criar tarefa - 201 com ID  
✅ Atualizar tarefa - 200  
✅ Adicionar comentário - 201  
✅ Sem autorização - 403  
✅ Validação inválida - 422  
✅ Recurso não encontrado - 404  

---

**Happy Testing! 🧪**
