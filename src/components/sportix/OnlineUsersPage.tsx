'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Activity,
  Eye,
  Clock,
  BarChart3,
  Calendar,
  Download,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Play,
  Pause,
  Share2,
  Radio,
  MoreHorizontal,
  Globe,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: '#141414',
  card: '#1a1a1a',
  cardInner: '#222222',
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.12)',
  accent: '#E50914',
  accentDim: 'rgba(229,9,20,0.15)',
  text: '#ffffff',
  textSec: '#b3b3b3',
  textTer: '#808080',
  textDim: '#555555',
  success: '#46d369',
  warning: '#f5c518',
  info: '#0071eb',
  purple: '#9b59b6',
};

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════ */

// KPI Cards
const kpiCards = [
  {
    title: 'Online Users',
    value: '2,458',
    change: '↑ 12.5% vs last 30 days',
    positive: true,
    icon: Users,
    color: '#8B5CF6',
    sparkline: [12, 18, 15, 22, 25, 20, 28, 32, 27, 35, 30, 38, 34, 42, 38, 45, 40, 48, 44, 50],
  },
  {
    title: 'Active Sessions',
    value: '3,842',
    change: '↑ 8.7% vs last 30 days',
    positive: true,
    icon: Activity,
    color: '#3B82F6',
    sparkline: [20, 28, 24, 32, 36, 30, 40, 45, 38, 50, 44, 52, 48, 56, 52, 60, 55, 62, 58, 65],
  },
  {
    title: 'Page Views (Live)',
    value: '12,845',
    change: '↑ 15.3% vs last 30 days',
    positive: true,
    icon: Eye,
    color: '#10B981',
    sparkline: [40, 55, 48, 65, 72, 60, 80, 88, 75, 95, 85, 100, 92, 110, 102, 118, 108, 125, 115, 130],
  },
  {
    title: 'Avg. Session Time',
    value: '00:18:42',
    change: '↑ 6.4% vs last 30 days',
    positive: true,
    icon: Clock,
    color: '#F97316',
    sparkline: [8, 12, 10, 15, 18, 14, 20, 22, 18, 25, 22, 28, 25, 30, 28, 32, 30, 34, 32, 36],
  },
  {
    title: 'Bounce Rate',
    value: '24.6%',
    change: '↓ 3.2% vs last 30 days',
    positive: false,
    icon: BarChart3,
    color: '#EC4899',
    sparkline: [35, 32, 34, 30, 28, 31, 27, 25, 28, 26, 24, 27, 25, 23, 26, 24, 22, 25, 23, 22],
  },
];

// Line chart data: Users Over Time
const lineChartLabels = ['14:30', '14:35', '14:40', '14:45', '14:50', '14:55', '15:00'];
const lineChartYLabels = ['0', '1K', '2K', '3K', '4K', '5K'];
const lineChartData = {
  onlineUsers: [1800, 2100, 2400, 2200, 2600, 2800, 2458],
  activeSessions: [2500, 2800, 3200, 3000, 3500, 3800, 3842],
};
const lineChartColors = {
  onlineUsers: '#8B5CF6',
  activeSessions: '#06B6D4',
};

// Users by Country
const countryData = [
  { name: 'United States', flag: '🇺🇸', count: 680, pct: 27.7 },
  { name: 'India', flag: '🇮🇳', count: 540, pct: 22.0 },
  { name: 'United Kingdom', flag: '🇬🇧', count: 320, pct: 13.0 },
  { name: 'Canada', flag: '🇨🇦', count: 210, pct: 8.6 },
  { name: 'Australia', flag: '🇦🇺', count: 180, pct: 7.3 },
  { name: 'Germany', flag: '🇩🇪', count: 120, pct: 4.9 },
  { name: 'France', flag: '🇫🇷', count: 90, pct: 3.7 },
  { name: 'Others', flag: '🌐', count: 178, pct: 7.2 },
];

// Top Active Pages
const topPages = [
  { page: '/home', users: 1245, pct: 28.6 },
  { page: '/video/12345', users: 875, pct: 20.1 },
  { page: '/live-tv', users: 456, pct: 10.5 },
  { page: '/movies', users: 345, pct: 7.9 },
  { page: '/series', users: 298, pct: 6.9 },
  { page: '/search', users: 247, pct: 5.7 },
  { page: '/my-list', users: 198, pct: 4.6 },
  { page: '/profile', users: 146, pct: 3.3 },
  { page: 'Others', users: 250, pct: 5.7 },
];

