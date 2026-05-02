import { NextRequest, NextResponse } from 'next/server'

// ── Settings types ────────────────────────────────────────────────
interface SiteSettings {
  siteName: string
  siteDescription: string
  logoUrl: string
  primaryColor: string
  accentColor: string
  maxConcurrentStreams: number
  defaultStreamQuality: string
  enableRecording: boolean
  recordingFormat: string
  recordingRetentionDays: number
  chatEnabled: boolean
  chatSlowMode: boolean
  chatSlowModeInterval: number
  chatMaxLength: number
  chatProfanityFilter: boolean
  enableSubOnlyChat: boolean
  enableEmotes: boolean
  maxViewersPerStream: number
  enableDvr: boolean
  dvrWindowMinutes: number
  maintenanceMode: boolean
  maintenanceMessage: string
  analyticsEnabled: boolean
  autoStartStreams: boolean
  defaultThumbnailUrl: string
  socialLinks: {
    twitter: string
    instagram: string
    youtube: string
    discord: string
  }
}

// ── Default settings ──────────────────────────────────────────────
const defaultSettings: SiteSettings = {
  siteName: 'Sportix Live',
  siteDescription: 'Premium live sports streaming platform',
  logoUrl: '/sportix-logo.png',
  primaryColor: '#00ff88',
  accentColor: '#00cc6a',
  maxConcurrentStreams: 5,
  defaultStreamQuality: 'auto',
  enableRecording: true,
  recordingFormat: 'mp4',
  recordingRetentionDays: 30,
  chatEnabled: true,
  chatSlowMode: false,
  chatSlowModeInterval: 10,
  chatMaxLength: 500,
  chatProfanityFilter: true,
  enableSubOnlyChat: false,
  enableEmotes: true,
  maxViewersPerStream: 100000,
  enableDvr: true,
  dvrWindowMinutes: 120,
  maintenanceMode: false,
  maintenanceMessage: 'Sportix Live is undergoing scheduled maintenance. We will be back shortly!',
  analyticsEnabled: true,
  autoStartStreams: false,
  defaultThumbnailUrl: '/thumbnails/default.jpg',
  socialLinks: {
    twitter: 'https://twitter.com/sportixlive',
    instagram: 'https://instagram.com/sportixlive',
    youtube: 'https://youtube.com/@sportixlive',
    discord: 'https://discord.gg/sportixlive',
  },
}

// ── In-memory settings store (persists across requests) ───────────
let currentSettings: SiteSettings = { ...defaultSettings }

// ── GET /api/admin/settings ───────────────────────────────────────
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        settings: currentSettings,
        groups: [
          {
            id: 'general',
            label: 'General',
            description: 'Site-wide settings and branding',
            keys: ['siteName', 'siteDescription', 'logoUrl', 'primaryColor', 'accentColor'],
          },
          {
            id: 'streaming',
            label: 'Streaming',
            description: 'Stream configuration and limits',
            keys: ['maxConcurrentStreams', 'defaultStreamQuality', 'maxViewersPerStream', 'autoStartStreams', 'defaultThumbnailUrl'],
          },
          {
            id: 'recording',
            label: 'Recording',
            description: 'Auto-recording and DVR settings',
            keys: ['enableRecording', 'recordingFormat', 'recordingRetentionDays', 'enableDvr', 'dvrWindowMinutes'],
          },
          {
            id: 'chat',
            label: 'Chat',
            description: 'Live chat moderation and features',
            keys: ['chatEnabled', 'chatSlowMode', 'chatSlowModeInterval', 'chatMaxLength', 'chatProfanityFilter', 'enableSubOnlyChat', 'enableEmotes'],
          },
          {
            id: 'maintenance',
            label: 'Maintenance',
            description: 'Maintenance mode and system status',
            keys: ['maintenanceMode', 'maintenanceMessage'],
          },
          {
            id: 'analytics',
            label: 'Analytics',
            description: 'Tracking and reporting settings',
            keys: ['analyticsEnabled'],
          },
          {
            id: 'social',
            label: 'Social Links',
            description: 'Social media and external links',
            keys: ['socialLinks'],
          },
        ],
      },
    })
  } catch (error) {
    console.error('[Settings API] GET Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 },
    )
  }
}

// ── PUT /api/admin/settings ───────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Settings object is required' },
        { status: 400 },
      )
    }

    // Deep merge settings
    const updatedSettings: SiteSettings = {
      ...currentSettings,
      ...settings,
      // Handle nested socialLinks merge
      socialLinks: {
        ...currentSettings.socialLinks,
        ...(settings.socialLinks ?? {}),
      },
    }

    // Validate specific fields
    if (updatedSettings.maxConcurrentStreams < 1 || updatedSettings.maxConcurrentStreams > 20) {
      return NextResponse.json(
        { success: false, error: 'maxConcurrentStreams must be between 1 and 20' },
        { status: 400 },
      )
    }

    if (updatedSettings.chatSlowModeInterval < 3 || updatedSettings.chatSlowModeInterval > 300) {
      return NextResponse.json(
        { success: false, error: 'chatSlowModeInterval must be between 3 and 300 seconds' },
        { status: 400 },
      )
    }

    if (updatedSettings.chatMaxLength < 50 || updatedSettings.chatMaxLength > 5000) {
      return NextResponse.json(
        { success: false, error: 'chatMaxLength must be between 50 and 5000' },
        { status: 400 },
      )
    }

    const validQualities = ['auto', '1080p', '720p', '480p', '360p']
    if (!validQualities.includes(updatedSettings.defaultStreamQuality)) {
      return NextResponse.json(
        { success: false, error: `defaultStreamQuality must be one of: ${validQualities.join(', ')}` },
        { status: 400 },
      )
    }

    const validFormats = ['mp4', 'mkv', 'webm']
    if (!validFormats.includes(updatedSettings.recordingFormat)) {
      return NextResponse.json(
        { success: false, error: `recordingFormat must be one of: ${validFormats.join(', ')}` },
        { status: 400 },
      )
    }

    currentSettings = updatedSettings

    return NextResponse.json({
      success: true,
      data: currentSettings,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    console.error('[Settings API] PUT Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 },
    )
  }
}
