'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LoginPageProps {
  onSwitchToSignup: () => void
}

export default function LoginPage({ onSwitchToSignup }: LoginPageProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateForm = () => {
    if (!email.trim()) {
      setError('Please enter your email')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email')
      return false
    }
    if (!password) {
      setError('Please enter your password')
      return false
    }
    setError('')
    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else if (result?.ok) {
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(0, 200, 83, 0.5)'
    e.target.style.boxShadow = '0 0 0 3px rgba(0, 200, 83, 0.1)'
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden" style={{ background: '#0B0F14' }}>
      {/* Stadium Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/stadium-bg.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0B0F14]" />
      </div>

      {/* Green glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: '#00C853' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15 blur-[100px]" style={{ background: '#00C853' }} />

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md mx-4 fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00C853] to-[#00a844] shadow-lg" style={{ boxShadow: '0 0 30px rgba(0, 200, 83, 0.3)' }}>
              <span className="text-white text-lg font-black">S</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Sportix <span style={{ color: '#00C853' }}>LIVE</span>
          </h1>
        </div>

        {/* Glass Card */}
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 0 40px rgba(0, 0, 0, 0.4), 0 0 80px rgba(0, 200, 83, 0.05)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white">Welcome Back!</h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
              Login to continue watching live sports
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mb-4 rounded-xl px-4 py-3 text-sm font-medium"
              style={{
                background: 'rgba(255, 59, 59, 0.1)',
                border: '1px solid rgba(255, 59, 59, 0.2)',
                color: '#ff5252',
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  Password
                </label>
                <button type="button" className="text-xs font-medium transition-colors hover:text-[#00C853]" style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-200 overflow-hidden disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #00C853, #00a844)',
                boxShadow: '0 4px 20px rgba(0, 200, 83, 0.3)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Login
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(255, 255, 255, 0.25)' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
          </div>

          {/* Google Login */}
          <button
            type="button"
            className="w-full rounded-xl py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Login with Google
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
            Don&apos;t have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="font-semibold transition-colors hover:text-[#00dd6a]"
              style={{ color: '#00C853' }}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
