'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { useAppStore, CalendarEvent } from '@/store/store'
import { ChevronLeft, ChevronRight, Plus, X, Clock, Trash2, Pencil } from 'lucide-react'
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isToday, isSameMonth,
  format, addDays, parseISO,
} from 'date-fns'
import { todayStr } from '@/lib/utils'

type ViewMode = 'month' | 'week' | 'day'

const HOUR_HEIGHT = 64 // px per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const COLOR_SWATCHES = [
  '#111111', '#374151', '#DC2626', '#D97706',
  '#059669', '#2563EB', '#7C3AED', '#DB2777',
]

function timeToMinutes(time: string): number {
  const parts = time.split(':')
  return parseInt(parts[0]) * 60 + (parseInt(parts[1]) || 0)
}

function getOverlapLayout(evs: CalendarEvent[]): Map<string, { col: number; totalCols: number }> {
  const result = new Map<string, { col: number; totalCols: number }>()
  if (!evs.length) return result

  const sorted = [...evs].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
  const colEnds: number[] = []

  for (const ev of sorted) {
    const start = timeToMinutes(ev.startTime)
    const end = Math.max(timeToMinutes(ev.endTime), start + 30)
    let col = -1
    for (let i = 0; i < colEnds.length; i++) {
      if (colEnds[i] <= start) { col = i; break }
    }
    if (col === -1) { col = colEnds.length; colEnds.push(0) }
    colEnds[col] = end
    result.set(ev.id, { col, totalCols: 0 })
  }

  for (const ev of sorted) {
    const start = timeToMinutes(ev.startTime)
    const end = Math.max(timeToMinutes(ev.endTime), start + 30)
    let maxCol = result.get(ev.id)!.col
    for (const other of sorted) {
      if (other.id === ev.id) continue
      const oStart = timeToMinutes(other.startTime)
      const oEnd = Math.max(timeToMinutes(other.endTime), oStart + 30)
      if (oStart < end && start < oEnd) {
        maxCol = Math.max(maxCol, result.get(other.id)!.col)
      }
    }
    result.set(ev.id, { col: result.get(ev.id)!.col, totalCols: maxCol + 1 })
  }
  return result
}

const EMPTY_FORM = {
  title: '', date: todayStr(), startTime: '08:00', endTime: '09:00',
  color: '#111111', description: '',
}

