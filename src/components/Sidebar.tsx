'use client'
import { LayoutDashboard, Calendar, CheckSquare, Dumbbell, Sun, Moon, Menu, X } from 'lucide-react'
import { useAppStore, Section } from '@/store/store'
import { useState } from 'react'

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} /> },
  { id: 'habits', label: 'Habits', icon: <CheckSquare size={20} /> },
  { id: 'training', label: 'Training', icon: <Dumbbell size={20} /> },
]

export default function Sidebar() {
  const { activeSection, setActiveSection, darkMode, toggleDarkMode } = useAppStore()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`
      ${collapsed ? 'w-16' : 'w-56'}
      transition-all duration-300 flex-shrink-0
      bg-black dark:bg-black
      flex flex-col
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

      {/* Theme Toggle */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 text-sm font-medium"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </aside>
  )
}
