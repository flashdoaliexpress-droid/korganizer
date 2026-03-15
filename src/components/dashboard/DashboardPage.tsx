'use client'
import { useAppStore } from '@/store/store'
import { todayStr, getCategoryLabel, getCategoryColor, getStreak, format, ptBR } from '@/lib/utils'
import { Calendar, Dumbbell, ArrowRight, Flame, Target, Clock } from 'lucide-react'

export default function DashboardPage() {
  const { habits, events, trainingLogs, setActiveSection } = useAppStore()
  const today = todayStr()

  // Compute today's habit completion
  const totalHabits = habits.length
  const completedToday = habits.filter(h => h.history.includes(today)).length
  const completionPct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

  // Category streaks
  const categories = ['momento-com-deus', 'desenvolvimento', 'trabalho', 'cuidados-pessoais']
  const categoryStreaks = categories.map(cat => {
    const catHabits = habits.filter(h => h.category === cat)
    const allDates = catHabits.flatMap(h => h.history)
    const uniqueDates = [...new Set(allDates)]
    const streak = catHabits.length > 0 ? getStreak(uniqueDates) : 0
    const todayDone = catHabits.filter(h => h.history.includes(today)).length
    return { cat, streak, todayDone, total: catHabits.length }
  })

  // Upcoming events (sorted, next 3 from today)
  const upcomingEvents = events
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 3)

  // Last training log
  const lastLog = [...trainingLogs].sort((a, b) => b.date.localeCompare(a.date))[0]

  // Greeting based on hour
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  // Format current date using date-fns with ptBR locale
  const formattedDate = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
  // Capitalize first letter
  const dateDisplay = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

  const eventTypeColors: Record<string, string> = {
    habit: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    training: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    work: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  }

  const eventTypeLabels: Record<string, string> = {
    habit: 'Hábito',
    training: 'Treino',
    personal: 'Pessoal',
    work: 'Trabalho',
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Decorative background */}
      <div
        className="absolute top-0 right-0 w-[520px] h-[520px] opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'url(/detalhe-dashboard.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{greeting},</p>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Welcome, Kauã</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{dateDisplay}</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-4 animate-fade-in">

          {/* Overall Overview Card */}
          <div className="col-span-12 md:col-span-4 glass-card rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target size={18} className="text-black dark:text-white" />
              <h2 className="font-semibold text-slate-700 dark:text-slate-200">Overview de Hoje</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Hábitos completados</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {completedToday}/{totalHabits}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-black dark:bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{completionPct}% completo</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-black dark:text-white">{completedToday}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Feitos hoje</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{upcomingEvents.length}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Próx. eventos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events Card */}
          <div className="col-span-12 md:col-span-8 glass-card rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Calendar size={18} className="text-black dark:text-white" />
                Próximos Eventos
              </h2>
              <button
                onClick={() => setActiveSection('calendar')}
                className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
              >
                Ver todos <ArrowRight size={12} />
              </button>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Calendar size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Nenhum evento agendado</p>
                <button
                  onClick={() => setActiveSection('calendar')}
                  className="mt-3 text-xs text-gray-500 hover:text-black transition-colors"
                >
                  Adicionar evento
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div
                      className="w-1 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color || '#111111' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {event.date} • {event.startTime} – {event.endTime}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${eventTypeColors[event.type] || ''}`}>
                      {eventTypeLabels[event.type] || event.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Habits Category Streaks */}
          <div className="col-span-12 md:col-span-7 glass-card rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Flame size={18} className="text-orange-500" />
                Streaks por Categoria
              </h2>
              <button
                onClick={() => setActiveSection('habits')}
                className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
              >
                Ver hábitos <ArrowRight size={12} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {categoryStreaks.map(({ cat, streak, todayDone, total }) => (
                <div
                  key={cat}
                  className="rounded-xl p-3 border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-tight">
                      {getCategoryLabel(cat)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Flame size={12} className="text-orange-400" />
                      <span className="text-xs font-bold text-orange-500">{streak}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: total > 0 ? `${(todayDone / total) * 100}%` : '0%',
                          backgroundColor: getCategoryColor(cat),
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{todayDone}/{total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Training Preview */}
          <div className="col-span-12 md:col-span-5 glass-card rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Dumbbell size={18} className="text-green-500" />
                Último Treino
              </h2>
              <button
                onClick={() => setActiveSection('training')}
                className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
              >
                Ver log <ArrowRight size={12} />
              </button>
            </div>
            {lastLog ? (
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1">
                  <Clock size={11} /> {lastLog.date}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4 whitespace-pre-line">
                  {lastLog.content || '(sem conteúdo)'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                <Dumbbell size={28} className="mb-2 opacity-30" />
                <p className="text-sm">Nenhum treino registrado</p>
                <button
                  onClick={() => setActiveSection('training')}
                  className="mt-3 text-xs text-gray-500 hover:text-black transition-colors"
                >
                  Registrar treino
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
