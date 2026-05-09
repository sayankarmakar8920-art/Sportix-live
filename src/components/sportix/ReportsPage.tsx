'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Eye,
  Users,
  Clock,
  DollarSign,
  Download,
  Bell,
  Info,
  TrendingUp,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  CreditCard,
  Crown,
  Megaphone,
  HelpCircle,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Globe,
  FileSpreadsheet,
  FileJson,
  File,
  MoreVertical,
  Calendar,
  ArrowUpRight,
  Filter,
  X,
} from 'lucide-react';

// ─── Theme Constants ────────────────────────────────────────────────────────────
const C = {
  bg: '#141414',
  card: '#1a1a1a',
  border: 'rgba(255,255,255,0.08)',
  accent: '#E50914',
  text: '#ffffff',
  textSec: '#b3b3b3',
  textTer: '#808080',
  textDim: '#555555',
  success: '#46d369',
  warning: '#f5c518',
  info: '#0071eb',
  purple: '#9b59b6',
};

// ─── KPI Card Data ──────────────────────────────────────────────────────────────
const kpiCards = [
  {
    title: 'Total Views',
    value: '18.45M',
    change: '+12.5%',
    icon: Eye,
    color: '#3B82F6',
    sparkline: '10,25,18,32,28,45,38,55,48,62,58,72,68,78,85,80,90,88,95,92',
  },
  {
    title: 'Total Users',
    value: '2.78M',
    change: '+8.3%',
    icon: Users,
    color: '#8B5CF6',
    sparkline: '5,12,8,15,18,22,20,28,25,30,35,32,38,42,40,45,48,44,50,52',
  },
  {
    title: 'Watch Time',
    value: '45.62M hrs',
    change: '+15.7%',
    icon: Clock,
    color: '#10B981',
    sparkline: '8,15,12,22,20,30,28,35,32,42,38,48,45,55,52,60,58,65,62,70',
  },
  {
    title: 'Revenue',
    value: '$78,245.60',
    change: '+21.4%',
    icon: DollarSign,
    color: '#F97316',
    sparkline: '12,18,15,25,22,35,30,40,38,48,45,55,52,62,60,70,68,75,72,82',
  },
  {
    title: 'Ad Revenue',
    value: '$24,780.50',
    change: '+16.2%',
    icon: BarChart3,
    color: '#EC4899',
    sparkline: '6,10,8,14,12,18,16,22,20,28,25,32,30,36,34,40,38,44,42,48',
  },
  {
    title: 'Active Users',
    value: '1.25M',
    change: '+10.8%',
    icon: Users,
    color: '#06B6D4',
    sparkline: '8,14,10,18,16,24,22,30,28,36,34,42,40,48,46,52,50,56,54,60',
  },
];

// ─── Performance Chart Data ─────────────────────────────────────────────────────
const perfLabels = ['May 10', 'May 17', 'May 24', 'May 31', 'Jun 7', 'Jun 10'];
const perfYLabels = ['0', '100K', '200K', '300K', '400K', '500K'];
const perfData = {
  Views: [120, 250, 180, 320, 400, 480],
  WatchTime: [80, 150, 130, 220, 300, 380],
  Revenue: [60, 100, 90, 160, 240, 310],
};
const perfColors: Record<string, string> = {
  Views: '#3B82F6',
  WatchTime: '#10B981',
  Revenue: '#F97316',
};

// ─── Traffic Source Data ─────────────────────────────────────────────────────────
const trafficSources = [
  { name: 'Direct', value: 34.9, color: '#3B82F6' },
  { name: 'Organic Search', value: 28.5, color: '#10B981' },
  { name: 'Social Media', value: 18.7, color: '#F97316' },
  { name: 'Referral', value: 11.6, color: '#8B5CF6' },
  { name: 'Others', value: 6.3, color: '#EC4899' },
];

// ─── Top Devices Data ────────────────────────────────────────────────────────────
const topDevices = [
  { name: 'Mobile', value: 50.1, color: '#3B82F6' },
  { name: 'Desktop', value: 33.2, color: '#10B981' },
  { name: 'Tablet', value: 13.3, color: '#F97316' },
  { name: 'TV', value: 3.4, color: '#EC4899' },
];

// ─── Countries Data ──────────────────────────────────────────────────────────────
const countries = [
  { flag: '🇺🇸', name: 'United States', views: '3.25M', percent: 17.6 },
  { flag: '🇮🇳', name: 'India', views: '2.85M', percent: 15.4 },
  { flag: '🇬🇧', name: 'United Kingdom', views: '1.85M', percent: 10.0 },
  { flag: '🇨🇦', name: 'Canada', views: '1.45M', percent: 7.9 },
  { flag: '🇦🇺', name: 'Australia', views: '1.25M', percent: 6.8 },
];

