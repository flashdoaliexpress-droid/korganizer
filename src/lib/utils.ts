import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isToday,
  isSameMonth,
  isSameDay,
  addDays,
  subDays,
  parseISO,
  getDay,
  differenceInDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isToday,
  isSameMonth,
  isSameDay,
  addDays,
  subDays,
  parseISO,
  getDay,
  differenceInDays,
  ptBR,
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function getStreak(history: string[]): number {
  if (!history.length) return 0
  const sorted = [...history].sort((a, b) => b.localeCompare(a))
  let streak = 0
  let check = todayStr()
  for (const d of sorted) {
    if (d === check) {
      streak++
      const prev = new Date(check)
      prev.setDate(prev.getDate() - 1)
      check = prev.toISOString().split('T')[0]
    } else {
      break
    }
  }
  return streak
}

export function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    'momento-com-deus': 'Momento com Deus',
    'desenvolvimento': 'Desenvolvimento',
    'trabalho': 'Trabalho',
    'cuidados-pessoais': 'Cuidados Pessoais',
  }
  return map[cat] || cat
}

export function getCategoryColor(cat: string): string {
  const map: Record<string, string> = {
    'momento-com-deus': '#111111',
    'desenvolvimento': '#10B981',
    'trabalho': '#6B7280',
    'cuidados-pessoais': '#F59E0B',
  }
  return map[cat] || '#6B7280'
}

export function getEventTypeColor(type: string): string {
  const map: Record<string, string> = {
    'habit': '#111111',
    'training': '#10B981',
    'personal': '#8B5CF6',
    'work': '#F59E0B',
  }
  return map[type] || '#6B7280'
}
