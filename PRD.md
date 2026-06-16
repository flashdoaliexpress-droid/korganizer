# PRD — Korganizer
**Product Requirements Document**
Versão 1.0 · Junho 2026

---

## 1. Visão Geral

**Korganizer** é uma aplicação web de produtividade pessoal all-in-one, construída em Next.js 14, que centraliza o acompanhamento de hábitos, agenda, treinos físicos e metas mensais em uma única interface. Toda a persistência ocorre no navegador via `localStorage` (Zustand persist), sem backend ou autenticação — projetada para uso individual off-line.

---

## 2. Problema

Ferramentas de produtividade existentes são fragmentadas: um app para hábitos, outro para calendário, outro para anotações de treino. Isso gera atrito para quem precisa de uma visão unificada do dia — saber ao mesmo tempo quais hábitos foram feitos, o que está na agenda e quais metas mensais estão em andamento.

---

## 3. Público-Alvo

Usuário único (uso pessoal do desenvolvedor — Kauã). Perfil: jovem com rotina estruturada que inclui fé, desenvolvimento físico e intelectual, trabalho comercial e cuidados pessoais.

---

## 4. Objetivos do Produto

| # | Objetivo |
|---|----------|
| 1 | Visualizar o estado do dia em uma tela só (Dashboard) |
| 2 | Marcar hábitos diários e acompanhar sequências (streaks) |
| 3 | Agendar e gerenciar eventos com visão mensal, semanal e diária |
| 4 | Registrar e buscar logs de treino por data |
| 5 | Definir e rastrear metas mensais por categoria de vida |

---

## 5. Funcionalidades Existentes

### 5.1 Dashboard

- **Saudação contextual** por horário do dia (Bom dia / Boa tarde / Boa noite) com data formatada em PT-BR.
- **Bento Grid** com 4 cards:
  - **Overview de Hoje** — progresso total de hábitos (barra + %).
  - **Próximos Eventos** — próximos 3 eventos a partir de hoje, com tipo, horário e cor.
  - **Streaks por Categoria** — streak e progresso diário dos 4 grupos de hábitos.
  - **Último Treino** — preview do log de treino mais recente.
- Atalhos para navegar diretamente ao módulo correspondente.

### 5.2 Calendar

**Três views:**
- **Mês** — grade mensal clicável; cada célula exibe até 3 pílulas de evento + contador de excesso. Painel lateral com tabs: Eventos / Hábitos / Notas.
- **Semana** — grade de 7 colunas com timeline 24h, resolução de sobreposição de eventos por colunas.
- **Dia** — timeline 24h com scroll automático ao horário atual; indicador de hora atual com linha vermelha.

**Eventos:**
- Campos: título, data, horário início/fim, cor (8 swatches predefinidos + picker livre), tipo (habit / training / personal / work), descrição.
- CRUD completo (criar, editar, excluir via modal).
- **Copiar / Colar evento** entre dias (estado temporário em memória).

**Painel lateral (view Mês):**
- Tab **Eventos**: lista e ações (editar, copiar, excluir).
- Tab **Hábitos**: lista hábitos com botão para agendar como evento no dia selecionado.
- Tab **Notas**: textarea com auto-save (debounce 800 ms); indicador visual (ponto âmbar) nos dias com nota.

### 5.3 Habits

**View "Hoje":**
- Navegação por data (← / →), limitada até hoje.
- Tabs de categoria: Todos / Momento com Deus / Desenvolvimento / Trabalho / Cuidados Pessoais.
- Cada hábito exibe: checkbox de conclusão, nome, mini-calendário dos últimos 7 dias, streak individual (badge com chama).
- Adicionar hábito via modal (nome + categoria).
- Deletar hábito (ícone de lixeira ao hover).

**View "Histórico":**
- Calendário mensal com cor por % de conclusão diária (vermelho < 30%, amarelo < 60%, verde claro < 100%, verde sólido = 100%).
- Clique no dia abre painel de detalhe com todos os hábitos toggle-áveis retroativamente.

**Hábitos padrão pré-carregados:**

| Categoria | Hábitos |
|-----------|---------|
| Momento com Deus | Estudar Bíblia, Orar 10 minutos |
| Desenvolvimento | Treino, Cardio, Dieta, Leitura |
| Trabalho | Prospecção diária, Fechamento 1 projeto |
| Cuidados Pessoais | Skincare, Mewing, Treino maxilar/chiclete, Dormir rosto pra cima |

**Card de progresso** sempre visível: barra geral + mini-stats por categoria (ícone + razão feitos/total + barra).

### 5.4 Training

- **Sidebar** com lista de logs ordenada por data desc., busca por conteúdo ou data, botão "Novo Log (Hoje)".
- **Editor** principal: `<textarea>` em modo monospace para registro livre de séries/cargas.
- Auto-save com debounce 800 ms; botão "Salvar" manual.
- Ações: Copiar para clipboard, Exportar como `.txt` (download), Deletar log.
- **Status bar**: contagem de linhas não-vazias e caracteres.
- Um log por data; edição reabre o log existente ao selecionar a data.

### 5.5 Metas

- Metas mensais organizadas por 5 categorias: Fé, Saúde, Trabalho, Desenvolvimento, Pessoal.
- Navegação por mês (← / →).
- **Card de progresso**: % concluído do mês + mini-stats clicáveis por categoria (funcionam como filtro).
- Tabs de filtro por categoria.
- Goals listadas em cards por categoria com título, descrição opcional, checkbox toggle e botão de deletar.
- Modal de criação: título, descrição, categoria.

