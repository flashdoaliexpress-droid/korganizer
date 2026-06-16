'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/store/store'
import { useAuth } from '@/contexts/AuthContext'
import LoginPage from '@/components/auth/LoginPage'
import Sidebar from '@/components/Sidebar'
import DashboardPage from '@/components/dashboard/DashboardPage'
import CalendarPage from '@/components/calendar/CalendarPage'
import HabitsPage from '@/components/habits/HabitsPage'
import TrainingPage from '@/components/training/TrainingPage'
import MetasPage from '@/components/metas/MetasPage'

export default function Home() {
  const { activeSection, darkMode, loadUserData } = useAppStore()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    if (user) {
      void loadUserData(user.id)
    }
  }, [user, loadUserData])

  if (loading) {
    return (
      <div className={`flex h-screen items-center justify-center ${darkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center">
            <span className="text-white dark:text-black font-bold">K</span>
          </div>
          <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-full w-full bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto scrollbar-hide pb-16 md:pb-0">
          {activeSection === 'dashboard' && <DashboardPage />}
          {activeSection === 'calendar' && <CalendarPage />}
          {activeSection === 'habits' && <HabitsPage />}
          {activeSection === 'training' && <TrainingPage />}
          {activeSection === 'metas' && <MetasPage />}
        </main>
      </div>
    </div>
  )
}