// ─── Reports Summary Data ────────────────────────────────────────────────────────
const reportsSummary = [
  { name: 'Video Performance Report', count: 12, icon: FileText, color: '#3B82F6' },
  { name: 'User Activity Report', count: 8, icon: Activity, color: '#8B5CF6' },
  { name: 'Revenue Report', count: 15, icon: CreditCard, color: '#10B981' },
  { name: 'Subscription Report', count: 7, icon: Crown, color: '#F97316' },
  { name: 'Ads Performance Report', count: 9, icon: Megaphone, color: '#EC4899' },
  { name: 'Support Report', count: 4, icon: HelpCircle, color: '#06B6D4' },
];

// ─── Detailed Reports Table Data ─────────────────────────────────────────────────
const detailedReports = [
  {
    name: 'Video Performance Report - May 2025',
    color: '#3B82F6',
    type: 'Video',
    period: 'May 1-31, 2025',
    generatedOn: 'Jun 1, 10:30 AM',
    generatedBy: 'Admin',
    status: 'Completed',
  },
  {
    name: 'User Activity Report - May 2025',
    color: '#8B5CF6',
    type: 'User',
    period: 'May 1-31, 2025',
    generatedOn: 'Jun 1, 09:45 AM',
    generatedBy: 'Admin',
    status: 'Completed',
  },
  {
    name: 'Revenue Report - May 2025',
    color: '#10B981',
    type: 'Revenue',
    period: 'May 1-31, 2025',
    generatedOn: 'Jun 1, 09:15 AM',
    generatedBy: 'Admin',
    status: 'Completed',
  },
  {
    name: 'Ads Performance Report - May 2025',
    color: '#EC4899',
    type: 'Ads',
    period: 'May 1-31, 2025',
    generatedOn: 'Jun 1, 08:50 AM',
    generatedBy: 'Admin',
    status: 'Completed',
  },
  {
    name: 'Subscription Report - May 2025',
    color: '#F97316',
    type: 'Subscription',
    period: 'May 1-31, 2025',
    generatedOn: 'Jun 1, 08:20 AM',
    generatedBy: 'Admin',
    status: 'Completed',
  },
  {
    name: 'Content Engagement Report - May 2025',
    color: '#06B6D4',
    type: 'Content',
    period: 'May 1-31, 2025',
    generatedOn: 'May 31, 11:15 AM',
    generatedBy: 'Admin',
    status: 'Completed',
  },
  {
    name: 'Geographic Distribution Report - May 2025',
    color: '#9b59b6',
    type: 'Geo',
    period: 'May 1-31, 2025',
    generatedOn: 'May 31, 10:00 AM',
    generatedBy: 'Admin',
    status: 'Pending',
  },
  {
    name: 'Device Analytics Report - May 2025',
    color: '#f5c518',
    type: 'Device',
    period: 'May 1-31, 2025',
    generatedOn: 'May 30, 04:30 PM',
    generatedBy: 'Admin',
    status: 'Completed',
  },
  {
    name: 'Support Tickets Report - May 2025',
    color: '#EF4444',
    type: 'Support',
    period: 'May 1-31, 2025',
    generatedOn: 'May 30, 03:45 PM',
    generatedBy: 'Admin',
    status: 'Failed',
  },
  {
    name: 'Ad Revenue Breakdown - May 2025',
    color: '#3B82F6',
    type: 'Ads',
    period: 'May 1-31, 2025',
    generatedOn: 'May 30, 02:00 PM',
    generatedBy: 'Admin',
    status: 'Completed',
  },
];

