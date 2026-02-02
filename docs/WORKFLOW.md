# 🔄 Fluxos de Trabalho e Processos

## 1. Fluxo de Priorização de Tarefas

### Algoritmo de Priorização Automática

```
score_prioridade = (urgência × 0.4) + (impacto × 0.3) + (disponibilidade × 0.2) + (dependências × 0.1)

Onde:
- Urgência (0-10): Baseada em deadline
- Impacto (0-10): Impacto no projeto
- Disponibilidade (0-10): Recursos disponíveis
- Dependências (0-10): Quantas tarefas dependem desta
```

### Matriz de Priorização

```
                IMPACTO
        BAIXO      MÉDIO      ALTO
URGÊNCIA
BAIXA    [4]        [6]        [7]     Prioridade Baixa
MÉDIA    [6]        [7]        [8]     Prioridade Média
ALTA     [8]        [9]       [10]     Prioridade Alta/Crítica
```

### Implementação em Código

```typescript
interface TaskPrioritization {
  urgencyScore: number;      // 0-10 baseado em deadline
  impactScore: number;       // 0-10 baseado em importância
  availabilityScore: number; // 0-10 recursos disponíveis
  dependencyScore: number;   // 0-10 quantas dependem desta
}

function calculatePriority(task: TaskPrioritization): number {
  return (
    task.urgencyScore * 0.4 +
    task.impactScore * 0.3 +
    task.availabilityScore * 0.2 +
    task.dependencyScore * 0.1
  );
}

function getUrgencyScore(daysUntilDeadline: number): number {
  if (daysUntilDeadline <= 0) return 10;      // Vencido
  if (daysUntilDeadline <= 3) return 9;       // Crítico
  if (daysUntilDeadline <= 7) return 7;       // Alto
  if (daysUntilDeadline <= 14) return 5;      // Médio
  return 3;                                   // Baixo
}

function getAvailabilityScore(
  requiredHours: number,
  teamCapacity: number
): number {
  const utilizationRate = (requiredHours / teamCapacity) * 100;
  
  if (utilizationRate > 100) return 1;   // Sem capacidade
  if (utilizationRate > 85) return 3;    // Capacidade limitada
  if (utilizationRate > 70) return 6;    // Moderada
  return 9;                              // Boa disponibilidade
}
```

## 2. Fluxo de Alocação de Recursos

### Processo de Alocação Eficiente

```
┌─────────────────────────────────────────────────┐
│ 1. Avaliar Disponibilidade da Equipe             │
│    - Horas disponíveis por membro                │
│    - Férias e licenças planejadas                │
│    - Outras alocações                            │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ 2. Identificar Especialidades Necessárias       │
│    - Skills requeridas para tarefas             │
│    - Nível de experiência needed                │
│    - Conhecimento do domínio                    │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ 3. Matching: Pessoas vs Tarefas                  │
│    - Buscar pessoas com skills certas           │
│    - Avaliar capacidade de aprendizado          │
│    - Considerar crescimento profissional        │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ 4. Otimizar Alocação                             │
│    - Maximizar utilização sem overload          │
│    - Distribuir conhecimento na equipe          │
│    - Considerar preferências pessoais           │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ 5. Notificar e Monitorar                         │
│    - Comunicar atribuições                      │
│    - Acompanhar progresso                       │
│    - Ajustar conforme necessário                │
└─────────────────────────────────────────────────┘
```

### Algoritmo de Alocação Inteligente