// Users by Device (donut)
const deviceData = [
  { name: 'Mobile', value: 59.3, color: '#8B5CF6' },
  { name: 'Desktop', value: 29.5, color: '#3B82F6' },
  { name: 'Tablet', value: 7.9, color: '#10B981' },
  { name: 'TV', value: 3.3, color: '#F97316' },
];

// Online Users Table
interface OnlineUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  device: 'Mobile' | 'Desktop' | 'Tablet' | 'TV';
  location: string;
  flag: string;
  ip: string;
  currentPage: string;
  sessionTime: string;
  lastActive: string;
}

const onlineUsers: OnlineUser[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex.j@gmail.com', initials: 'AJ', avatarColor: '#8B5CF6', device: 'Mobile', location: 'New York, US', flag: '🇺🇸', ip: '192.168.1.45', currentPage: '/home', sessionTime: '00:42:15', lastActive: 'Just now' },
  { id: '2', name: 'Sarah Williams', email: 'sarah.w@outlook.com', initials: 'SW', avatarColor: '#3B82F6', device: 'Desktop', location: 'London, UK', flag: '🇬🇧', ip: '10.0.0.23', currentPage: '/video/12345', sessionTime: '01:15:30', lastActive: '1 min ago' },
  { id: '3', name: 'Raj Patel', email: 'raj.p@yahoo.com', initials: 'RP', avatarColor: '#10B981', device: 'Mobile', location: 'Mumbai, IN', flag: '🇮🇳', ip: '172.16.0.89', currentPage: '/live-tv', sessionTime: '00:28:45', lastActive: '2 min ago' },
  { id: '4', name: 'Emma Davis', email: 'emma.d@proton.me', initials: 'ED', avatarColor: '#F97316', device: 'Tablet', location: 'Toronto, CA', flag: '🇨🇦', ip: '192.168.2.14', currentPage: '/movies', sessionTime: '00:55:20', lastActive: '3 min ago' },
  { id: '5', name: 'Chen Wei', email: 'chen.w@gmail.com', initials: 'CW', avatarColor: '#EC4899', device: 'TV', location: 'Sydney, AU', flag: '🇦🇺', ip: '203.0.113.5', currentPage: '/series', sessionTime: '02:10:05', lastActive: 'Just now' },
  { id: '6', name: 'Lisa Müller', email: 'lisa.m@web.de', initials: 'LM', avatarColor: '#06B6D4', device: 'Desktop', location: 'Berlin, DE', flag: '🇩🇪', ip: '198.51.100.42', currentPage: '/search', sessionTime: '00:18:30', lastActive: '5 min ago' },
  { id: '7', name: 'James Brown', email: 'james.b@gmail.com', initials: 'JB', avatarColor: '#EAB308', device: 'Mobile', location: 'Los Angeles, US', flag: '🇺🇸', ip: '192.168.1.78', currentPage: '/my-list', sessionTime: '00:35:50', lastActive: '1 min ago' },
  { id: '8', name: 'Priya Sharma', email: 'priya.s@gmail.com', initials: 'PS', avatarColor: '#A855F7', device: 'Mobile', location: 'Delhi, IN', flag: '🇮🇳', ip: '172.16.0.156', currentPage: '/profile', sessionTime: '00:22:10', lastActive: 'Just now' },
  { id: '9', name: 'Tom Wilson', email: 'tom.w@hotmail.com', initials: 'TW', avatarColor: '#EF4444', device: 'Desktop', location: 'Chicago, US', flag: '🇺🇸', ip: '192.168.3.92', currentPage: '/home', sessionTime: '00:48:25', lastActive: '2 min ago' },
  { id: '10', name: 'Marie Dubois', email: 'marie.d@orange.fr', initials: 'MD', avatarColor: '#14B8A6', device: 'Tablet', location: 'Paris, FR', flag: '🇫🇷', ip: '82.123.45.67', currentPage: '/live-tv', sessionTime: '01:02:40', lastActive: '4 min ago' },
  { id: '11', name: 'Carlos Garcia', email: 'carlos.g@gmail.com', initials: 'CG', avatarColor: '#F59E0B', device: 'Mobile', location: 'Madrid, ES', flag: '🇪🇸', ip: '87.65.43.21', currentPage: '/video/67890', sessionTime: '00:33:15', lastActive: 'Just now' },
  { id: '12', name: 'Yuki Tanaka', email: 'yuki.t@docomo.jp', initials: 'YT', avatarColor: '#6366F1', device: 'TV', location: 'Tokyo, JP', flag: '🇯🇵', ip: '103.22.200.3', currentPage: '/movies', sessionTime: '01:45:20', lastActive: '1 min ago' },
];

