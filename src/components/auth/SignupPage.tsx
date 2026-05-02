'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SignupPageProps {
  onSwitchToLogin: () => void
}

export default function SignupPage({ onSwitchToLogin }: SignupPageProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordChecks = [
    { label: 'At least 6 characters', met: password.length >= 6 },
    { label: 'Contains a number', met: /\d/.test(password) },
  ]

  const validateForm = () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return false
    }
    if (!email.trim()) {
      setError('Please enter your email')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email')
      return false
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!agreed) {
      setError('Please agree to the Terms of Use and Privacy Policy')
      return false
    }
    setError('')
    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      // Register user
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      // Auto login after signup
      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.ok) {
        router.refresh()
      } else {
        setError('Account created! Please login.')
        onSwitchToLogin()
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
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto" style={{ background: '#0B0F14' }}>
      {/* Stadium Background */}
      <div className="fixed inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/stadium-bg.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0B0F14]" />
      </div>

      {/* Green glow effects */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: '#00C853' }} />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15 blur-[100px]" style={{ background: '#00C853' }} />

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md mx-4 my-8 fade-in-up">
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
            <h2 className="text-xl font-bold text-white">Create Account</h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
              Sign up to start watching live sports
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
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>

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
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
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
              {/* Password strength checks */}
              {password.length > 0 && (
                <div className="mt-2 flex gap-3">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className="flex items-center gap-1">
                      <Check
                        className={`h-3 w-3 transition-colors ${check.met ? 'text-[#00C853]' : 'text-white/15'}`}
                      />
                      <span className={`text-[10px] transition-colors ${check.met ? 'text-[#00C853]/70' : 'text-white/25'}`}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                  style={{
                    ...inputStyle,
                    ...(confirmPassword && confirmPassword !== password
                      ? { borderColor: 'rgba(255, 59, 59, 0.4)' }
                      : confirmPassword && confirmPassword === password
                        ? { borderColor: 'rgba(0, 200, 83, 0.4)' }
                        : {}),
                  }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all"
                style={{
                  background: agreed ? '#00C853' : 'transparent',
                  borderColor: agreed ? '#00C853' : 'rgba(255, 255, 255, 0.15)',
                }}
              >
                {agreed && <Check className="h-3 w-3 text-white" />}
              </button>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                I agree to the{' '}
                <span className="font-medium cursor-pointer transition-colors hover:text-[#00C853]" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Terms of Use</span>
                {' '}and{' '}
                <span className="font-medium cursor-pointer transition-colors hover:text-[#00C853]" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Privacy Policy</span>
              </p>
            </div>

            {/* Sign Up Button */}
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
                    Sign Up
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

          {/* Google Signup */}
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
            Sign up with Google
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-semibold transition-colors hover:text-[#00dd6a]"
              style={{ color: '#00C853' }}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