```typescript
interface AllocationRequest {
  taskId: string;
  requiredHours: number;
  requiredSkills: string[];
  deadline: Date;
}

interface TeamMember {
  id: string;
  name: string;
  skills: SkillLevel[];
  availableHours: number;
  currentUtilization: number;
  preferredRoles: string[];
}

async function allocateResources(
  tasks: AllocationRequest[],
  team: TeamMember[]
): Promise<Allocation[]> {
  // 1. Ordenar tarefas por prioridade
  const sortedTasks = tasks.sort((a, b) => 
    calculatePriority(b) - calculatePriority(a)
  );
  
  // 2. Para cada tarefa
  for (const task of sortedTasks) {
    // 3. Encontrar melhor match
    const candidates = team.filter(member => {
      const hasSkills = task.requiredSkills.every(skill =>
        member.skills.some(s => s.name === skill && s.level >= 6)
      );
      
      const hasCapacity = member.availableHours >= task.requiredHours;
      
      return hasSkills && hasCapacity;
    });
    
    // 4. Ordenar por score
    const scored = candidates.map(c => ({
      member: c,
      score: calculateAllocationScore(c, task)
    }));
    
    // 5. Atribuir melhor candidato
    if (scored.length > 0) {
      const best = scored[0];
      allocate(task, best.member, task.requiredHours);
    } else {
      // Considerar treinamento ou contratação
      flagResourceGap(task);
    }
  }
}

function calculateAllocationScore(
  member: TeamMember,
  task: AllocationRequest
): number {
  const skillsMatch = task.requiredSkills.reduce((score, skill) => {
    const skillLevel = member.skills.find(s => s.name === skill)?.level ?? 0;
    return score + (skillLevel / 10);
  }, 0) / task.requiredSkills.length;
  
  const capacityScore = (member.availableHours / task.requiredHours) * 0.8 + 0.2;
  const preferenceScore = member.preferredRoles.some(
    role => task.type === role
  ) ? 1.1 : 0.9;
  
  return skillsMatch * 0.5 + capacityScore * 0.3 + preferenceScore * 0.2;
}
```

## 3. Fluxo de Criação de Projeto

```
┌─────────────────────────────────────────────────┐
│ STAKEHOLDER INICIA REQUISIÇÃO DE NOVO PROJETO   │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ VALIDAÇÃO INICIAL                                │
│ ✓ Informações completas                         │
│ ✓ Budget aprovado                               │
│ ✓ Stakeholders identificados                    │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ PROJETO CRIADO EM STATUS "PLANNING"              │
│ - ID gerado                                     │
│ - Timestamp criação registrado                  │
│ - Owner atribuído                               │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ DEFINIR ESCOPO E OBJETIVOS                       │
│ - Listar entregas principais                    │
│ - Definir KPIs                                  │
│ - Criar trabalho inicial (work breakdown)       │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ MONTAR EQUIPE                                    │
│ - Identificar roles necessários                 │
│ - Convidar membros                              │
│ - Definir permissões                            │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ CRIAR TAREFAS E MARCOS                           │
│ - Quebrar em tarefas menores                    │
│ - Atribuir proprietários de tarefas             │
│ - Definir dependências                          │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ PLANEJAR COMUNICAÇÃO E RISCOS                    │
│ - Definir frequência de updates                 │
│ - Identificar riscos potenciais                 │
│ - Planejar mitigações                           │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ APROVAR PROJETO                                  │
│ STATUS MUDA PARA "ACTIVE"                       │
│ - Notificar todos os stakeholders               │
│ - Iniciar tracking                              │
│ - Abrir comunicação com cliente                 │
└─────────────────────────────────────────────────┘
```

## 4. Fluxo de Atualização de Status de Tarefas

```
PENDING ─→ IN_PROGRESS ─→ IN_REVIEW ─→ COMPLETED
  ↑           ↓                ↓           ↑
  │      (pode voltar)    (pode rejeitar) │
  └─────────────────────────────────────┘
       
BLOCKED (estado especial, pode ocorrer de qualquer estado)
CANCELLED (estado final alternativo)
```

### Validações por Transição