### 5.6 Sidebar / Navegação

- Sidebar fixa com logo "K", 5 itens de navegação com ícones (Dashboard, Calendar, Habits, Training, Metas).
- **Colapsável** — reduz a `w-16` exibindo apenas ícones.
- Toggle Dark / Light mode (ícone Sol/Lua) persistido no estado global.
- Item ativo destacado com fundo branco + texto preto.

---

## 6. Arquitetura Técnica

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + TypeScript |
| Estilo | Tailwind CSS 3.4 |
| Estado / Persistência | Zustand 4.5 + middleware `persist` → `localStorage` (`korganizer-storage`) |
| Datas | date-fns 3.6 (locale pt-BR) |
| Ícones | Lucide React 0.378 |

### Estrutura de Dados (store global)

```
AppState
├── activeSection: Section        // rota ativa
├── darkMode: boolean
├── events: CalendarEvent[]       // id, title, date, startTime, endTime, type, color, description
├── habits: Habit[]               // id, name, category, history: string[], createdAt
├── trainingLogs: TrainingLog[]   // id, date, content, updatedAt
├── dayNotes: DayNote[]           // id, date, content, updatedAt
└── goals: MonthlyGoal[]          // id, title, description, month(YYYY-MM), category, completed, createdAt
```

### Estrutura de Arquivos

```
src/
├── app/
│   ├── layout.tsx          — root layout, globals.css
│   └── page.tsx            — entry point, renderiza seção ativa
├── components/
│   ├── Sidebar.tsx
│   ├── dashboard/DashboardPage.tsx
│   ├── calendar/CalendarPage.tsx
│   ├── habits/HabitsPage.tsx
│   ├── training/TrainingPage.tsx
│   └── metas/MetasPage.tsx
├── store/
│   └── store.ts            — Zustand store único
└── lib/
    └── utils.ts            — helpers: todayStr, getStreak, getCategoryLabel/Color, format
```

---

## 7. Requisitos Não-Funcionais

| Requisito | Especificação |
|-----------|--------------|
| Persistência | 100% client-side via `localStorage`; sem dependência de rede |
| Performance | Transições de UI ≤ 16 ms (60 fps); debounce de auto-save em 800 ms |
| Acessibilidade | Dark mode toggleável; sidebar colapsável para telas menores |
| Internacionalização | Interface mista (PT-BR predominante, alguns labels em EN) |
| Responsividade | Layout desktop-first; sidebar responsiva via colapso |
| Sem autenticação | Aplicação single-user, sem login |

---

## 8. Gaps e Oportunidades de Melhoria

### Gaps Funcionais

| ID | Gap | Impacto |
|----|-----|---------|
| G1 | **Nome hardcoded** ("Welcome, Kauã") no Dashboard — sem tela de perfil | Baixo |
| G2 | **Sem recorrência** de eventos no calendário | Médio |
| G3 | **Sem notificações / lembretes** — app é 100% passivo | Alto |
| G4 | **Tipo de evento** não é editável via modal (sempre salva como `personal`) | Médio |
| G5 | **Sem exportação geral** — só o Training exporta; hábitos e metas não têm backup | Alto |
| G6 | **Sem importação de dados** — migrar entre dispositivos exige exportar o `localStorage` manualmente | Alto |
| G7 | **Hábitos sem frequência configurável** (diário é o único modo) | Médio |
| G8 | **Sem estatísticas agregadas** de treino (volume, frequência mensal) | Médio |
| G9 | **Interface em inglês/português misto** (ex: "Dashboard", "Habits", "Training" na sidebar) | Baixo |

### Melhorias Técnicas

| ID | Melhoria |
|----|---------|
| T1 | Migrar para **banco local** (IndexedDB via Dexie) para suportar volume maior de dados sem degradar `localStorage` |
| T2 | Adicionar **PWA** (manifest + service worker) para uso off-line instalável |
| T3 | Implementar **sincronização** opcional com backend (ex: Supabase) para multi-dispositivo |
| T4 | Adicionar **testes unitários** nas funções de `utils.ts` e `store.ts` |
| T5 | Separar componentes grandes (`CalendarPage` tem 812 linhas) em sub-componentes |

---

## 9. Fluxos Principais

### Marcar hábito do dia
`Habits → View "Hoje" → Categoria → Checkbox → toggleHabit(id, date) → persiste no history[]`

### Adicionar evento no calendário
`Calendar → "+ Evento" ou clique em célula → Modal → Preencher → Submit → addEvent() → localStorage`

### Registrar treino
`Training → Selecionar data (ou "Novo Log") → Digitar no editor → Auto-save após 800 ms → saveTrainingLog(date, content)`

### Definir meta mensal
`Metas → Navegar para o mês → "+ Adicionar meta" → Modal (título + categoria) → addGoal() → exibida no grid`

---

## 10. Design System

- **Paleta**: preto/branco como cores primárias de interação; cores de categoria como acentos.
- **Componente card**: `glass-card` (definido em `globals.css`) com fundo semitransparente e `backdrop-blur`.
- **Bordas**: `rounded-xl` (12px) e `rounded-2xl` (16px) consistentes.
- **Tipografia**: sistema (sans-serif nativo do Tailwind); monospace no editor de treino.
- **Imagens decorativas**: JPEGs por seção posicionados `absolute top-0 right-0` com opacidade reduzida.
- **Animação**: classe `animate-fade-in` aplicada nos containers principais.
- **Estados de hover**: escalonamento sutil (`hover:scale-105`) em botões de ação.
