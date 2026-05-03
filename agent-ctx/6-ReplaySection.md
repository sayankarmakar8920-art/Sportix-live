# Task 6: ReplaySection Component

## Status: ✅ Completed

## Summary
Created `/home/z/my-project/src/components/sportix/ReplaySection.tsx` — a comprehensive Replay/VOD section component for Sportix Live.

## Implementation Details

### Features Built
1. **Replay Grid** — Responsive grid layout: 2 cols mobile, 3 cols tablet, 4 cols desktop
2. **Filter by Sport** — Category filter tabs (All, Football, Basketball, Tennis, Racing, Cricket, MMA) with pill-style buttons matching existing CategoryTabs pattern
3. **Search Bar** — Full-text search input filtering by title, description, and category
4. **Duration Badges** — Formatted HH:MM:SS overlay on thumbnail bottom-right with `bg-black/70` backdrop
5. **View Count** — Compact formatted view count (1.2M, 342K, etc.) with Eye icon
6. **Date Info** — Relative time display ("2h ago", "Yesterday", "3d ago", "2w ago") with Clock icon
7. **Status Indicators** — Three states: Ready (green #00ff88), Processing (yellow #facc15), Failed (red #ff3b3b) with colored dots and overlays
8. **Click to Play** — `onPlay` callback on ready recordings; processing/failed cards are non-interactive

### Exported Helpers
- `formatDuration(seconds)` → "HH:MM:SS" or "M:SS"
- `formatRelativeTime(dateString)` → "2h ago", "Yesterday", etc.

### Design System Compliance
- Dark theme: `#0B0F14` background, `glass-card` styling
- Glassmorphism cards: `glass-card rounded-xl overflow-hidden transition-all hover:border-[#00ff88]/20`
- Thumbnail: `aspect-video` with gradient placeholder, Film icon fallback
- Duration badge: `bg-black/70 rounded px-1.5 py-0.5 text-[10px]`
- Status dot: `h-2.5 w-2.5 rounded-full` with glow shadow
- Category badge: `rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/40`
- Active filter tab: `bg-[#00ff88] text-[#02040a] shadow-md shadow-[#00ff88]/20`
- Loading skeleton grid (8 placeholders) with pulse animation
- Empty state with contextual messaging (filter-aware)
- Error state with retry button
- Auto-refresh indicator with ping animation
- Results count when filters are active

### Data Flow
- Fetches from `GET /api/recordings?status=ready` on mount
- Falls back to 8 realistic mock recordings when API returns empty/error
- Auto-refreshes every 30 seconds
- Accepts optional `streams` prop for pre-loaded data
- Client-side filtering by category and search query via `useMemo`

### Props Interface
```typescript
interface ReplaySectionProps {
  streams?: any[]
}
```

### Lint Status: ✅ Clean (no errors)
