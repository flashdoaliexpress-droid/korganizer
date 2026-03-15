'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/store/store'
import Sidebar from '@/components/Sidebar'
import DashboardPage from '@/components/dashboard/DashboardPage'
import CalendarPage from '@/components/calendar/CalendarPage'
import HabitsPage from '@/components/habits/HabitsPage'
import TrainingPage from '@/components/training/TrainingPage'

export default function Home() {
  const { activeSection, darkMode } = useAppStore()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-full w-full bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {activeSection === 'dashboard' && <DashboardPage />}
          {activeSection === 'calendar' && <CalendarPage />}
          {activeSection === 'habits' && <HabitsPage />}
          {activeSection === 'training' && <TrainingPage />}
        </main>
      </div>
    </div>
  )
}
