'use client'
import React, { useState } from 'react'
import { useAppStore, HabitCategory, Habit } from '@/store/store'
import { Plus, Trash2, Flame, Check, X, LayoutGrid, BookOpen, TrendingUp, Briefcase, Sparkles } from 'lucide-react'
import { todayStr, getCategoryLabel, getCategoryColor, getStreak } from '@/lib/utils'
import { format, subDays } from 'date-fns'

type TabCategory = HabitCategory | 'todos'

const CATEGORIES: HabitCategory[] = [
  'momento-com-deus',
  'desenvolvimento',
  'trabalho',
  'cuidados-pessoais',
]

const CATEGORY_ICONS: Record<TabCategory, React.ElementType> = {
  'todos': LayoutGrid,
  'momento-com-deus': BookOpen,
  'desenvolvimento': TrendingUp,
  'trabalho': Briefcase,
  'cuidados-pessoais': Sparkles,
}

function CatIcon({ cat, size = 15 }: { cat: TabCategory; size?: number }) {
  const Icon = CATEGORY_ICONS[cat]
  return <Icon size={size} />
}

function MiniCalendar({ history }: { history: string[] }) {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i)
    const dateStr = format(d, 'yyyy-MM-dd')
    return { dateStr, label: format(d, 'EEEEE'), done: history.includes(dateStr) }
  })
  return (
    <div className="flex gap-1">
      {days.map(({ dateStr, label, done }) => (
        <div key={dateStr} className="flex flex-col items-center gap-0.5">
          <span className="text-xs text-slate-400 leading-none">{label}</span>
          <div
            className={`w-5 h-5 rounded-full ${
              done ? 'bg-green-500' : 'bg-gray-100 dark:bg-slate-700'
            }`}
          />
        </div>
      ))}
    </div>
  )
}

function HabitItem({ habit, showCategory = false }: { habit: Habit; showCategory?: boolean }) {
  const { toggleHabit, deleteHabit } = useAppStore()
  const today = todayStr()
  const isDone = habit.history.includes(today)
  const streak = getStreak(habit.history)

  return (
    <div
      className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 border ${
        isDone
          ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
          : 'bg-white dark:bg-slate-800/50 border-gray-100 dark:border-slate-700'
      }`}
    >
      <button
        onClick={() => toggleHabit(habit.id, today)}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          isDone
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 dark:border-slate-600 hover:border-black'
        }`}
      >
        {isDone && <Check size={12} strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium ${
              isDone
                ? 'text-green-700 dark:text-green-400 line-through'
                : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            {habit.name}
          </span>
          {showCategory && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              <CatIcon cat={habit.category} size={12} /> {getCategoryLabel(habit.category)}
            </span>
          )}
        </div>
        <div className="mt-1.5 hidden sm:block">
          <MiniCalendar history={habit.history} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {streak > 0 && (
          <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg">
            <Flame size={13} className="text-orange-500" />
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{streak}</span>
          </div>
        )}
        <button
          onClick={() => deleteHabit(habit.id)}
          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all duration-200"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

export default function HabitsPage() {
  const { habits, addHabit } = useAppStore()
  const [activeCategory, setActiveCategory] = useState<TabCategory>('todos')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitCat, setNewHabitCat] = useState<HabitCategory>('momento-com-deus')

  const today = todayStr()
  const totalHabits = habits.length
  const completedToday = habits.filter(h => h.history.includes(today)).length
  const pct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

  const activeHabits = activeCategory === 'todos'
    ? [...habits].sort((a, b) => a.category.localeCompare(b.category))
    : habits.filter(h => h.category === activeCategory)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitName.trim()) return
    addHabit({ name: newHabitName.trim(), category: newHabitCat })
    setNewHabitName('')
    setShowAddModal(false)
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Decorative */}
      <div
        className="absolute top-0 right-0 w-[540px] h-[540px] opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'url(/detalhe-habits.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Habits</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Tracking seus hábitos diários
          </p>
        </div>

        {/* Progress Overview */}
        <div className="glass-card rounded-2xl p-6 mb-6 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-slate-700 dark:text-slate-200">Progresso de Hoje</h2>
              <p className="text-slate-400 text-sm">
                {completedToday} de {totalHabits} hábitos
              </p>
            </div>
            <span className="text-3xl font-bold text-black dark:text-white">{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-black to-gray-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {CATEGORIES.map(cat => {
              const catHabits = habits.filter(h => h.category === cat)
              const done = catHabits.filter(h => h.history.includes(today)).length
              return (
                <div key={cat} className="text-center">
                  <CatIcon cat={cat} size={18} />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {done}/{catHabits.length}
                  </p>
                  <div className="mt-1 w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1">
                    <div
                      className="h-1 rounded-full transition-all duration-500"
                      style={{
                        width: catHabits.length > 0 ? `${(done / catHabits.length) * 100}%` : '0%',
                        backgroundColor: getCategoryColor(cat),
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
          {(['todos', ...CATEGORIES] as TabCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                activeCategory === cat
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700'
              }`}
            >
              <CatIcon cat={cat} />
              {cat === 'todos' ? 'Todos' : getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Habits List */}
        <div className="space-y-2 animate-fade-in">
          {activeHabits.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-400">
              <p className="text-sm mb-3">Nenhum hábito nesta categoria</p>
              <button
                onClick={() => {
                  setNewHabitCat(activeCategory === 'todos' ? 'momento-com-deus' : activeCategory)
                  setShowAddModal(true)
                }}
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                + Adicionar hábito
              </button>
            </div>
          ) : (
            activeHabits.map(habit => <HabitItem key={habit.id} habit={habit} showCategory={activeCategory === 'todos'} />)
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={() => {
            setNewHabitCat(activeCategory === 'todos' ? 'momento-com-deus' : activeCategory)
            setShowAddModal(true)
          }}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-slate-400 hover:border-black hover:text-black dark:hover:border-gray-400 dark:hover:text-gray-300 transition-all duration-200 text-sm font-medium"
        >
          <Plus size={16} /> {activeCategory === 'todos' ? 'Adicionar hábito' : `Adicionar hábito em ${getCategoryLabel(activeCategory)}`}
        </button>
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Novo Hábito</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Nome do hábito *
                </label>
                <input
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  placeholder="Ex: Meditar 10 minutos"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">
                  Categoria
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewHabitCat(cat)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                        newHabitCat === cat
                          ? 'bg-black text-white'
                          : 'bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <CatIcon cat={cat} />
                      {getCategoryLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
