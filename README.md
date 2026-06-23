# TaskFlow AI

Gerenciador de tarefas moderno **fullstack** com backend em **NestJS** e frontend em **React + Vite**, incluindo um **quadro Kanban por projeto**, **dashboard com métricas** e uma **sugestão de prioridade por "IA" local e explicável** (sem dependência de APIs externas).

Projeto pensado como peça de portfólio: código limpo, modular, validado, documentado via Swagger e pronto para subir com **Docker Compose**.

---

## 📸 Preview

Interface moderna, responsiva e pronta para portfólio — veja como o app se comporta **sem precisar clonar ou rodar localmente**:

### Dashboard

Visão geral com métricas, gráficos por status/prioridade e próximos prazos.

![Dashboard — métricas, gráficos e próximos prazos](docs/screenshots/dashboard.png)

### Projetos

Gerenciamento de projetos com contagem de tarefas e acesso direto ao quadro Kanban.

![Projetos — cards com CRUD e link para o Kanban](docs/screenshots/projetos.png)

### IA de Prioridade

Playground interativo que analisa título, descrição e prazo para sugerir prioridade com score e motivos explicáveis.

![IA de Prioridade — heurística local sem APIs externas](docs/screenshots/ia-prioridade.png)

---

## ✨ Funcionalidades

