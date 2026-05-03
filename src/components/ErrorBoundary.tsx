'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center p-6"
          style={{ background: '#0B0F14' }}
        >
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff3b3b]/10 ring-1 ring-[#ff3b3b]/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff3b3b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-sm text-white/50 leading-relaxed">
                An unexpected error occurred. This might be a temporary issue.
              </p>
              {this.state.error && (
                <p className="mt-2 text-xs text-white/25 font-mono break-all max-h-20 overflow-y-auto">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <button
              onClick={this.handleReset}
              className="mt-2 flex items-center gap-2 rounded-xl bg-[#00ff88] px-6 py-3 text-sm font-bold text-[#02040a] transition-all hover:bg-[#00dd75] active:scale-[0.97]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