```typescript
const transitionRules = {
  PENDING: {
    to: ['IN_PROGRESS', 'CANCELLED'],
    requires: [],
    triggers: []
  },
  
  IN_PROGRESS: {
    to: ['IN_REVIEW', 'PENDING', 'BLOCKED', 'CANCELLED'],
    requires: ['actual_hours > 0', 'not_blocked'],
    triggers: [
      'notify_assignee',
      'update_project_metrics',
      'check_dependencies'
    ]
  },
  
  IN_REVIEW: {
    to: ['COMPLETED', 'IN_PROGRESS', 'BLOCKED', 'CANCELLED'],
    requires: ['review_comment'],
    triggers: [
      'notify_reviewer',
      'run_quality_checks',
      'update_burn_down'
    ]
  },
  
  COMPLETED: {
    to: ['IN_PROGRESS'], // Apenas em casos de rollback
    requires: ['completion_comment'],
    triggers: [
      'notify_stakeholders',
      'release_blocked_tasks',
      'update_team_metrics',
      'trigger_next_tasks'
    ]
  },
  
  BLOCKED: {
    to: ['IN_PROGRESS', 'CANCELLED'],
    requires: ['blocked_reason'],
    triggers: [
      'notify_manager',
      'create_escalation',
      'alert_dependent_tasks'
    ]
  }
};

async function changeTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  context: StatusChangeContext
): Promise<void> {
  const task = await getTask(taskId);
  const rule = transitionRules[task.status];
  
  // Validar transição
  if (!rule.to.includes(newStatus)) {
    throw new InvalidStatusTransition(
      `Cannot transition from ${task.status} to ${newStatus}`
    );
  }
  
  // Validar requisitos
  for (const requirement of rule.requires) {
    if (!validateRequirement(task, requirement)) {
      throw new MissingRequirement(requirement);
    }
  }
  
  // Atualizar status
  await updateTask(taskId, { status: newStatus });
  
  // Registrar no histórico
  await createTaskHistory(taskId, {
    field: 'status',
    oldValue: task.status,
    newValue: newStatus,
    changedBy: context.userId
  });
  
  // Disparar triggers
  for (const trigger of rule.triggers) {
    await executeTrigger(trigger, task);
  }
  
  // Emitir evento
  eventBus.emit('task.status.changed', {
    taskId,
    oldStatus: task.status,
    newStatus,
    timestamp: new Date()
  });
}
```

## 5. Fluxo de Notificações

```
EVENT OCCURS
    ↓
┌─────────────────────────────────────────┐
│ Event Bus Captures Event                 │
│ (e.g., task.created, status.changed)    │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ Determine Notification Recipients        │
│ - Task assignee                          │
│ - Project owner                          │
│ - Watchers                               │
│ - Mentioned users (@username)            │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ Create Notification Records              │
│ - Save to database                       │
│ - Set read_at = NULL                     │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ Send via Multiple Channels               │
│ ├─ In-app (WebSocket)                   │
│ ├─ Email (SMTP)                         │
│ └─ Push (FCM/APNs)                      │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ Log Notification Events                  │
│ - Track delivery status                  │
│ - Record preferences                     │
└─────────────────────────────────────────┘
```

### Tipos de Notificação e Destinatários

| Evento | Destinatários | Canais |
|--------|---------------|--------|
| Task Assigned | Assignee | All |
| Task Completed | Owner, Team | All |
| Deadline Alert | Assignee, Owner | Email, Push |
| Comment Added | Watchers, Mentioned | All |
| Status Changed | Owner, Team | All |
| Blocked Alert | Owner, Manager | Email, Push |
| Project Started | All Members | In-app, Email |

## 6. Fluxo de Aprovação de Tarefas

