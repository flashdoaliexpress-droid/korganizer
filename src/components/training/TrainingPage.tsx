'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/store/store'
import { Copy, Download, Trash2, Search, Plus, Clock, Dumbbell, ChevronLeft, List } from 'lucide-react'
import { todayStr } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

export default function TrainingPage() {
  const { trainingLogs, saveTrainingLog, deleteTrainingLog } = useAppStore()
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [content, setContent] = useState('')
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState(false)
  const [showMobileHistory, setShowMobileHistory] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const log = trainingLogs.find(l => l.date === selectedDate)
    setContent(log?.content ?? '')
  }, [selectedDate, trainingLogs])

  const handleChange = useCallback(
    (val: string) => {
      setContent(val)
      setSaved(false)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        saveTrainingLog(selectedDate, val)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }, 800)
    },
    [selectedDate, saveTrainingLog]
  )

  const handleSaveNow = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTrainingLog(selectedDate, content)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCopy = () => navigator.clipboard.writeText(content)

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `treino-${selectedDate}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = () => {
    const log = trainingLogs.find(l => l.date === selectedDate)
    if (log) { deleteTrainingLog(log.id); setContent('') }
  }

  const filteredLogs = trainingLogs
    .filter(l => !search || l.content.toLowerCase().includes(search.toLowerCase()) || l.date.includes(search))
    .sort((a, b) => b.date.localeCompare(a.date))

  const currentLog = trainingLogs.find(l => l.date === selectedDate)
  const lineCount = content.split('\n').filter(l => l.trim()).length

  const formatLogDate = (dateStr: string) => {
    if (dateStr === todayStr()) return 'Hoje'
    try { return format(parseISO(dateStr), 'dd/MM/yyyy') } catch { return dateStr }
  }

  const LogList = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2">
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar logs..."
            className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-300 focus:outline-none placeholder:text-slate-400 min-w-0"
          />
        </div>
      </div>
      <div className="p-3 border-b border-gray-100 dark:border-slate-800">
        <button
          onClick={() => { setSelectedDate(todayStr()); setShowMobileHistory(false) }}
          className="w-full flex items-center gap-2 py-2.5 px-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={15} /> Novo Log (Hoje)
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Dumbbell size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">Nenhum log encontrado</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <button
              key={log.id}
              onClick={() => { setSelectedDate(log.date); setShowMobileHistory(false) }}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                selectedDate === log.date
                  ? 'bg-black text-white shadow-md'
                  : 'hover:bg-gray-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${selectedDate === log.date ? 'text-gray-300' : 'text-slate-400'}`}>
                  {formatLogDate(log.date)}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); deleteTrainingLog(log.id); if (selectedDate === log.date) setContent('') }}
                  className={`opacity-0 group-hover:opacity-100 transition-all ${selectedDate === log.date ? 'text-gray-300 hover:text-red-300' : 'text-slate-300 hover:text-red-500'}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <p className={`text-xs mt-1 truncate ${selectedDate === log.date ? 'text-gray-200' : 'text-slate-400'}`}>
                {log.content ? log.content.split('\n')[0] : '(vazio)'}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-20 pointer-events-none"
        style={{ backgroundImage: 'url(/detalhe-training.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <div className="relative z-10 flex flex-col md:flex-row h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-64 glass-card border-r border-gray-100 dark:border-slate-800 flex-col shadow-sm flex-shrink-0 m-4 mr-0 rounded-2xl overflow-hidden">
          <LogList />
        </div>

        {/* Mobile: History panel overlay */}
        {showMobileHistory && (
          <div className="flex md:hidden fixed inset-0 z-40 bg-gray-50 dark:bg-slate-950 flex-col">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <button
                onClick={() => setShowMobileHistory(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="font-bold text-slate-800 dark:text-white">Histórico de Treinos</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="glass-card h-full">
                <LogList />
              </div>
            </div>
          </div>
        )}

        {/* Main Editor */}
        <div className="flex-1 flex flex-col p-3 md:p-4 min-w-0">
          <div className="glass-card rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2 md:gap-3">
                {/* Mobile history button */}
                <button
                  onClick={() => setShowMobileHistory(true)}
                  className="flex md:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  title="Histórico"
                >
                  <List size={18} />
                </button>
                <Dumbbell size={18} className="text-black dark:text-white hidden md:block" />
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-white text-sm md:text-base">
                    Treino — {formatLogDate(selectedDate)}
                  </h2>
                  {currentLog && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={10} /> Atualizado {format(parseISO(currentLog.updatedAt), 'HH:mm')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                {saved && <span className="text-xs text-green-500 font-medium animate-fade-in hidden md:block">✓ Salvo</span>}
                <button onClick={handleSaveNow} className="text-xs px-2.5 md:px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                  Salvar
                </button>
                <button onClick={handleCopy} title="Copiar" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  <Copy size={15} />
                </button>
                <button onClick={handleExport} title="Exportar TXT" className="hidden md:block p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  <Download size={15} />
                </button>
                <button onClick={handleDelete} title="Deletar log" className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={content}
              onChange={e => handleChange(e.target.value)}
              placeholder={`Treino de ${formatLogDate(selectedDate)}...\n\nEx:\nSupino: 4x10 - 80kg\nAgachamento: 3x12 - 100kg\nPulldown: 3x12 - 60kg\n\nObservações: ...`}
              className="flex-1 w-full p-4 md:p-6 text-slate-700 dark:text-slate-200 bg-transparent focus:outline-none resize-none text-sm leading-relaxed font-mono placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />

            {/* Status bar */}
            <div className="flex items-center justify-between px-4 md:px-6 py-2 border-t border-gray-100 dark:border-slate-800 text-xs text-slate-400">
              <span>{lineCount} {lineCount === 1 ? 'linha' : 'linhas'}</span>
              <span>{content.length} caracteres</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