// Real-time Activity Feed
interface ActivityEntry {
  id: string;
  userName: string;
  initials: string;
  avatarColor: string;
  activity: string;
  timestamp: string;
  ActivityIcon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconColor: string;
}

const activityFeed: ActivityEntry[] = [
  { id: '1', userName: 'Alex Johnson', initials: 'AJ', avatarColor: '#8B5CF6', activity: 'started watching Match Highlights', timestamp: 'Just now', ActivityIcon: Play, iconColor: '#10B981' },
  { id: '2', userName: 'Sarah Williams', initials: 'SW', avatarColor: '#3B82F6', activity: 'navigated to /live-tv', timestamp: '2 min ago', ActivityIcon: Eye, iconColor: '#3B82F6' },
  { id: '3', userName: 'Raj Patel', initials: 'RP', avatarColor: '#10B981', activity: 'paused video on /video/12345', timestamp: '5 min ago', ActivityIcon: Pause, iconColor: '#F97316' },
  { id: '4', userName: 'Emma Davis', initials: 'ED', avatarColor: '#F97316', activity: 'shared a video to social media', timestamp: '7 min ago', ActivityIcon: Share2, iconColor: '#EC4899' },
  { id: '5', userName: 'Chen Wei', initials: 'CW', avatarColor: '#EC4899', activity: 'joined live stream "Premier League"', timestamp: '10 min ago', ActivityIcon: Radio, iconColor: '#06B6D4' },
  { id: '6', userName: 'Lisa Müller', initials: 'LM', avatarColor: '#06B6D4', activity: 'started watching NBA Highlights', timestamp: '12 min ago', ActivityIcon: Play, iconColor: '#10B981' },
  { id: '7', userName: 'James Brown', initials: 'JB', avatarColor: '#EAB308', activity: 'navigated to /movies', timestamp: '15 min ago', ActivityIcon: Eye, iconColor: '#3B82F6' },
];

/* ═══════════════════════════════════════════════════════════════
   HELPER: BUILD SMOOTH SVG PATH
   ═══════════════════════════════════════════════════════════════ */