```
┌──────────────────────────────────────────┐
│ TAREFA PRONTA PARA REVISÃO                │
│ Status: IN_REVIEW                         │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ REVIEWER DESIGNADO                        │
│ (Owner ou Lead da tarefa)                 │
└────────────┬─────────────────────────────┘
             │
     ┌───────┴────────┐
     │                │
┌────▼─────────┐  ┌───▼───────────┐
│ APROVADO     │  │ REJEIÇÃO      │
│ - Revisar    │  │ - Feedback    │
│ - Testes OK  │  │ - Issues      │
│ - QA passa   │  │ - Retornar    │
└────┬─────────┘  └───┬───────────┘
     │                │
     │        ┌───────┴────────┐
     │        │                │
┌────▼────────▼─────────────────────────┐
│ COMENTÁRIOS E DISCUSSÃO               │
│ - Detalhar problemas encontrados      │
│ - Sugestões de melhoria               │
│ - Pedir esclarecimentos               │
└────┬─────────────────────────────────┘
     │
┌────▼──────────────────────────────────┐
│ IMPLEMENTAR FEEDBACK                   │
│ Status: IN_PROGRESS (novamente)       │
│ - Correções necessárias               │
│ - Testes adicionais                   │
└────┬──────────────────────────────────┘
     │
┌────▼──────────────────────────────────┐
│ RESUBMETER PARA REVISÃO                │
│ Status: IN_REVIEW                      │
└────┬──────────────────────────────────┘
     │
     └──→ (Loop até aprovação ou rejeição definitiva)
     
     ↓
┌──────────────────────────────────────────┐
│ APROVAÇÃO FINAL                           │
│ Status: COMPLETED                         │
│ - Marcar como concluído                  │
│ - Release de tarefas dependentes         │
│ - Notificar stakeholders                 │
└──────────────────────────────────────────┘
```

## 7. Fluxo de Escalação

```
PROBLEMA IDENTIFIC ADO
         ↓
┌──────────────────────────────────┐
│ NÍVEL 1: GERENTE DIRETO           │
│ Timeout: 24 horas                 │
│ - Revisar problema                │
│ - Tentar resolução                │
└────────────┬─────────────────────┘
             │
        ┌────┴────┐
        │          │
    RESOLVIDO  NÃO RESOLVIDO
        │          │
        │    ┌─────▼──────────────────────┐
        │    │ NÍVEL 2: GERENTE DE PROJETO│
        │    │ Timeout: 12 horas          │
        │    │ - Análise profunda         │
        │    │ - Recursos adicionais      │
        │    └─────┬──────────────────────┘
        │          │
        │     ┌────┴────┐
        │     │          │
        │ RESOLVIDO  NÃO RESOLVIDO
        │     │          │
        │     │    ┌─────▼──────────────────────┐
        │     │    │ NÍVEL 3: DIRETOR/PMO       │
        │     │    │ Timeout: 6 horas           │
        │     │    │ - Decisão estratégica      │
        │     │    │ - Recursos de emergência   │
        │     │    └─────┬──────────────────────┘
        │     │          │
        │     │     ┌────┴────┐
        │     │     │          │
        │     │ RESOLVIDO  CRÍTICA
        │     │     │          │
        │     │     │    ┌─────▼────────────┐
        │     │     │    │ CEO ENVOLVIDO    │
        │     │     │    │ Ação imediata    │
        │     │     │    └──────────────────┘
        │     │     │
        └─────┴─────┴──→ PROBLEMA RESOLVIDO
```

## 8. Fluxo de Relatório Periódico

```
┌─────────────────────────────────────────────────┐
│ ATIVADO: Diariamente (23:55) ou Sob Demanda     │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│ COLETAR DADOS                                    │
│ - Tarefas completadas                           │
│ - Horas trabalhadas                             │
│ - Progresso do projeto                          │
│ - Métricas de qualidade                         │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│ GERAR ANÁLISES                                   │
│ - Burn-down chart                               │
│ - Velocity                                      │
│ - Team performance                              │
│ - Risks & issues                                │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│ CRIAR DOCUMENTOS                                 │
│ - PDF executivo                                 │
│ - Excel com detalhes                            │
│ - HTML para dashboard                           │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│ DISTRIBUIR RELATÓRIO                             │
│ - Email para stakeholders                       │
│ - Armazenar em histórico                        │
│ - Disponibilizar no dashboard                   │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│ REGISTRAR ENTREGA                                │
│ - Timestamp                                     │
│ - Destinatários                                 │
│ - Formato entregue                              │
└─────────────────────────────────────────────────┘
```
