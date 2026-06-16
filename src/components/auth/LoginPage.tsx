'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
    } else {
      const { error, needsVerification } = await signUp(email, password)
      if (error) {
        setError(error)
      } else if (needsVerification) {
        setInfo('Conta criada! Verifique seu e-mail para confirmar e depois faça login.')
        setMode('login')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/3 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/2 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg">
            <span className="text-black font-bold text-2xl">K</span>
          </div>
          <h1 className="text-white font-bold text-2xl tracking-tight">Korganizer</h1>
          <p className="text-gray-500 text-sm mt-1">Sua organização pessoal</p>
        </div>

        {/* Card */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          {/* Mode tabs */}
          <div className="flex bg-gray-900 rounded-xl p-1 mb-6 gap-1">
            <button
              onClick={() => { setMode('login'); setError(null); setInfo(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setInfo(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'signup'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Criar conta
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-950/50 border border-red-900 text-red-400 text-sm">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-green-950/50 border border-green-900 text-green-400 text-sm">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoFocus
                className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-gray-600 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 pr-10 rounded-xl bg-gray-900 border border-gray-800 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-gray-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 active:bg-gray-200 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          Seus dados são sincronizados com segurança
        </p>
      </div>
    </div>
  )
}