function buildSmoothPath(data: number[], width: number, height: number, maxY: number): string {
  if (data.length < 2) return '';
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => ({
    x: i * stepX,
    y: height - (v / maxY) * height,
  }));
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + stepX * 0.4;
    const cpx2 = curr.x - stepX * 0.4;
    d += ` C ${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
  }
  return d;
}

function buildAreaPath(linePath: string, width: number, height: number): string {
  return `${linePath} L ${width},${height} L 0,${height} Z`;
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENT: SPARKLINE
   ═══════════════════════════════════════════════════════════════ */
function SparklineSVG({ data, color }: { data: number[]; color: string }) {
  const w = 120;
  const h = 30;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const points = data.map((v, i) => `${i * stepX},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
  const areaPts = `${points} ${w},${h} 0,${h}`;
  const gradId = `spark-${color.replace('#', '')}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENT: DONUT CHART (stroke-dasharray)
   ═══════════════════════════════════════════════════════════════ */
function DonutChart({
  data,
  centerValue,
  centerLabel,
}: {
  data: { name: string; value: number; color: string }[];
  centerValue: string;
  centerLabel: string;
}) {
  const size = 200;
  const radius = 70;
  const strokeW = 25;
  const circumference = 2 * Math.PI * radius;

  const segments = data.reduce<Array<{ name: string; value: number; color: string; segLen: number; offset: number }>>(
    (acc, d) => {
      const segLen = (d.value / 100) * circumference;
      const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].segLen : 0;
      acc.push({ ...d, segLen, offset });
      return acc;
    },
    [],
  );

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-40 h-40">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeW} />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeW}
              strokeDasharray={`${s.segLen} ${circumference - s.segLen}`}
              strokeDashoffset={-s.offset}
              transform="rotate(-90 100 100)"
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold text-white">{centerValue}</span>
          <span className="text-[10px]" style={{ color: C.textTer }}>{centerLabel}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 w-full max-w-[200px]">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <div className="flex items-center gap-1.5">
              <span className="text-[11px]" style={{ color: C.textSec }}>{d.name}</span>
              <span className="text-[11px]" style={{ color: C.textTer }}>{d.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENT: DEVICE ICON
   ═══════════════════════════════════════════════════════════════ */
function DeviceIcon({ device }: { device: string }) {
  const props = { className: 'h-4 w-4' };
  switch (device) {
    case 'Mobile':
      return <Smartphone {...props} />;
    case 'Desktop':
      return <Monitor {...props} />;
    case 'Tablet':
      return <Tablet {...props} />;
    case 'TV':
      return <Tv {...props} />;
    default:
      return <Monitor {...props} />;
  }
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENT: DROPDOWN
   ═══════════════════════════════════════════════════════════════ */
function Dropdown({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:text-white transition-colors"
        style={{ color: C.textSec, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}` }}
      >
        {value}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-50 rounded-lg py-1 min-w-[140px] shadow-xl"
            style={{ background: '#222', border: `1px solid ${C.border}` }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/[0.06] transition-colors ${
                  opt === value ? 'text-white' : ''
                }`}
                style={{ color: opt === value ? C.text : C.textSec }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function OnlineUsersPage() {
  /* ── State ── */
  const [lineChartPeriod, setLineChartPeriod] = useState('Last 30 Minutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('All Users');
  const [userPage, setUserPage] = useState(1);
  const [countrySearch, setCountrySearch] = useState('');
  const [timeDropdown, setTimeDropdown] = useState(false);
  const rowsPerPage = 6;

  /* ── Filtered Users ── */
  const filteredUsers = useMemo(() => {
    return onlineUsers.filter((u) => {
      const matchSearch =
        !searchQuery ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDevice = deviceFilter === 'All Users' || u.device === deviceFilter;
      return matchSearch && matchDevice;
    });
  }, [searchQuery, deviceFilter]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice((userPage - 1) * rowsPerPage, userPage * rowsPerPage);

  /* ── Filtered Countries ── */
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countryData;
    return countryData.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()));
  }, [countrySearch]);

  /* ── SVG Line Chart Config ── */
  const chartW = 700;
  const chartH = 220;
  const padLeft = 45;
  const padRight = 15;
  const padTop = 10;
  const padBot = 30;
  const innerW = chartW - padLeft - padRight;
  const innerH = chartH - padTop - padBot;
  const maxVal = 5000;

  const toX = (i: number) => padLeft + (i / (lineChartLabels.length - 1)) * innerW;
  const toY = (v: number) => padTop + innerH - (v / maxVal) * innerH;

  const gridLines = lineChartYLabels.map((label, i) => {
    const val = i * 1000;
    return { label, y: toY(val) };
  });

  /* ── Device filter tabs ── */
  const deviceTabs = ['All Users', 'Mobile', 'Desktop', 'Tablet', 'TV'];

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="min-w-0 space-y-4" style={{ background: C.bg }}>
      {/* ════════════════════════════════════════
          1. PAGE HEADER
          ════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: `${C.purple}15` }}
          >
            <Users className="h-5 w-5" style={{ color: C.purple }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">ANALYTICS</h1>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                style={{ background: 'rgba(70,211,105,0.2)', color: C.success }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ background: C.success }}
                />
                LIVE
              </span>
            </div>
            <p className="text-xs" style={{ color: C.textTer }}>
              Monitor active users and their activity across the platform
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date Range */}
          <button
            className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all hover:bg-white/[0.04]"
            style={{ borderColor: C.border, color: C.textSec }}
          >
            <Calendar className="h-3.5 w-3.5" />
            May 10, 2025 - Jun 10, 2025
          </button>

          {/* Export Report */}
          <button
            className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all hover:bg-white/[0.04]"
            style={{ borderColor: C.border, color: C.textSec, background: 'rgba(255,255,255,0.03)' }}
          >
            <Download className="h-3.5 w-3.5" />
            Export Report
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-white/[0.06]"
              style={{ border: `1px solid ${C.border}` }}
            >
              <Bell className="h-4 w-4" style={{ color: C.textSec }} />
            </button>
            <span
              className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ background: C.accent, minWidth: 18, height: 18 }}
            >
              12
            </span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          2. KPI METRIC CARDS
          ════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl p-3 sm:p-4 relative overflow-hidden transition-all hover:border-white/15"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 blur-2xl"
                style={{ background: card.color }}
              />
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{ background: `${card.color}18` }}
                >
                  <Icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: C.textTer }}>
                {card.title}
              </p>
              <p className="text-2xl font-bold text-white leading-tight">{card.value}</p>
              <div className="flex items-center gap-1 mt-2">
                {card.positive ? (
                  <ArrowUpRight className="h-3.5 w-3.5" style={{ color: C.success }} />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" style={{ color: '#EF4444' }} />
                )}
                <span
                  className="text-[11px] font-medium"
                  style={{ color: card.positive ? C.success : '#EF4444' }}
                >
                  {card.change}
                </span>
              </div>
              <div className="mt-3">
                <SparklineSVG data={card.sparkline} color={card.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════
          3. MIDDLE CHARTS ROW
          ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* ── Users Over Time (Line Chart) ── */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Users Over Time</h3>
            </div>
            <Dropdown
              options={['Last 5 Minutes', 'Last 15 Minutes', 'Last 30 Minutes', 'Last 1 Hour']}
              value={lineChartPeriod}
              onChange={setLineChartPeriod}
            />
          </div>

          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="areaOnline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="areaActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {gridLines.map((g, i) => (
              <line
                key={i}
                x1={padLeft}
                y1={g.y}
                x2={chartW - padRight}
                y2={g.y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
            ))}

            {/* Y-axis labels */}
            {gridLines.map((g, i) => (
              <text
                key={`yl-${i}`}
                x={padLeft - 8}
                y={g.y + 4}
                fill="#555555"
                fontSize="10"
                textAnchor="end"
                fontFamily="sans-serif"
              >
                {g.label}
              </text>
            ))}

            {/* X-axis labels */}
            {lineChartLabels.map((label, i) => (
              <text
                key={`xl-${i}`}
                x={toX(i)}
                y={chartH - 5}
                fill="#555555"
                fontSize="10"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {label}
              </text>
            ))}

            {/* Online Users area + line */}
            <g>
              <path
                d={buildAreaPath(
                  buildSmoothPath(lineChartData.onlineUsers, innerW, innerH, maxVal),
                  innerW,
                  innerH
                )}
                fill="url(#areaOnline)"
                transform={`translate(${padLeft}, ${padTop})`}
              />
              <path
                d={buildSmoothPath(lineChartData.onlineUsers, innerW, innerH, maxVal)}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform={`translate(${padLeft}, ${padTop})`}
              />
              {lineChartData.onlineUsers.map((v, i) => (
                <circle
                  key={`dot-${i}`}
                  cx={toX(i)}
                  cy={toY(v)}
                  r="3.5"
                  fill="#8B5CF6"
                  stroke={C.card}
                  strokeWidth="2"
                />
              ))}
            </g>

            {/* Active Sessions area + line */}
            <g>
              <path
                d={buildAreaPath(
                  buildSmoothPath(lineChartData.activeSessions, innerW, innerH, maxVal),
                  innerW,
                  innerH
                )}
                fill="url(#areaActive)"
                transform={`translate(${padLeft}, ${padTop})`}
              />
              <path
                d={buildSmoothPath(lineChartData.activeSessions, innerW, innerH, maxVal)}
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform={`translate(${padLeft}, ${padTop})`}
              />
              {lineChartData.activeSessions.map((v, i) => (
                <circle
                  key={`dot2-${i}`}
                  cx={toX(i)}
                  cy={toY(v)}
                  r="3.5"
                  fill="#06B6D4"
                  stroke={C.card}
                  strokeWidth="2"
                />
              ))}
            </g>
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-3">
            {[
              { label: 'Online Users', color: '#8B5CF6' },
              { label: 'Active Sessions', color: '#06B6D4' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                <span className="text-xs font-medium" style={{ color: C.textSec }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Users by Country ── */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Users by Country</h3>
              <Globe className="h-3.5 w-3.5" style={{ color: C.textDim }} />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
            {/* Left: World map placeholder with heat indicators */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-full lg:w-[180px]">
              <svg viewBox="0 0 200 100" className="w-full max-w-[180px]" style={{ opacity: 0.6 }}>
                <rect x="10" y="15" width="50" height="30" rx="4" fill="#8B5CF6" opacity="0.3" />
                <rect x="35" y="20" width="20" height="10" rx="2" fill="#8B5CF6" opacity="0.6" />
                <rect x="65" y="10" width="40" height="45" rx="4" fill="#8B5CF6" opacity="0.2" />
                <rect x="75" y="15" width="15" height="15" rx="2" fill="#8B5CF6" opacity="0.5" />
                <rect x="110" y="20" width="35" height="35" rx="4" fill="#8B5CF6" opacity="0.25" />
                <rect x="120" y="28" width="10" height="10" rx="2" fill="#8B5CF6" opacity="0.6" />
                <rect x="150" y="12" width="35" height="30" rx="4" fill="#8B5CF6" opacity="0.35" />
                <rect x="158" y="18" width="12" height="12" rx="2" fill="#8B5CF6" opacity="0.7" />
                <rect x="30" y="55" width="45" height="30" rx="4" fill="#8B5CF6" opacity="0.15" />
                <rect x="80" y="60" width="30" height="25" rx="4" fill="#8B5CF6" opacity="0.2" />
                <rect x="15" y="50" width="5" height="5" rx="2.5" fill="#EF4444" opacity="0.9" />
                <rect x="95" y="18" width="5" height="5" rx="2.5" fill="#F97316" opacity="0.9" />
                <rect x="75" y="32" width="4" height="4" rx="2" fill="#EAB308" opacity="0.8" />
                <rect x="165" y="25" width="4" height="4" rx="2" fill="#F97316" opacity="0.8" />
              </svg>
              {/* Color scale legend */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px]" style={{ color: C.textDim }}>Low</span>
                <div className="flex gap-0.5">
                  <div className="w-4 h-2 rounded-sm" style={{ background: '#8B5CF6', opacity: 0.15 }} />
                  <div className="w-4 h-2 rounded-sm" style={{ background: '#8B5CF6', opacity: 0.3 }} />
                  <div className="w-4 h-2 rounded-sm" style={{ background: '#8B5CF6', opacity: 0.5 }} />
                  <div className="w-4 h-2 rounded-sm" style={{ background: '#8B5CF6', opacity: 0.7 }} />
                  <div className="w-4 h-2 rounded-sm" style={{ background: '#8B5CF6', opacity: 0.9 }} />
                </div>
                <span className="text-[9px]" style={{ color: C.textDim }}>High</span>
              </div>
            </div>

            {/* Right: Country list */}
            <div className="flex-1 space-y-2.5 max-h-[260px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {filteredCountries.map((c, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{c.flag}</span>
                      <span className="text-xs" style={{ color: C.textSec }}>{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{c.count}</span>
                      <span className="text-[10px]" style={{ color: C.textTer }}>({c.pct}%)</span>
                    </div>
                  </div>
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(c.pct / 27.7) * 100}%`,
                        background: '#8B5CF6',
                        maxWidth: '100%',
                        opacity: 1 - idx * 0.1,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          4. TOP ACTIVE PAGES + USERS BY DEVICE
          ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* ── Top Active Pages ── */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Top Active Pages</h3>
              <Zap className="h-3.5 w-3.5" style={{ color: C.textDim }} />
            </div>
            <button
              className="text-[11px] font-medium transition-colors hover:underline"
              style={{ color: C.info }}
            >
              View All
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {topPages.map((p, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: C.textSec }}>
                    {p.page}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">{p.users.toLocaleString()}</span>
                    <span className="text-[10px]" style={{ color: C.textTer }}>{p.pct}%</span>
                  </div>
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(p.pct / 28.6) * 100}%`,
                      background: '#8B5CF6',
                      maxWidth: '100%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Users by Device (Donut) ── */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-white">Users by Device</h3>
          </div>
          <div className="flex justify-center">
            <DonutChart data={deviceData} centerValue="2,458" centerLabel="users" />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          5. ONLINE USERS LIST
          ════════════════════════════════════════ */}
      <div
        className="rounded-2xl p-3 sm:p-4"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-white">Online Users List</h3>

          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: C.textDim }} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setUserPage(1);
              }}
              className="pl-8 pr-8 py-1.5 rounded-lg text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 w-full sm:w-[200px]"
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}` }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setUserPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:text-white transition-colors"
                style={{ color: C.textDim }}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Device Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl mb-4 w-fit" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {deviceTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setDeviceFilter(tab);
                setUserPage(1);
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all"
              style={{
                background: deviceFilter === tab ? C.accent : 'transparent',
                color: deviceFilter === tab ? '#fff' : C.textTer,
              }}
            >
              {tab !== 'All Users' && <DeviceIcon device={tab} />}
              {tab}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${C.border}` }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['User', 'Device', 'Location / IP', 'Current Page', 'Session Time', 'Last Active', 'Action'].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: C.textTer }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8" style={{ color: C.textDim }}>
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t transition-colors hover:bg-white/[0.02]"
                    style={{ borderColor: C.border }}
                  >
                    {/* User */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-bold text-white flex-shrink-0"
                          style={{ background: `${user.avatarColor}30`, color: user.avatarColor }}
                        >
                          {user.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{user.name}</p>
                          <p className="text-[10px] truncate" style={{ color: C.textTer }}>{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Device */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5" style={{ color: C.textSec }}>
                        <DeviceIcon device={user.device} />
                        <span>{user.device}</span>
                      </div>
                    </td>

                    {/* Location / IP */}
                    <td className="px-3 py-3">
                      <div className="min-w-0">
                        <p className="text-xs text-white flex items-center gap-1.5">
                          <span>{user.flag}</span>
                          <span className="truncate">{user.location}</span>
                        </p>
                        <p className="text-[10px]" style={{ color: C.textDim }}>{user.ip}</p>
                      </div>
                    </td>

                    {/* Current Page */}
                    <td className="px-3 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}
                      >
                        {user.currentPage}
                      </span>
                    </td>

                    {/* Session Time */}
                    <td className="px-3 py-3 whitespace-nowrap" style={{ color: C.textSec }}>
                      {user.sessionTime}
                    </td>

                    {/* Last Active */}
                    <td className="px-3 py-3 whitespace-nowrap" style={{ color: C.textTer }}>
                      {user.lastActive}
                    </td>

                    {/* Action */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]"
                          style={{ color: C.textSec }}
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]"
                          style={{ color: C.textSec }}
                          title="Kick"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06] hover:text-red-400"
                          style={{ color: C.textSec }}
                          title="Ban"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between mt-4 pt-3"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <span className="text-[11px]" style={{ color: C.textTer }}>
              Showing {(userPage - 1) * rowsPerPage + 1}–
              {Math.min(userPage * rowsPerPage, filteredUsers.length)} of {filteredUsers.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                disabled={userPage === 1}
                className="p-1.5 rounded-md transition-colors hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: C.textTer }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setUserPage(page)}
                  className="w-7 h-7 rounded-md text-xs font-medium transition-colors"
                  style={{
                    background: page === userPage ? C.accent : 'transparent',
                    color: page === userPage ? 'white' : C.textTer,
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setUserPage((p) => Math.min(totalPages, p + 1))}
                disabled={userPage === totalPages}
                className="p-1.5 rounded-md transition-colors hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: C.textTer }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          6. REAL-TIME ACTIVITY FEED
          ════════════════════════════════════════ */}
      <div
        className="rounded-2xl p-3 sm:p-4"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">Real-time Activity Feed</h3>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold"
              style={{ background: 'rgba(70,211,105,0.15)', color: C.success }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: C.success }} />
              LIVE
            </span>
          </div>
          <button
            className="text-[11px] font-medium transition-colors hover:underline"
            style={{ color: C.info }}
          >
            View All
          </button>
        </div>

        <div className="space-y-0">
          {activityFeed.map((entry, idx) => {
            const ActivityIcon = entry.ActivityIcon;
            return (
              <div
                key={entry.id}
                className="flex items-start gap-3 py-3 transition-colors hover:bg-white/[0.02] rounded-lg px-2"
                style={{
                  borderBottom: idx < activityFeed.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                {/* Avatar */}
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ background: `${entry.avatarColor}30`, color: entry.avatarColor }}
                >
                  {entry.initials}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white">
                    <span className="font-semibold">{entry.userName}</span>{' '}
                    <span style={{ color: C.textSec }}>{entry.activity}</span>
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>{entry.timestamp}</p>
                </div>

                {/* Activity Icon */}
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 mt-0.5"
                  style={{ background: `${entry.iconColor}15` }}
                >
                  <ActivityIcon className="h-4 w-4" style={{ color: entry.iconColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