export default function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewMode>('month')
  const [selectedDay, setSelectedDay] = useState<string>(todayStr())
  const [showModal, setShowModal] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const dayScrollRef = useRef<HTMLDivElement>(null)

  // Scroll day view to current hour on mount
  useEffect(() => {
    if (view === 'day' && dayScrollRef.current) {
      const hour = new Date().getHours()
      dayScrollRef.current.scrollTop = Math.max(0, (hour - 2) * HOUR_HEIGHT)
    }
  }, [view, selectedDay])

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [currentDate])

  const getEventsForDay = (dateStr: string) => events.filter(e => e.date === dateStr)

  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate)
    if (view === 'month') d.setMonth(d.getMonth() + dir)
    else if (view === 'week') d.setDate(d.getDate() + dir * 7)
    else {
      d.setDate(d.getDate() + dir)
      setSelectedDay(format(d, 'yyyy-MM-dd'))
    }
    setCurrentDate(d)
  }

  const openNewModal = (dateStr: string) => {
    setEditingEventId(null)
    setForm({ ...EMPTY_FORM, date: dateStr })
    setShowModal(true)
  }

  const openEditModal = (ev: CalendarEvent) => {
    setEditingEventId(ev.id)
    setForm({
      title: ev.title, date: ev.date,
      startTime: ev.startTime, endTime: ev.endTime,
      color: ev.color || '#111111',
      description: ev.description || '',
    })
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    if (editingEventId) {
      updateEvent(editingEventId, {
        title: form.title.trim(), date: form.date,
        startTime: form.startTime, endTime: form.endTime,
        color: form.color, description: form.description,
      })
    } else {
      addEvent({
        title: form.title.trim(), date: form.date,
        startTime: form.startTime, endTime: form.endTime,
        type: 'personal', color: form.color, description: form.description,
      })
    }
    setShowModal(false)
  }

  const selectedDayEvents = getEventsForDay(selectedDay)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

  const monthStr = format(currentDate, 'MMMM yyyy')

  // ── Render helpers (plain functions, not components) ──────────────────────

  const renderEventPill = (ev: CalendarEvent) => (
    <div
      key={ev.id}
      onClick={e => { e.stopPropagation(); openEditModal(ev) }}
      className="text-xs px-1.5 py-0.5 rounded truncate font-medium cursor-pointer hover:opacity-80 transition-opacity text-white"
      style={{ backgroundColor: ev.color || '#111111' }}
    >
      {ev.startTime} {ev.title}
    </div>
  )

  const renderDayEvent = (ev: CalendarEvent, col: number, totalCols: number) => {
    const startMin = timeToMinutes(ev.startTime)
    const endMin = Math.max(timeToMinutes(ev.endTime), startMin + 15)
    const top = (startMin / 60) * HOUR_HEIGHT
    const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 22)
    const pct = 100 / totalCols
    return (
      <div
        key={ev.id}
        onClick={() => openEditModal(ev)}
        className="absolute rounded-lg p-1.5 text-white cursor-pointer hover:opacity-90 transition-opacity overflow-hidden group border border-white/20"
        style={{
          top: `${top}px`, height: `${height}px`,
          width: `calc(${pct}% - 3px)`,
          left: `calc(${col * pct}% + 1px)`,
          backgroundColor: ev.color || '#111111', zIndex: 10,
        }}
      >
        <p className="text-xs font-semibold leading-tight truncate">{ev.title}</p>
        {height > 36 && (
          <p className="text-[10px] opacity-80 leading-tight mt-0.5">{ev.startTime} – {ev.endTime}</p>
        )}
        {height > 56 && ev.description && (
          <p className="text-[10px] opacity-70 leading-tight truncate mt-0.5">{ev.description}</p>
        )}
        <button
          onClick={e2 => { e2.stopPropagation(); deleteEvent(ev.id) }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded p-0.5"
        >
          <X size={9} />
        </button>
      </div>
    )
  }

  const renderTimeGrid = (dateStr: string) => {
    const dayEvs = getEventsForDay(dateStr)
    const layout = getOverlapLayout(dayEvs)
    const isCurrentDay = dateStr === todayStr()
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes()

    return (
      <div className="flex min-h-0" style={{ height: `${HOUR_HEIGHT * 24}px` }}>
        {/* Time labels */}
        <div className="w-14 flex-shrink-0 relative select-none">
          {HOURS.map(h => (
            <div
              key={h}
              className="absolute text-xs text-slate-400 text-right pr-3 w-full leading-none"
              style={{ top: `${h * HOUR_HEIGHT - 7}px` }}
            >
              {h === 0 ? '' : `${String(h).padStart(2, '0')}:00`}
            </div>
          ))}
        </div>

        {/* Grid + events */}
        <div className="flex-1 relative border-l border-gray-200 dark:border-slate-700">
          {/* Hour lines */}
          {HOURS.map(h => (
            <div
              key={h}
              className="absolute w-full border-t border-gray-200 dark:border-slate-700/80"
              style={{ top: `${h * HOUR_HEIGHT}px` }}
            />
          ))}
          {/* Half-hour lines */}
          {HOURS.map(h => (
            <div
              key={`${h}h`}
              className="absolute w-full border-t border-gray-100 dark:border-slate-800/50"
              style={{ top: `${h * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
            />
          ))}

          {/* Current time line */}
          {isCurrentDay && (
            <div
              className="absolute w-full flex items-center z-20 pointer-events-none"
              style={{ top: `${(nowMin / 60) * HOUR_HEIGHT}px` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 flex-shrink-0 shadow" />
              <div className="flex-1 h-0.5 bg-red-500 shadow" />
            </div>
          )}

          {/* Events */}
          {dayEvs.map(ev => {
            const info = layout.get(ev.id)
            if (!info) return null
            return renderDayEvent(ev, info.col, info.totalCols)
          })}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      <div
        className="absolute top-0 right-0 w-[480px] h-[480px] opacity-15 pointer-events-none"
        style={{ backgroundImage: 'url(/detalhe-calendar.jpeg)', backgroundSize: 'cover' }}
      />

      <div className="relative z-10 p-6 h-screen flex flex-col max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">{monthStr}</h1>
            <button onClick={() => navigate(1)} className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors">
              <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <button
              onClick={() => { setCurrentDate(new Date()); setSelectedDay(todayStr()) }}
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
                  view === v ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {v === 'month' ? 'Mês' : v === 'week' ? 'Semana' : 'Dia'}
              </button>
            ))}
            <button
              onClick={() => openNewModal(selectedDay)}
              className="flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium ml-2"
            >
              <Plus size={16} /> Evento
            </button>
          </div>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">

          {/* ── MONTH VIEW ─────────────────────────────── */}
          {view === 'month' && (
            <>
              <div className="flex-1 glass-card rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="grid grid-cols-7 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
                  {WEEKDAYS.map(d => (
                    <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto scrollbar-hide">
                  {calendarDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const dayEvs = getEventsForDay(dateStr)
                    const isSelected = dateStr === selectedDay
                    const isTodayDate = isToday(day)
                    return (
                      <div
                        key={dateStr}
                        onClick={() => setSelectedDay(dateStr)}
                        className={`border-b border-r border-gray-100 dark:border-slate-800/50 p-1.5 cursor-pointer min-h-[80px] transition-colors group
                          ${isSelected ? 'bg-gray-100 dark:bg-gray-800/40' : 'hover:bg-gray-50 dark:hover:bg-slate-800/30'}
                          ${!isSameMonth(day, currentDate) ? 'opacity-40' : ''}
                        `}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isTodayDate ? 'bg-black text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {format(day, 'd')}
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); openNewModal(dateStr) }}
                            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-full bg-black text-white transition-opacity"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          {dayEvs.slice(0, 3).map(ev => renderEventPill(ev))}
                          {dayEvs.length > 3 && <div className="text-xs text-slate-400 px-1">+{dayEvs.length - 3}</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Day side panel */}
              <div className="w-72 glass-card rounded-2xl shadow-sm p-4 overflow-y-auto scrollbar-hide flex flex-col flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">{format(parseISO(selectedDay), 'd MMM')}</h3>
                    <p className="text-xs text-slate-400">{selectedDayEvents.length} evento(s)</p>
                  </div>
                  <button onClick={() => openNewModal(selectedDay)} className="w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                {selectedDayEvents.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-8">
                    <Clock size={28} className="mb-2 opacity-30" />
                    <p className="text-sm text-center">Nenhum evento</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedDayEvents.map(ev => (
                      <div key={ev.id} className="p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: ev.color || '#111' }} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">{ev.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{ev.startTime} – {ev.endTime}</p>
                              {ev.description && <p className="text-xs text-slate-400 mt-1 truncate">{ev.description}</p>}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                            <button onClick={() => openEditModal(ev)} className="text-slate-400 hover:text-black dark:hover:text-white p-1 rounded">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => deleteEvent(ev.id)} className="text-slate-400 hover:text-red-500 p-1 rounded">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── WEEK VIEW ──────────────────────────────── */}
          {view === 'week' && (
            <div className="flex-1 glass-card rounded-2xl shadow-sm overflow-hidden flex flex-col">
              {/* Week header */}
              <div
                className="grid border-b border-gray-100 dark:border-slate-800 flex-shrink-0"
                style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}
              >
                <div />
                {weekDays.map(day => {
                  const isTodayDate = isToday(day)
                  return (
                    <div key={day.toISOString()} className="py-3 text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">{format(day, 'EEE')}</p>
                      <div className={`mx-auto mt-1 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${isTodayDate ? 'bg-black text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="flex" style={{ height: `${HOUR_HEIGHT * 24}px` }}>
                  {/* Time labels */}
                  <div className="w-14 flex-shrink-0 relative">
                    {HOURS.map(h => (
                      <div key={h} className="absolute text-xs text-slate-400 text-right pr-3 w-full leading-none" style={{ top: `${h * HOUR_HEIGHT - 7}px` }}>
                        {h === 0 ? '' : `${String(h).padStart(2, '0')}:00`}
                      </div>
                    ))}
                  </div>
                  {/* Day columns */}
                  {weekDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const dayEvs = getEventsForDay(dateStr)
                    const layout = getOverlapLayout(dayEvs)
                    const isCurrentDay = isToday(day)
                    const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
                    return (
                      <div key={dateStr} className="flex-1 relative border-l border-gray-200 dark:border-slate-700">
                        {HOURS.map(h => (
                          <div key={h} className="absolute w-full border-t border-gray-200 dark:border-slate-700/80" style={{ top: `${h * HOUR_HEIGHT}px` }} />
                        ))}
                        {isCurrentDay && (
                          <div className="absolute w-full flex items-center z-20 pointer-events-none" style={{ top: `${(nowMin / 60) * HOUR_HEIGHT}px` }}>
                            <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 flex-shrink-0" />
                            <div className="flex-1 h-0.5 bg-red-500" />
                          </div>
                        )}
                        {dayEvs.map(ev => {
                          const info = layout.get(ev.id)
                          if (!info) return null
                          const startMin = timeToMinutes(ev.startTime)
                          const endMin = Math.max(timeToMinutes(ev.endTime), startMin + 15)
                          const top = (startMin / 60) * HOUR_HEIGHT
                          const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 18)
                          const pct = 100 / info.totalCols
                          return (
                            <div
                              key={ev.id}
                              onClick={e => { e.stopPropagation(); openEditModal(ev) }}
                              className="absolute rounded p-0.5 text-white text-xs cursor-pointer hover:opacity-90 overflow-hidden border border-white/20"
                              style={{
                                top: `${top}px`, height: `${height}px`,
                                width: `calc(${pct}% - 2px)`,
                                left: `calc(${info.col * pct}% + 1px)`,
                                backgroundColor: ev.color || '#111', zIndex: 10,
                              }}
                            >
                              <p className="font-semibold leading-tight truncate">{ev.title}</p>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── DAY VIEW ───────────────────────────────── */}
          {view === 'day' && (
            <div className="flex-1 glass-card rounded-2xl shadow-sm overflow-hidden flex flex-col">
              {/* Day header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold ${isToday(parseISO(selectedDay)) ? 'bg-black text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {format(parseISO(selectedDay), 'd')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{format(parseISO(selectedDay), 'EEEE, d MMMM')}</p>
                    <p className="text-xs text-slate-400">{selectedDayEvents.length} evento(s)</p>
                  </div>
                </div>
                <button
                  onClick={() => openNewModal(selectedDay)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>
              <div ref={dayScrollRef} className="flex-1 overflow-y-auto scrollbar-hide p-4">
                {renderTimeGrid(selectedDay)}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── MODAL (Add / Edit) ─────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingEventId ? 'Editar Evento' : 'Novo Evento'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">Título *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Treino de peitoral"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">Data</label>
                <input
                  type="date" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">Início</label>
                  <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">Fim</label>
                  <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">Cor</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_SWATCHES.map(c => (
                    <button
                      key={c} type="button"
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-500' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <label className="w-7 h-7 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-500 transition-colors relative" title="Cor personalizada">
                    <span className="text-gray-400 text-xs">+</span>
                    <input
                      type="color" value={form.color}
                      onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </label>
                </div>
                {/* Preview swatch */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: form.color }} />
                  <span className="text-xs text-slate-500 font-mono">{form.color}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">Descrição (opcional)</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} placeholder="Detalhes..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                {editingEventId && (
                  <button
                    type="button"
                    onClick={() => { deleteEvent(editingEventId); setShowModal(false) }}
                    className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Excluir
                  </button>
                )}
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors">
                  {editingEventId ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
