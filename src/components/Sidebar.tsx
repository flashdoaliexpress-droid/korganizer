'use client'
import { LayoutDashboard, Calendar, CheckSquare, Dumbbell, Sun, Moon, Menu, X, Target, LogOut } from 'lucide-react'
import { useAppStore, Section } from '@/store/store'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'calendar', label: 'Calendário', icon: <Calendar size={20} /> },
  { id: 'habits', label: 'Hábitos', icon: <CheckSquare size={20} /> },
  { id: 'training', label: 'Treinos', icon: <Dumbbell size={20} /> },
  { id: 'metas', label: 'Metas', icon: <Target size={20} /> },
]

const mobileNavItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={22} /> },
  { id: 'calendar', label: 'Agenda', icon: <Calendar size={22} /> },
  { id: 'habits', label: 'Hábitos', icon: <CheckSquare size={22} /> },
  { id: 'training', label: 'Treinos', icon: <Dumbbell size={22} /> },
  { id: 'metas', label: 'Metas', icon: <Target size={22} /> },
]

export default function Sidebar() {
  const { activeSection, setActiveSection, darkMode, toggleDarkMode } = useAppStore()
  const { signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
      <aside className={`
        ${collapsed ? 'w-16' : 'w-56'}
        hidden md:flex
        transition-all duration-300 flex-shrink-0
        bg-black dark:bg-black
        flex-col
        shadow-xl
        relative
        z-10
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-sm">K</span>
          </div>
          {!collapsed && (
            <span className="text-white font-bold text-lg tracking-tight">Korganizer</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-gray-400 hover:text-white transition-colors"
          >
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 text-sm font-medium
                ${activeSection === item.id
                  ? 'bg-white text-black shadow-md'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-gray-800 space-y-1">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 text-sm font-medium"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            {!collapsed && <span>{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>}
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-all duration-200 text-sm font-medium"
          >
            <LogOut size={20} />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation ─────────────────────────────────────── */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex w-full">
          {mobileNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px]
                transition-all duration-200
                ${activeSection === item.id
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300 active:text-white'
                }
              `}
            >
              <div className={`p-1 rounded-lg transition-all ${activeSection === item.id ? 'bg-white/10' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </button>
          ))}
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex flex-col items-center justify-center gap-0.5 px-2.5 py-2.5 min-h-[56px] text-gray-500 hover:text-gray-300 active:text-white transition-all duration-200"
          >
            <div className="p-1 rounded-lg">
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </div>
            <span className="text-[9px] font-medium leading-none">{darkMode ? 'Claro' : 'Escuro'}</span>
          </button>
        </div>
      </nav>
    </>
  )
}
