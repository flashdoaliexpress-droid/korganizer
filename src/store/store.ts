import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type Section = 'dashboard' | 'calendar' | 'habits' | 'training' | 'metas'
export type HabitCategory = 'momento-com-deus' | 'desenvolvimento' | 'trabalho' | 'cuidados-pessoais'
export type EventType = 'habit' | 'training' | 'personal' | 'work'
export type GoalCategory = 'fe' | 'saude' | 'trabalho' | 'desenvolvimento' | 'pessoal'

export interface MonthlyGoal {
  id: string
  title: string
  description?: string
  month: string
  category: GoalCategory
  completed: boolean
  createdAt: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  type: EventType
  color: string
  description?: string
}

export interface Habit {
  id: string
  name: string
  category: HabitCategory
  history: string[]
  createdAt: string
}

export interface TrainingLog {
  id: string
  date: string
  content: string
  updatedAt: string
}

export interface DayNote {
  id: string
  date: string
  content: string
  updatedAt: string
}

interface AppState {
  activeSection: Section
  darkMode: boolean
  userId: string | null
  dataLoaded: boolean
  events: CalendarEvent[]
  habits: Habit[]
  trainingLogs: TrainingLog[]
  dayNotes: DayNote[]
  goals: MonthlyGoal[]

  setActiveSection: (s: Section) => void
  toggleDarkMode: () => void
  setUserId: (id: string | null) => void
  loadUserData: (userId: string) => Promise<void>

  addEvent: (e: Omit<CalendarEvent, 'id'>) => void
  updateEvent: (id: string, e: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void

  addHabit: (h: Omit<Habit, 'id' | 'history' | 'createdAt'>) => void
  deleteHabit: (id: string) => void
  toggleHabit: (id: string, date: string) => void

  saveTrainingLog: (date: string, content: string) => void
  deleteTrainingLog: (id: string) => void

  saveDayNote: (date: string, content: string) => void
  deleteDayNote: (date: string) => void

  addGoal: (g: Omit<MonthlyGoal, 'id' | 'createdAt' | 'completed'>) => void
  deleteGoal: (id: string) => void
  toggleGoal: (id: string) => void
}

const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', name: 'Estudar Bíblia', category: 'momento-com-deus', history: [], createdAt: '2026-03-01' },
  { id: 'h2', name: 'Orar 10 minutos', category: 'momento-com-deus', history: [], createdAt: '2026-03-01' },
  { id: 'h3', name: 'Treino', category: 'desenvolvimento', history: [], createdAt: '2026-03-01' },
  { id: 'h4', name: 'Cardio', category: 'desenvolvimento', history: [], createdAt: '2026-03-01' },
  { id: 'h5', name: 'Dieta', category: 'desenvolvimento', history: [], createdAt: '2026-03-01' },
  { id: 'h6', name: 'Leitura', category: 'desenvolvimento', history: [], createdAt: '2026-03-01' },
  { id: 'h7', name: 'Prospecção diária', category: 'trabalho', history: [], createdAt: '2026-03-01' },
  { id: 'h8', name: 'Fechamento 1 projeto', category: 'trabalho', history: [], createdAt: '2026-03-01' },
  { id: 'h9', name: 'Skincare', category: 'cuidados-pessoais', history: [], createdAt: '2026-03-01' },
  { id: 'h10', name: 'Mewing', category: 'cuidados-pessoais', history: [], createdAt: '2026-03-01' },
  { id: 'h11', name: 'Treino maxilar/chiclete', category: 'cuidados-pessoais', history: [], createdAt: '2026-03-01' },
  { id: 'h12', name: 'Dormir rosto pra cima', category: 'cuidados-pessoais', history: [], createdAt: '2026-03-01' },
]