// ─── Export Formats ──────────────────────────────────────────────────────────────
const exportFormats = [
  { name: 'PDF', icon: File, color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  { name: 'Excel', icon: FileSpreadsheet, color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  { name: 'CSV', icon: File, color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  { name: 'JSON', icon: FileJson, color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
];

// ─── Sparkline Component ─────────────────────────────────────────────────────────
function Sparkline({ points, color }: { points: string; color: string }) {
  const pts = points.split(',').map(Number);
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  const w = 100;
  const h = 30;
  const step = w / (pts.length - 1);

  const pathPts = pts
    .map((p, i) => `${i * step},${h - ((p - min) / range) * (h - 4) - 2}`)
    .join(' ');

  const areaPts = `${pathPts} ${w},${h} 0,${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#spark-grad-${color.replace('#', '')})`} />
      <polyline points={pathPts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Donut Chart Component ───────────────────────────────────────────────────────
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
      <div className="absolute flex flex-col items-center justify-center" style={{ width: 100, height: 100 }}>
        <span className="text-lg font-bold text-white">{centerValue}</span>
        <span className="text-[10px] text-[#808080]">{centerLabel}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 w-full max-w-[200px]">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#b3b3b3]">{d.name}</span>
              <span className="text-[11px] text-[#808080]">{d.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dropdown Component ──────────────────────────────────────────────────────────
function Dropdown({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#b3b3b3] hover:text-white transition-colors"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {value}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-50 rounded-lg py-1 min-w-[140px] shadow-xl"
            style={{ background: '#222', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/[0.06] transition-colors ${
                  opt === value ? 'text-white' : 'text-[#b3b3b3]'
                }`}
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

// ─── Status Badge ────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    Completed: { bg: 'rgba(70,211,105,0.15)', text: '#46d369' },
    Pending: { bg: 'rgba(245,197,24,0.15)', text: '#f5c518' },
    Failed: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
    Processing: { bg: 'rgba(0,113,235,0.15)', text: '#0071eb' },
  };
  const c = colorMap[status] || colorMap.Pending;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────────
export default function ReportsPage() {
  // State
  const [perfPeriod, setPerfPeriod] = useState('Last 30 Days');
  const [exportFormat, setExportFormat] = useState('PDF');
  const [reportType, setReportType] = useState('All Reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const rowsPerPage = 5;

  // Filtered and paginated reports
  const filteredReports = useMemo(() => {
    return detailedReports.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All Status' || r.status === statusFilter;
      const matchType = typeFilter === 'All Types' || r.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [searchQuery, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);
  const paginatedReports = filteredReports.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleExport = () => {
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 2500);
  };

  // Build SVG line chart points
  const chartW = 700;
  const chartH = 200;
  const padLeft = 45;
  const padRight = 15;
  const padTop = 10;
  const padBot = 30;
  const innerW = chartW - padLeft - padRight;
  const innerH = chartH - padTop - padBot;
  const maxVal = 500;

  const toX = (i: number) => padLeft + (i / (perfLabels.length - 1)) * innerW;
  const toY = (v: number) => padTop + innerH - (v / maxVal) * innerH;

  const gridLines = perfYLabels.map((label, i) => {
    const val = i * 100;
    return { label, y: toY(val) };
  });

  const allTypes = ['All Types', ...Array.from(new Set(detailedReports.map((r) => r.type)))];
  const allStatuses = ['All Status', ...Array.from(new Set(detailedReports.map((r) => r.status)))];

  return (
    <div className="space-y-4 min-w-0" style={{ background: C.bg }}>
      {/* ── 1. Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: `${C.info}15` }}
          >
            <BarChart3 size={20} style={{ color: C.info }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Analytics Dashboard</h1>
            <p className="text-xs text-[#808080]">
              Track, analyze and export detailed platform and ads performance reports
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#b3b3b3]"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Calendar size={14} />
            <span>May 10, 2025 - Jun 10, 2025</span>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors hover:opacity-90"
            style={{ background: C.accent }}
            onClick={handleExport}
          >
            <Download size={14} />
            Export Report
          </button>
          <div className="relative">
            <button
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-white/[0.06]"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Bell size={16} className="text-[#b3b3b3]" />
            </button>
            <span
              className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4.5 h-4.5 rounded-full text-[9px] font-bold text-white"
              style={{ background: C.accent, minWidth: 18, height: 18, fontSize: 9 }}
            >
              12
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. KPI Metric Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl p-4 transition-all hover:border-white/15"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                  style={{ background: `${card.color}18` }}
                >
                  <Icon size={16} style={{ color: card.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[#555555] mb-0.5">
                    {card.title}
                  </p>
                  <p className="text-xl font-bold text-white leading-tight">{card.value}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={12} style={{ color: C.success }} />
                <span className="text-[11px] font-medium" style={{ color: C.success }}>
                  {card.change}
                </span>
                <span className="text-[10px] text-[#808080] ml-0.5">from last 30 days</span>
              </div>
              <div className="mt-3">
                <Sparkline points={card.sparkline} color={card.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Charts Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Performance Overview - Line Chart */}
        <div
          className="lg:col-span-2 rounded-2xl p-3 sm:p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Performance Overview</h3>
              <Info size={14} className="text-[#808080]" />
            </div>
            <Dropdown
              options={['Last 7 Days', 'Last 14 Days', 'Last 30 Days', 'Last 90 Days']}
              value={perfPeriod}
              onChange={setPerfPeriod}
            />
          </div>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              {Object.entries(perfColors).map(([key, color]) => (
                <linearGradient key={key} id={`perf-area-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              ))}
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
              >
                {g.label}
              </text>
            ))}
            {/* X-axis labels */}
            {perfLabels.map((label, i) => (
              <text
                key={`xl-${i}`}
                x={toX(i)}
                y={chartH - 5}
                fill="#555555"
                fontSize="10"
                textAnchor="middle"
              >
                {label}
              </text>
            ))}
            {/* Area fills + lines */}
            {(Object.keys(perfData) as Array<keyof typeof perfData>).map((key) => {
              const data = perfData[key];
              const color = perfColors[key];
              const linePts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
              const areaPts = `${data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')} ${toX(data.length - 1)},${toY(0)} ${toX(0)},${toY(0)}`;
              return (
                <g key={key}>
                  <polygon points={areaPts} fill={`url(#perf-area-${key})`} />
                  <polyline
                    points={linePts}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data points */}
                  {data.map((v, i) => (
                    <circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill={color} stroke="#1a1a1a" strokeWidth="2" />
                  ))}
                </g>
              );
            })}
          </svg>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            {Object.entries(perfColors).map(([key, color]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-[#b3b3b3]">{key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Source - Donut */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-white">Traffic Source</h3>
          </div>
          <div className="relative flex justify-center">
            <DonutChart data={trafficSources} centerValue="18.45M" centerLabel="Total Views" />
          </div>
        </div>

        {/* Top Devices - Donut */}
        <div
          className="rounded-2xl p-3 sm:p-4 lg:col-span-1"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-white">Top Devices</h3>
          </div>
          <div className="relative flex justify-center">
            <DonutChart data={topDevices} centerValue="18.45M" centerLabel="Total Views" />
          </div>
        </div>
      </div>

      {/* ── 4. Second Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4">
        {/* User Engagement */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-white">User Engagement</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Watch Time', value: '45.62M hrs', change: '+15.7%', icon: Clock, color: '#10B981', positive: true },
              { label: 'Avg. Watch Time', value: '00:12:45', change: '+6.3%', icon: Clock, color: '#3B82F6', positive: true },
              { label: 'Views Per User', value: '2.45', change: '+4.8%', icon: Eye, color: '#8B5CF6', positive: true },
              { label: 'Bounce Rate', value: '18.6%', change: '-3.2%', icon: TrendingUp, color: '#EF4444', positive: false },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl p-3 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-lg mb-2"
                    style={{ background: `${item.color}15` }}
                  >
                    <Icon size={14} style={{ color: item.color }} />
                  </div>
                  <p className="text-[10px] text-[#808080] mb-0.5">{item.label}</p>
                  <p className="text-sm font-bold text-white">{item.value}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    <ArrowUpRight
                      size={11}
                      className={item.positive ? '' : 'rotate-90'}
                      style={{ color: item.positive ? C.success : '#EF4444' }}
                    />
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: item.positive ? C.success : '#EF4444' }}
                    >
                      {item.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Countries */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Top Countries</h3>
            <button className="text-[11px] text-[#0071eb] hover:text-[#3390f0] transition-colors">
              View All Countries
            </button>
          </div>
          <div className="space-y-3">
            {countries.map((c, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="text-xs text-[#b3b3b3]">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">{c.views}</span>
                    <span className="text-[10px] text-[#808080]">{c.percent}%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(c.percent / 17.6) * 100}%`, background: '#3B82F6', maxWidth: '100%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reports Summary */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-white">Reports Summary</h3>
          </div>
          <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {reportsSummary.map((r, idx) => {
              const Icon = r.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-white/[0.03]"
                  style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                    style={{ background: `${r.color}15` }}
                  >
                    <Icon size={14} style={{ color: r.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#b3b3b3] truncate">{r.name}</p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `${r.color}15`, color: r.color }}
                  >
                    {String(r.count).padStart(2, '0')}
                  </span>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-3 py-2 rounded-lg text-xs font-medium text-center transition-colors hover:bg-white/[0.04]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: C.info }}
          >
            View All Reports
          </button>
        </div>

        {/* Detailed Reports Table */}
        <div
          className="lg:col-span-2 rounded-2xl p-3 sm:p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Detailed Reports</h3>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#555555]" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 pr-3 py-1.5 rounded-lg text-xs text-white placeholder:text-[#555555] outline-none focus:ring-1 focus:ring-white/20"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555555] hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  showFilters ? 'text-white' : 'text-[#b3b3b3]'
                }`}
                style={{
                  background: showFilters ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Filter size={13} />
                Filters
              </button>
            </div>
          </div>

          {/* Filter bar */}
          {showFilters && (
            <div className="flex items-center gap-2 mb-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Dropdown options={allStatuses} value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} />
              <Dropdown options={allTypes} value={typeFilter} onChange={(v) => { setTypeFilter(v); setCurrentPage(1); }} />
              {(statusFilter !== 'All Status' || typeFilter !== 'All Types') && (
                <button
                  onClick={() => { setStatusFilter('All Status'); setTypeFilter('All Types'); setCurrentPage(1); }}
                  className="text-[11px] text-[#0071eb] hover:text-[#3390f0] transition-colors ml-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#555555] uppercase tracking-wider text-[10px] font-semibold">
                  <th className="text-left py-2 pr-3 font-semibold">Report Name</th>
                  <th className="text-left py-2 px-2 font-semibold">Type</th>
                  <th className="text-left py-2 px-2 font-semibold hidden md:table-cell">Period</th>
                  <th className="text-left py-2 px-2 font-semibold hidden lg:table-cell">Generated On</th>
                  <th className="text-left py-2 px-2 font-semibold hidden lg:table-cell">Generated By</th>
                  <th className="text-left py-2 px-2 font-semibold">Status</th>
                  <th className="text-center py-2 pl-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[#555555]">
                      No reports found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedReports.map((report, idx) => (
                    <tr
                      key={idx}
                      className="border-t transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: report.color }} />
                          <span className="text-[#b3b3b3] truncate max-w-[180px]">{report.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-medium"
                          style={{ background: `${report.color}15`, color: report.color }}
                        >
                          {report.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-[#808080] hidden md:table-cell">{report.period}</td>
                      <td className="py-2.5 px-2 text-[#808080] hidden lg:table-cell">{report.generatedOn}</td>
                      <td className="py-2.5 px-2 text-[#808080] hidden lg:table-cell">{report.generatedBy}</td>
                      <td className="py-2.5 px-2">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="py-2.5 pl-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button className="p-1.5 rounded-md text-[#808080] hover:text-white hover:bg-white/[0.06] transition-colors" title="View">
                            <Eye size={13} />
                          </button>
                          <button className="p-1.5 rounded-md text-[#808080] hover:text-white hover:bg-white/[0.06] transition-colors" title="Download">
                            <Download size={13} />
                          </button>
                          <button className="p-1.5 rounded-md text-[#808080] hover:text-[#EF4444] hover:bg-white/[0.06] transition-colors" title="Delete">
                            <X size={13} />
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
            <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-[11px] text-[#808080]">
                Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredReports.length)} of{' '}
                {filteredReports.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md text-[#808080] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-7 h-7 rounded-md text-xs font-medium transition-colors"
                    style={{
                      background: page === currentPage ? C.accent : 'transparent',
                      color: page === currentPage ? 'white' : '#808080',
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md text-[#808080] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Export Reports Section ───────────────────────────────────────── */}
      <div
        className="rounded-2xl p-3 sm:p-4"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white mb-1">Export Reports</h3>
          <p className="text-xs text-[#808080]">Export detailed reports in multiple formats</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 md:gap-4">
          {/* Format buttons */}
          <div className="flex items-center gap-2">
            {exportFormats.map((fmt) => {
              const Icon = fmt.icon;
              const isActive = exportFormat === fmt.name;
              return (
                <button
                  key={fmt.name}
                  onClick={() => setExportFormat(fmt.name)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive ? 'ring-1 ring-white/20 scale-[1.02]' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    background: fmt.bg,
                    color: fmt.color,
                  }}
                >
                  <Icon size={14} />
                  {fmt.name}
                </button>
              );
            })}
          </div>

          {/* Report type dropdown */}
          <Dropdown
            options={['All Reports', 'Video', 'User', 'Revenue', 'Ads', 'Subscription', 'Support']}
            value={reportType}
            onChange={setReportType}
          />

          {/* Export button */}
          <div className="relative">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: C.accent }}
            >
              <Download size={14} />
              Export Now
            </button>
            {showExportSuccess && (
              <div className="absolute left-1/2 -translate-x-1/2 -top-10 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-lg z-50"
                style={{ background: '#10B981' }}
              >
                Export started successfully!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
