'use client'
import { useState, useMemo } from 'react'
import { useAppStore, EventType } from '@/store/store'
import { ChevronLeft, ChevronRight, Plus, X, Clock, Trash2 } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isToday,
  isSameMonth,
  format,
  addDays,
  parseISO,
} from 'date-fns'
import { todayStr, getEventTypeColor } from '@/lib/utils'

type ViewMode = 'month' | 'week' | 'day'

const EVENT_COLORS: Record<EventType, { bg: string; text: string; dot: string }> = {
  habit: {
    bg: 'bg-gray-100 dark:bg-gray-800/60',
    text: 'text-gray-800 dark:text-gray-200',
    dot: 'bg-gray-700',
  },
  training: {
    bg: 'bg-green-100 dark:bg-green-900/50',
    text: 'text-green-800 dark:text-green-200',
    dot: 'bg-green-500',
  },
  personal: {
    bg: 'bg-purple-100 dark:bg-purple-900/50',
    text: 'text-purple-800 dark:text-purple-200',
    dot: 'bg-purple-500',
  },
  work: {
    bg: 'bg-amber-100 dark:bg-amber-900/50',
    text: 'text-amber-800 dark:text-amber-200',
    dot: 'bg-amber-500',
  },
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  habit: 'Hábito',
  training: 'Treino',
  personal: 'Pessoal',
  work: 'Trabalho',
}