function sb(): SupabaseClient | null { return supabase }

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeSection: 'dashboard',
      darkMode: false,
      userId: null,
      dataLoaded: false,
      events: [],
      habits: DEFAULT_HABITS,
      trainingLogs: [],
      dayNotes: [],
      goals: [],

      setActiveSection: (s) => set({ activeSection: s }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      setUserId: (id) => {
        if (id === null) {
          set({ userId: null, dataLoaded: false })
        } else {
          set({ userId: id })
        }
      },

      loadUserData: async (userId: string) => {
        const client = sb()
        if (!client) return
        set({ userId, dataLoaded: false })

        const [habitsRes, eventsRes, logsRes, notesRes, goalsRes] = await Promise.all([
          client.from('habits').select('*').eq('user_id', userId),
          client.from('calendar_events').select('*').eq('user_id', userId),
          client.from('training_logs').select('*').eq('user_id', userId),
          client.from('day_notes').select('*').eq('user_id', userId),
          client.from('goals').select('*').eq('user_id', userId),
        ])

        const events: CalendarEvent[] = (eventsRes.data ?? []).map((e: Record<string, string>) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          startTime: e.start_time,
          endTime: e.end_time,
          type: e.type as EventType,
          color: e.color,
          description: e.description ?? undefined,
        }))

        const trainingLogs: TrainingLog[] = (logsRes.data ?? []).map((l: Record<string, string>) => ({
          id: l.id,
          date: l.date,
          content: l.content,
          updatedAt: l.updated_at,
        }))

        const dayNotes: DayNote[] = (notesRes.data ?? []).map((n: Record<string, string>) => ({
          id: n.id,
          date: n.date,
          content: n.content,
          updatedAt: n.updated_at,
        }))

        const goals: MonthlyGoal[] = (goalsRes.data ?? []).map((g: Record<string, unknown>) => ({
          id: g.id as string,
          title: g.title as string,
          description: (g.description as string | null) ?? undefined,
          month: g.month as string,
          category: g.category as GoalCategory,
          completed: g.completed as boolean,
          createdAt: g.created_at as string,
        }))

        const dbHabits = (habitsRes.data ?? []) as Record<string, unknown>[]
        let habits: Habit[]

        if (dbHabits.length === 0) {
          // Primeiro acesso — propagar hábitos padrão para o Supabase
          habits = DEFAULT_HABITS
          void client.from('habits').insert(
            DEFAULT_HABITS.map(h => ({
              id: h.id,
              user_id: userId,
              name: h.name,
              category: h.category,
              history: h.history,
              created_at: h.createdAt,
            }))
          ).then(null, console.error)
        } else {
          habits = dbHabits.map(h => ({
            id: h.id as string,
            name: h.name as string,
            category: h.category as HabitCategory,
            history: (h.history as string[]) ?? [],
            createdAt: h.created_at as string,
          }))
        }

        set({ userId, habits, events, trainingLogs, dayNotes, goals, dataLoaded: true })
      },

      // ── Calendar Events ───────────────────────────────────────────────────
      addEvent: (e) => {
        const id = crypto.randomUUID()
        const newEvent = { ...e, id }
        set((state) => ({ events: [...state.events, newEvent] }))
        const { userId } = get()
        const client = sb()
        if (userId && client) {
          void client.from('calendar_events').insert({
            id,
            user_id: userId,
            title: newEvent.title,
            date: newEvent.date,
            start_time: newEvent.startTime,
            end_time: newEvent.endTime,
            type: newEvent.type,
            color: newEvent.color,
            description: newEvent.description ?? null,
          }).then(null, console.error)
        }
      },

      updateEvent: (id, e) => {
        set((state) => ({
          events: state.events.map(ev => ev.id === id ? { ...ev, ...e } : ev),
        }))
        const { userId } = get()
        const client = sb()
        if (userId && client) {
          const upd: Record<string, unknown> = {}
          if (e.title !== undefined) upd.title = e.title
          if (e.date !== undefined) upd.date = e.date
          if (e.startTime !== undefined) upd.start_time = e.startTime
          if (e.endTime !== undefined) upd.end_time = e.endTime
          if (e.type !== undefined) upd.type = e.type
          if (e.color !== undefined) upd.color = e.color
          if (e.description !== undefined) upd.description = e.description
          void client.from('calendar_events').update(upd).eq('id', id).then(null, console.error)
        }
      },

      deleteEvent: (id) => {
        set((state) => ({ events: state.events.filter(ev => ev.id !== id) }))
        const { userId } = get()
        const client = sb()
        if (userId && client) {
          void client.from('calendar_events').delete().eq('id', id).then(null, console.error)
        }
      },

      // ── Habits ───────────────────────────────────────────────────────────
      addHabit: (h) => {
        const id = crypto.randomUUID()
        const today = new Date().toISOString().split('T')[0]
        const newHabit: Habit = { ...h, id, history: [], createdAt: today }
        set((state) => ({ habits: [...state.habits, newHabit] }))
        const { userId } = get()
        const client = sb()
        if (userId && client) {
          void client.from('habits').insert({
            id,
            user_id: userId,
            name: newHabit.name,
            category: newHabit.category,
            history: [],
            created_at: newHabit.createdAt,
          }).then(null, console.error)
        }
      },

      deleteHabit: (id) => {
        set((state) => ({ habits: state.habits.filter(h => h.id !== id) }))
        const { userId } = get()
        const client = sb()
        if (userId && client) {
          void client.from('habits').delete().eq('id', id).then(null, console.error)
        }
      },

      toggleHabit: (id, date) => {
        set((state) => ({
          habits: state.habits.map(h => {
            if (h.id !== id) return h
            const already = h.history.includes(date)
            return { ...h, history: already ? h.history.filter(d => d !== date) : [...h.history, date] }
          }),
        }))
        const { userId, habits } = get()
        const client = sb()
        if (userId && client) {
          const habit = habits.find(h => h.id === id)
          if (habit) {
            void client.from('habits').update({ history: habit.history }).eq('id', id).then(null, console.error)
          }
        }
      },

      // ── Training Logs ────────────────────────────────────────────────────
      saveTrainingLog: (date, content) => {
        set((state) => {
          const existing = state.trainingLogs.find(l => l.date === date)
          const now = new Date().toISOString()
          if (existing) {
            return {
              trainingLogs: state.trainingLogs.map(l =>
                l.date === date ? { ...l, content, updatedAt: now } : l
              ),
            }
          }
          return {
            trainingLogs: [...state.trainingLogs, { id: crypto.randomUUID(), date, content, updatedAt: now }],
          }
        })
        const { userId, trainingLogs } = get()
        const client = sb()
        if (userId && client) {
          const log = trainingLogs.find(l => l.date === date)
          if (log) {
            void client.from('training_logs').upsert({
              id: log.id,
              user_id: userId,
              date: log.date,
              content: log.content,
              updated_at: log.updatedAt,
            }).then(null, console.error)
          }
        }
      },

      deleteTrainingLog: (id) => {
        set((state) => ({ trainingLogs: state.trainingLogs.filter(l => l.id !== id) }))
        const { userId } = get()
        const client = sb()
        if (userId && client) {
          void client.from('training_logs').delete().eq('id', id).then(null, console.error)
        }
      },

      // ── Day Notes ────────────────────────────────────────────────────────
      saveDayNote: (date, content) => {
        const noteToDelete = !content.trim() ? get().dayNotes.find(n => n.date === date) : null
        set((state) => {
          const existing = state.dayNotes.find(n => n.date === date)
          const now = new Date().toISOString()
          if (!content.trim()) {
            return { dayNotes: state.dayNotes.filter(n => n.date !== date) }
          }
          if (existing) {
            return {
              dayNotes: state.dayNotes.map(n =>
                n.date === date ? { ...n, content, updatedAt: now } : n
              ),
            }
          }
          return {
            dayNotes: [...state.dayNotes, { id: crypto.randomUUID(), date, content, updatedAt: now }],
          }
        })
        const { userId, dayNotes } = get()
        const client = sb()
        if (userId && client) {
          if (!content.trim()) {
            if (noteToDelete) void client.from('day_notes').delete().eq('id', noteToDelete.id).then(null, console.error)
          } else {
            const note = dayNotes.find(n => n.date === date)
            if (note) {
              void client.from('day_notes').upsert({
                id: note.id,
                user_id: userId,
                date: note.date,
                content: note.content,
                updated_at: note.updatedAt,
              }).then(null, console.error)
            }
          }
        }
      },

      deleteDayNote: (date) => {
        const noteToDelete = get().dayNotes.find(n => n.date === date)
        set((state) => ({ dayNotes: state.dayNotes.filter(n => n.date !== date) }))
        const { userId } = get()
        const client = sb()
        if (userId && client && noteToDelete) {
          void client.from('day_notes').delete().eq('id', noteToDelete.id).then(null, console.error)
        }
      },

      // ── Goals ────────────────────────────────────────────────────────────
      addGoal: (g) => {
        const id = crypto.randomUUID()
        const today = new Date().toISOString().split('T')[0]
        const newGoal: MonthlyGoal = { ...g, id, completed: false, createdAt: today }
        set((state) => ({ goals: [...state.goals, newGoal] }))
        const { userId } = get()
        const client = sb()
        if (userId && client) {
          void client.from('goals').insert({
            id,
            user_id: userId,
            title: newGoal.title,
            description: newGoal.description ?? null,
            month: newGoal.month,
            category: newGoal.category,
            completed: false,
            created_at: newGoal.createdAt,
          }).then(null, console.error)
        }
      },

      deleteGoal: (id) => {
        set((state) => ({ goals: state.goals.filter(g => g.id !== id) }))
        const { userId } = get()
        const client = sb()
        if (userId && client) {
          void client.from('goals').delete().eq('id', id).then(null, console.error)
        }
      },

      toggleGoal: (id) => {
        set((state) => ({
          goals: state.goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g),
        }))
        const { userId, goals } = get()
        const client = sb()
        if (userId && client) {
          const goal = goals.find(g => g.id === id)
          if (goal) {
            void client.from('goals').update({ completed: goal.completed }).eq('id', id).then(null, console.error)
          }
        }
      },
    }),
    {
      name: 'korganizer-storage',
      partialize: (state) => ({
        activeSection: state.activeSection,
        darkMode: state.darkMode,
        events: state.events,
        habits: state.habits,
        trainingLogs: state.trainingLogs,
        dayNotes: state.dayNotes,
        goals: state.goals,
      }),
    }
  )
)