- **Projetos** — CRUD completo (nome + descrição).
- **Tarefas** — CRUD completo com `título`, `descrição`, `status` (TODO / DOING / DONE), `prioridade` (LOW / MEDIUM / HIGH), `deadline` e `projectId`.
- **Kanban por projeto** — três colunas com **drag-and-drop** e atualização otimista.
- **Dashboard** — total de tarefas, tarefas atrasadas, conclusão (%), distribuição por status e por prioridade (gráficos) e próximos prazos.
- **IA de Prioridade (local)** — endpoint que sugere a prioridade a partir do título, descrição e prazo, retornando **score, confiança e os motivos** da decisão. Lógica 100% explicável, sem chamadas externas.
- **Frontend moderno e responsivo** — React + TailwindCSS, layout com sidebar, modais e gráficos.
- **Modo demo isolado por visitante** — cada visitante recebe um workspace próprio (projetos/tarefas) que não interfere no de outras pessoas. Veja a seção [Modo demo](#-modo-demo-isolado-por-visitante).
- **Swagger** — documentação interativa da API.

---

## 🧱 Stack

| Camada    | Tecnologias                                                        |
| --------- | ----------------------------------------------------------------- |
| Backend   | NestJS, TypeScript, Prisma ORM, PostgreSQL, class-validator, Swagger |
| Frontend  | React, TypeScript, Vite, TailwindCSS, React Router, Axios, Recharts |
| Infra     | Docker, Docker Compose, Nginx (serve o build do frontend)         |

---

## 📂 Estrutura do projeto

```
.
├── docker-compose.yml          # Orquestra postgres + backend + frontend
├── .env.example                # Variáveis usadas pelo docker-compose
├── docs/
│   └── screenshots/            # Capturas de tela para o README
├── backend/
│   ├── Dockerfile
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos DemoSession, Project e Task + enums
│   │   └── seed.ts             # Sem seed global (dados são por sessão demo)
│   └── src/
│       ├── main.ts             # Bootstrap, CORS, ValidationPipe, Swagger
│       ├── app.module.ts
│       ├── common/
│       │   ├── decorators/     # @SessionId() (id da sessão demo)
│       │   ├── filters/        # Filtro global de exceções
│       │   └── guards/         # DemoSessionGuard (valida X-Demo-Session-Id)
│       ├── prisma/             # PrismaModule + PrismaService (global)
│       ├── demo/               # Sessões demo isoladas (criar/resetar/limpar)
│       ├── projects/           # CRUD de projetos (escopado por sessão)
│       ├── tasks/              # CRUD de tarefas + IA de prioridade
│       │   └── ai/priority-suggester.ts
│       └── dashboard/          # Métricas agregadas (escopadas por sessão)
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── api/                # Cliente Axios + serviços
        ├── components/         # Layout, Modal, TaskForm, etc.
        ├── pages/              # Dashboard, Projetos, Kanban, IA
        ├── lib/                # Helpers de formatação
        └── types/              # Tipos compartilhados
```

---

## 🚀 Rodando com Docker (recomendado)

Pré-requisitos: **Docker** e **Docker Compose**.

```bash
# 1. Clone o repositório e entre na pasta
cd Taskflow-AI

# 2. Crie o .env a partir do exemplo
cp .env.example .env

# 3. Suba tudo (postgres + backend + frontend)
docker compose up --build
```

O backend automaticamente aplica as **migrations** e sobe a API. Não há seed global: cada visitante recebe seu próprio workspace ao acessar o app (veja [Modo demo](#-modo-demo-isolado-por-visitante)).

| Serviço      | URL                              |
| ------------ | -------------------------------- |
| Frontend     | http://localhost:8080            |
| API (NestJS) | http://localhost:3000/api        |
| Swagger      | http://localhost:3000/docs       |
| PostgreSQL   | localhost:5432                   |

Para parar: `docker compose down` (use `docker compose down -v` para apagar também o volume do banco).

> **Variáveis** (`.env`): `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `BACKEND_PORT`, `FRONTEND_PORT`, `VITE_API_URL`. Veja `.env.example`.

---

## 🛠️ Rodando localmente (sem Docker)

### Pré-requisitos

- Node.js 20+
- Uma instância de PostgreSQL acessível

### Backend

```bash
cd backend
cp .env.example .env          # ajuste DATABASE_URL se necessário
npm install
npm run prisma:generate
npm run prisma:migrate        # cria as tabelas
npm run start:dev             # http://localhost:3000/api
```

### Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:3000
npm install
npm run dev                   # http://localhost:5173
```

---

## 🤖 Como funciona a "IA" de prioridade

A sugestão é uma **heurística determinística e explicável** (arquivo `backend/src/tasks/ai/priority-suggester.ts`). Ela combina três sinais em um score de 0 a 100:

1. **Palavras-chave** — termos de alta urgência (`crítico`, `bug`, `produção`, `segurança`…) aumentam o score; termos de baixa urgência (`documentar`, `futuro`, `backlog`…) reduzem.
2. **Prazo (deadline)** — quanto mais próximo (ou vencido) o prazo, maior a urgência atribuída.
3. **Contexto** — descrições mais detalhadas indicam maior escopo e aumentam a confiança.

Faixas finais:

| Score    | Prioridade |
| -------- | ---------- |
| ≥ 65     | **HIGH**   |
| 35 – 64  | **MEDIUM** |
| < 35     | **LOW**    |

A resposta inclui `score`, `confidence` e uma lista de `reasons`, deixando a decisão totalmente transparente.

**Exemplo:**

```bash
curl -X POST http://localhost:3000/api/tasks/suggest-priority \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Corrigir bug crítico de login em produção",
    "description": "Usuários não conseguem autenticar.",
    "deadline": "2026-06-25T23:59:00.000Z"
  }'
```

---

## 🧪 Modo demo isolado por visitante

Como o app é **público e sem login**, os dados são isolados por visitante para que ninguém altere o que outra pessoa está vendo. Funciona assim:

1. Ao abrir o app, o frontend procura um `demoSessionId` no `localStorage`.
2. Se não existir, chama `POST /api/demo/session`. O backend cria um **workspace demo** (`DemoSession`) com **UUID**, **`expiresAt`** e popula os dados iniciais: **2 projetos** com tarefas cobrindo todos os status (`TODO`/`DOING`/`DONE`) e prioridades (`LOW`/`MEDIUM`/`HIGH`).
3. O frontend salva o `demoSessionId` no `localStorage`.
4. Toda requisição de projetos, tarefas, dashboard e Kanban envia o header **`X-Demo-Session-Id`** (anexado automaticamente pelo Axios).
5. O backend valida o header via `DemoSessionGuard` e **filtra todas as queries** por `demoSessionId` — um visitante nunca acessa ou altera dados de outro.
6. O botão **"Resetar minha demo"** (`POST /api/demo/reset`) restaura os dados iniciais apenas da sessão atual.
7. Sessões expiradas são removidas automaticamente (limpeza periódica interna a cada 6h + `DELETE /api/demo/cleanup`), o que apaga em cascata seus projetos e tarefas.

### Configuração (backend `.env`)

| Variável                 | Padrão | Descrição                                                        |
| ------------------------ | ------ | ---------------------------------------------------------------- |
| `DEMO_SESSION_TTL_HOURS` | `24`   | Tempo de vida de cada sessão demo antes de expirar.             |
| `ADMIN_RESET_SECRET`     | —      | Se definido, exige o header `X-Admin-Secret` em `/demo/cleanup`. |

> **Compatibilidade**: tudo continua funcionando em Docker, PostgreSQL e no deploy Railway (backend) + Vercel (frontend). Em produção, garanta que o CORS permita o header `X-Demo-Session-Id` (já configurado em `main.ts`).

---

## 📡 Principais endpoints da API

Prefixo global: `/api`

| Método | Rota                          | Descrição                                  |
| ------ | ----------------------------- | ------------------------------------------ |
| GET    | `/projects`                   | Lista projetos (com contagem de tarefas)   |
| POST   | `/projects`                   | Cria projeto                               |
| GET    | `/projects/:id`               | Detalha projeto com tarefas                |
| PATCH  | `/projects/:id`               | Atualiza projeto                           |
| DELETE | `/projects/:id`               | Remove projeto (e suas tarefas)            |
| GET    | `/tasks`                      | Lista tarefas (filtros: projectId, status, priority) |
| POST   | `/tasks`                      | Cria tarefa                                |
| PATCH  | `/tasks/:id`                  | Atualiza tarefa                            |
| DELETE | `/tasks/:id`                  | Remove tarefa                              |
| POST   | `/tasks/suggest-priority`     | Sugere prioridade (IA local)               |
| GET    | `/dashboard/stats`            | Métricas agregadas (filtro: projectId)     |
| POST   | `/demo/session`               | Cria uma sessão demo isolada (+ dados iniciais) |
| GET    | `/demo/session`               | Metadados da sessão demo atual             |
| POST   | `/demo/reset`                 | Reseta os dados da sessão demo atual       |
| DELETE | `/demo/cleanup`               | Remove sessões demo expiradas              |
| GET    | `/health`                     | Health check                               |

> Exceto `/demo/session` (criação), `/tasks/suggest-priority` e `/health`, as rotas de **projetos, tarefas, dashboard** e demo exigem o header `X-Demo-Session-Id`. O frontend envia esse header automaticamente.

Documentação interativa completa em **`/docs`** (Swagger).

---

## 🧹 Qualidade e organização

- **NestJS modular**: módulos independentes para `projects`, `tasks` e `dashboard`.
- **DTOs validados** com `class-validator` + `ValidationPipe` global (whitelist + transform).
- **Tratamento global de erros** com formato de resposta padronizado e mapeamento de erros do Prisma.
- **Prisma schema** bem definido com enums, relações e índices.
- **Modo demo isolado** por sessão (`DemoSession`) com guard, escopo por `demoSessionId` e limpeza automática de sessões expiradas.
- **Swagger** configurado e tagueado por domínio.

---