export default function CalendarPage() {
  const { events, addEvent, deleteEvent } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewMode>('month')
  const [selectedDay, setSelectedDay] = useState<string>(todayStr())
  const [showModal, setShowModal] = useState(false)
  const [modalDate, setModalDate] = useState<string>(todayStr())

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formStart, setFormStart] = useState('08:00')
  const [formEnd, setFormEnd] = useState('09:00')
  const [formType, setFormType] = useState<EventType>('personal')
  const [formDesc, setFormDesc] = useState('')

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const getEventsForDay = (dateStr: string) => events.filter(e => e.date === dateStr)

  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate)
    if (view === 'month') d.setMonth(d.getMonth() + dir)
    else if (view === 'week') d.setDate(d.getDate() + dir * 7)
    else d.setDate(d.getDate() + dir)
    setCurrentDate(d)
  }

  const openModal = (dateStr: string) => {
    setModalDate(dateStr)
    setFormTitle('')
    setFormStart('08:00')
    setFormEnd('09:00')
    setFormType('personal')
    setFormDesc('')
    setShowModal(true)
  }

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) return
    addEvent({
      title: formTitle.trim(),
      date: modalDate,
      startTime: formStart,
      endTime: formEnd,
      type: formType,
      color: getEventTypeColor(formType),
      description: formDesc,
    })
    setShowModal(false)
  }

  const selectedDayEvents = getEventsForDay(selectedDay).sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  )

  const monthStr = format(currentDate, 'MMMM yyyy')

  // Week view days
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [currentDate])

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Decorative */}
      <div
        className="absolute top-0 right-0 w-[480px] h-[480px] opacity-15 pointer-events-none"
        style={{ backgroundImage: 'url(/detalhe-calendar.jpeg)', backgroundSize: 'cover' }}
      />

      <div className="relative z-10 p-6 h-screen flex flex-col max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
              {monthStr}
            </h1>
            <button
              onClick={() => navigate(1)}
              className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <button
              onClick={() => {
                setCurrentDate(new Date())
                setSelectedDay(todayStr())
              }}
              className="text-sm px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Hoje
            </button>
          </div>
          <div className="flex items-center gap-2">
            {(['month', 'week', 'day'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-all ${
                  view === v
                    ? 'bg-black text-white shadow-sm'
                    : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {v === 'month' ? 'Mês' : v === 'week' ? 'Semana' : 'Dia'}
              </button>
            ))}
            <button
              onClick={() => openModal(selectedDay)}
              className="flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium ml-2"
            >
              <Plus size={16} /> Evento
            </button>
          </div>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Calendar Grid */}
          <div className="flex-1 glass-card rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-slate-800">
              {WEEKDAYS.map(d => (
                <div
                  key={d}
                  className="py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            {view === 'month' && (
              <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto scrollbar-hide">
                {calendarDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const dayEvents = getEventsForDay(dateStr)
                  const isSelected = dateStr === selectedDay
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isTodayDate = isToday(day)

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDay(dateStr)}
                      className={`
                        border-b border-r border-gray-100 dark:border-slate-800/50
                        p-1.5 cursor-pointer min-h-[80px]
                        transition-colors group
                        ${isSelected ? 'bg-gray-100 dark:bg-gray-800/40' : 'hover:bg-gray-50 dark:hover:bg-slate-800/30'}
                        ${!isCurrentMonth ? 'opacity-40' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`
                            text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                            ${isTodayDate ? 'bg-black text-white' : 'text-slate-700 dark:text-slate-300'}
                          `}
                        >
                          {format(day, 'd')}
                        </span>
                        <button
                          onClick={ev => {
                            ev.stopPropagation()
                            openModal(dateStr)
                          }}
                          className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-full bg-black text-white transition-opacity"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div
                            key={ev.id}
                            className={`text-xs px-1.5 py-0.5 rounded truncate font-medium ${EVENT_COLORS[ev.type]?.bg} ${EVENT_COLORS[ev.type]?.text}`}
                          >
                            {ev.startTime} {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-slate-400 px-1">+{dayEvents.length - 3}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Week view */}
            {view === 'week' && (
              <div className="grid grid-cols-7 flex-1 overflow-y-auto scrollbar-hide">
                {weekDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const dayEvents = getEventsForDay(dateStr)
                  const isSelected = dateStr === selectedDay
                  const isTodayDate = isToday(day)

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDay(dateStr)}
                      className={`
                        border-r border-gray-100 dark:border-slate-800 p-2 cursor-pointer min-h-[300px]
                        transition-colors
                        ${isSelected ? 'bg-gray-100 dark:bg-gray-800/40' : 'hover:bg-gray-50 dark:hover:bg-slate-800/30'}
                      `}
                    >
                      <div
                        className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full mb-2 ${
                          isTodayDate ? 'bg-black text-white' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.map(ev => (
                          <div
                            key={ev.id}
                            className={`text-xs px-1.5 py-1 rounded-lg font-medium ${EVENT_COLORS[ev.type]?.bg} ${EVENT_COLORS[ev.type]?.text}`}
                          >
                            <div className="truncate">{ev.title}</div>
                            <div className="opacity-70">{ev.startTime}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Day view */}
            {view === 'day' && (
              <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-full ${
                      isToday(parseISO(selectedDay)) ? 'bg-black text-white' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {format(parseISO(selectedDay), 'd')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {format(parseISO(selectedDay), 'EEEE')}
                    </p>
                    <p className="text-sm text-slate-400">{selectedDayEvents.length} evento(s)</p>
                  </div>
                </div>
                {selectedDayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <Clock size={32} className="mb-2 opacity-30" />
                    <p className="text-sm">Nenhum evento neste dia</p>
                    <button
                      onClick={() => openModal(selectedDay)}
                      className="mt-3 text-sm text-gray-500 hover:text-black transition-colors"
                    >
                      + Adicionar evento
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayEvents.map(ev => (
                      <div
                        key={ev.id}
                        className={`p-4 rounded-xl ${EVENT_COLORS[ev.type]?.bg} group flex items-start justify-between`}
                      >
                        <div>
                          <p className={`font-semibold ${EVENT_COLORS[ev.type]?.text}`}>{ev.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {ev.startTime} – {ev.endTime}
                          </p>
                          {ev.description && (
                            <p className="text-xs text-slate-400 mt-1">{ev.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Day Panel (always visible for month/week views) */}
          {view !== 'day' && (
            <div className="w-72 glass-card rounded-2xl shadow-sm p-4 overflow-y-auto scrollbar-hide flex flex-col flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                    {format(parseISO(selectedDay), 'd MMM')}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedDayEvents.length} evento(s)</p>
                </div>
                <button
                  onClick={() => openModal(selectedDay)}
                  className="w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {selectedDayEvents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-8">
                  <Clock size={28} className="mb-2 opacity-30" />
                  <p className="text-sm text-center">Nenhum evento neste dia</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map(ev => (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-xl ${EVENT_COLORS[ev.type]?.bg} group relative`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${EVENT_COLORS[ev.type]?.text}`}>
                            {ev.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {ev.startTime} – {ev.endTime}
                          </p>
                          {ev.description && (
                            <p className="text-xs text-slate-400 mt-1 truncate">{ev.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all ml-2 flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <span
                        className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-white/50 ${EVENT_COLORS[ev.type]?.text}`}
                      >
                        {EVENT_TYPE_LABELS[ev.type]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Novo Evento</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Título *
                </label>
                <input
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Ex: Treino de peitoral"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Data
                </label>
                <input
                  type="date"
                  value={modalDate}
                  onChange={e => setModalDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    Início
                  </label>
                  <input
                    type="time"
                    value={formStart}
                    onChange={e => setFormStart(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    Fim
                  </label>
                  <input
                    type="time"
                    value={formEnd}
                    onChange={e => setFormEnd(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">
                  Tipo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['habit', 'training', 'personal', 'work'] as EventType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormType(t)}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${
                        formType === t
                          ? `${EVENT_COLORS[t].bg} ${EVENT_COLORS[t].text} ring-2 ring-offset-1`
                          : 'bg-gray-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {EVENT_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  rows={2}
                  placeholder="Detalhes..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
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
