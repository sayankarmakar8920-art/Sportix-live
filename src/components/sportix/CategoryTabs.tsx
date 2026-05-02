'use client'

import { useState } from 'react'

const CATEGORIES = [
  { id: 'all', label: 'For You' },
  { id: 'football', label: '⚽ Football' },
  { id: 'cricket', label: '🏏 Cricket' },
  { id: 'tennis', label: '🎾 Tennis' },
  { id: 'basketball', label: '🏀 Basketball' },
  { id: 'racing', label: '🏎️ Racing' },
  { id: 'more', label: 'More' },
]

export default function CategoryTabs({ onFilter }: { onFilter: (cat: string) => void }) {
  const [active, setActive] = useState('all')

  const handleSelect = (id: string) => {
    setActive(id)
    onFilter(id)
  }

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.id)}
          className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-150 touch-active ${
            active === cat.id
              ? 'bg-[#00ff88] text-[#02040a] shadow-md shadow-[#00ff88]/20'
              : 'bg-white/[0.04] text-white/45 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
