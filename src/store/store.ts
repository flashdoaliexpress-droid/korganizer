import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Section = 'dashboard' | 'calendar' | 'habits' | 'training'
export type HabitCategory = 'momento-com-deus' | 'desenvolvimento' | 'trabalho' | 'cuidados-pessoais'
export type EventType = 'habit' | 'training' | 'personal' | 'work'

export interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  type: EventType
  color: string
  description?: string
}

export interface Habit {
  id: string
  name: string
  category: HabitCategory
  history: string[] // YYYY-MM-DD dates when checked
  createdAt: string
}

export interface TrainingLog {
  id: string
  date: string // YYYY-MM-DD
  content: string
  updatedAt: string
}

interface AppState {
  activeSection: Section
  darkMode: boolean
  events: CalendarEvent[]
  habits: Habit[]
  trainingLogs: TrainingLog[]

  setActiveSection: (s: Section) => void
  toggleDarkMode: () => void

  // Calendar
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void
  updateEvent: (id: string, e: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void

  // Habits
  addHabit: (h: Omit<Habit, 'id' | 'history' | 'createdAt'>) => void
  deleteHabit: (id: string) => void
  toggleHabit: (id: string, date: string) => void

  // Training
  saveTrainingLog: (date: string, content: string) => void
  deleteTrainingLog: (id: string) => void
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

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeSection: 'dashboard',
      darkMode: false,
      events: [],
      habits: DEFAULT_HABITS,
      trainingLogs: [],

      setActiveSection: (s) => set({ activeSection: s }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      addEvent: (e) => set((state) => ({
        events: [...state.events, { ...e, id: crypto.randomUUID() }]
      })),
      updateEvent: (id, e) => set((state) => ({
        events: state.events.map(ev => ev.id === id ? { ...ev, ...e } : ev)
      })),
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(ev => ev.id !== id)
      })),

      addHabit: (h) => set((state) => ({
        habits: [...state.habits, { ...h, id: crypto.randomUUID(), history: [], createdAt: new Date().toISOString().split('T')[0] }]
      })),
      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter(h => h.id !== id)
      })),
      toggleHabit: (id, date) => set((state) => ({
        habits: state.habits.map(h => {
          if (h.id !== id) return h
          const already = h.history.includes(date)
          return { ...h, history: already ? h.history.filter(d => d !== date) : [...h.history, date] }
        })
      })),

      saveTrainingLog: (date, content) => set((state) => {
        const existing = state.trainingLogs.find(l => l.date === date)
        if (existing) {
          return {
            trainingLogs: state.trainingLogs.map(l =>
              l.date === date ? { ...l, content, updatedAt: new Date().toISOString() } : l
            )
          }
        }
        return {
          trainingLogs: [...state.trainingLogs, {
            id: crypto.randomUUID(),
            date,
            content,
            updatedAt: new Date().toISOString()
          }]
        }
      }),
      deleteTrainingLog: (id) => set((state) => ({
        trainingLogs: state.trainingLogs.filter(l => l.id !== id)
      })),
    }),
    { name: 'korganizer-storage' }
  )
)
