'use client'
import React, { useState } from 'react'
import { useAppStore, GoalCategory, MonthlyGoal } from '@/store/store'
import {
  Plus, Trash2, Check, X, ChevronLeft, ChevronRight,
  Target, Heart, Dumbbell, Briefcase, TrendingUp, User,
} from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const GOAL_CATEGORIES: GoalCategory[] = ['fe', 'saude', 'trabalho', 'desenvolvimento', 'pessoal']

const CATEGORY_META: Record<GoalCategory, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  fe:            { label: 'Fé',            icon: Heart,      color: '#A855F7', bg: 'bg-purple-50 dark:bg-purple-900/10' },
  saude:         { label: 'Saúde',         icon: Dumbbell,   color: '#10B981', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
  trabalho:      { label: 'Trabalho',      icon: Briefcase,  color: '#3B82F6', bg: 'bg-blue-50 dark:bg-blue-900/10' },
  desenvolvimento: { label: 'Desenvolvimento', icon: TrendingUp, color: '#F59E0B', bg: 'bg-amber-50 dark:bg-amber-900/10' },
  pessoal:       { label: 'Pessoal',       icon: User,       color: '#EC4899', bg: 'bg-pink-50 dark:bg-pink-900/10' },
}

function GoalItem({ goal }: { goal: MonthlyGoal }) {
  const { toggleGoal, deleteGoal } = useAppStore()
  const meta = CATEGORY_META[goal.category]

  return (
    <div
      className={`group flex items-start gap-3 p-3.5 rounded-xl transition-all duration-200 border ${
        goal.completed
          ? 'bg-gray-50 dark:bg-slate-800/30 border-gray-100 dark:border-slate-700/50 opacity-60'
          : 'bg-white dark:bg-slate-800/50 border-gray-100 dark:border-slate-700'
      }`}
    >
      <button
        onClick={() => toggleGoal(goal.id)}
        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          goal.completed
            ? 'text-white border-transparent'
            : 'border-gray-300 dark:border-slate-600 hover:border-gray-500'
        }`}
        style={goal.completed ? { backgroundColor: meta.color, borderColor: meta.color } : {}}
      >
        {goal.completed && <Check size={11} strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${
          goal.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'
        }`}>
          {goal.title}
        </p>
        {goal.description && (
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">{goal.description}</p>
        )}
      </div>

      <button
        onClick={() => deleteGoal(goal.id)}
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all duration-200 flex-shrink-0 mt-0.5"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

export default function MetasPage() {
  const { goals, addGoal } = useAppStore()
  const [viewDate, setViewDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCat, setNewCat] = useState<GoalCategory>('pessoal')
  const [filterCat, setFilterCat] = useState<GoalCategory | 'todas'>('todas')

  const monthKey = format(viewDate, 'yyyy-MM')
  const monthGoals = goals.filter(g => g.month === monthKey)
  const filtered = filterCat === 'todas' ? monthGoals : monthGoals.filter(g => g.category === filterCat)

  const total = monthGoals.length
  const done = monthGoals.filter(g => g.completed).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    addGoal({ title: newTitle.trim(), description: newDesc.trim() || undefined, month: monthKey, category: newCat })
    setNewTitle('')
    setNewDesc('')
    setShowModal(false)
  }

  const goalsBy = (cat: GoalCategory) => filtered.filter(g => g.category === cat)

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      <div className="absolute top-0 right-0 w-[480px] h-[480px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 70% 30%, #7C3AED 0%, transparent 70%)' }}
      />

      <div className="relative z-10 p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 animate-fade-in flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Target size={28} />
              Metas
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Seus objetivos mensais
            </p>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-3 py-2">
            <button onClick={() => setViewDate(d => subMonths(d, 1))} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize w-32 text-center">
              {format(viewDate, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <button onClick={() => setViewDate(d => addMonths(d, 1))} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Progress Card */}
        <div className="glass-card rounded-2xl p-6 mb-6 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-slate-700 dark:text-slate-200">Progresso do Mês</h2>
              <p className="text-slate-400 text-sm">{done} de {total} metas concluídas</p>
            </div>
            <span className="text-3xl font-bold text-black dark:text-white">{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7C3AED, #A855F7)' }}
            />
          </div>

          {/* Per-category mini stats */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {GOAL_CATEGORIES.map(cat => {
              const catGoals = monthGoals.filter(g => g.category === cat)
              const catDone = catGoals.filter(g => g.completed).length
              const meta = CATEGORY_META[cat]
              const Icon = meta.icon
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(f => f === cat ? 'todas' : cat)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-150 ${
                    filterCat === cat ? 'ring-2 ring-offset-1 scale-105' : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                  style={filterCat === cat ? { outlineColor: meta.color } : {}}
                >
                  <Icon size={16} style={{ color: meta.color }} />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {catDone}/{catGoals.length}
                  </p>
                  <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1">
                    <div
                      className="h-1 rounded-full transition-all duration-500"
                      style={{
                        width: catGoals.length > 0 ? `${(catDone / catGoals.length) * 100}%` : '0%',
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setFilterCat('todas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
              filterCat === 'todas'
                ? 'bg-black text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700'
            }`}
          >
            <Target size={14} />
            Todas
          </button>
          {GOAL_CATEGORIES.map(cat => {
            const meta = CATEGORY_META[cat]
            const Icon = meta.icon
            return (
              <button
                key={cat}
                onClick={() => setFilterCat(f => f === cat ? 'todas' : cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 border ${
                  filterCat === cat
                    ? 'text-white shadow-md border-transparent'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-100 dark:border-slate-700'
                }`}
                style={filterCat === cat ? { backgroundColor: meta.color } : {}}
              >
                <Icon size={14} />
                {meta.label}
              </button>
            )
          })}
        </div>

        {/* Goals by Category */}
        {total === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-slate-400 animate-fade-in">
            <Target size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm mb-4">Nenhuma meta para este mês ainda.</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-sm px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              + Adicionar meta
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {(filterCat === 'todas' ? GOAL_CATEGORIES : [filterCat]).map(cat => {
              const catGoals = goalsBy(cat)
              if (catGoals.length === 0) return null
              const meta = CATEGORY_META[cat]
              const Icon = meta.icon
              const catDone = catGoals.filter(g => g.completed).length
              return (
                <div key={cat} className="glass-card rounded-2xl overflow-hidden shadow-sm">
                  <div className={`flex items-center justify-between px-5 py-3.5 ${meta.bg}`}>
                    <div className="flex items-center gap-2">
                      <Icon size={16} style={{ color: meta.color }} />
                      <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{meta.label}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">{catDone}/{catGoals.length}</span>
                  </div>
                  <div className="p-3 space-y-2">
                    {catGoals.map(goal => <GoalItem key={goal.id} goal={goal} />)}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-slate-400 hover:border-black hover:text-black dark:hover:border-gray-400 dark:hover:text-gray-300 transition-all duration-200 text-sm font-medium"
        >
          <Plus size={16} /> Adicionar meta
        </button>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Nova Meta</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">Meta *</label>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex: Ler 2 livros este mês"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">Descrição (opcional)</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Detalhes ou critério de conclusão..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">Categoria</label>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_CATEGORIES.map(cat => {
                    const meta = CATEGORY_META[cat]
                    const Icon = meta.icon
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewCat(cat)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left border ${
                          newCat === cat
                            ? 'text-white border-transparent'
                            : 'bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border-gray-100 dark:border-slate-700'
                        }`}
                        style={newCat === cat ? { backgroundColor: meta.color } : {}}
                      >
                        <Icon size={14} />
                        {meta.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
