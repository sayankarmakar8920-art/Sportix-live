import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if data already exists
    const existingStreams = await db.stream.count()
    if (existingStreams > 0) {
      return NextResponse.json({ message: 'Database already seeded' })
    }

    // Seed live streams
    const streams = await Promise.all([
      db.stream.create({
        data: {
          title: 'UEFA Champions League — Semi Final',
          description: 'Watch the intense semi-final clash between two European giants',
          thumbnail: '',
          category: 'football',
          status: 'live',
          viewerCount: 48293,
          peakViewers: 52000,
          fps: 60,
          bitrate: 4500,
          isFeatured: true,
          homeTeam: 'Barcelona',
          awayTeam: 'Bayern Munich',
          homeScore: 2,
          awayScore: 1,
          matchTime: "67'",
          startTime: new Date(),
        },
      }),
      db.stream.create({
        data: {
          title: 'Premier League — Title Race',
          description: 'Arsenal vs Manchester City in a crucial title decider',
          thumbnail: '',
          category: 'football',
          status: 'live',
          viewerCount: 32156,
          peakViewers: 38000,
          fps: 60,
          bitrate: 4500,
          isFeatured: true,
          homeTeam: 'Arsenal',
          awayTeam: 'Man City',
          homeScore: 1,
          awayScore: 1,
          matchTime: 'HT',
          startTime: new Date(),
        },
      }),
      db.stream.create({
        data: {
          title: 'NBA Playoffs — Game 5',
          description: 'Eastern Conference Finals Game 5',
          thumbnail: '',
          category: 'basketball',
          status: 'live',
          viewerCount: 28441,
          peakViewers: 31000,
          fps: 60,
          bitrate: 5000,
          isFeatured: true,
          homeTeam: 'Lakers',
          awayTeam: 'Celtics',
          homeScore: 87,
          awayScore: 92,
          matchTime: "Q3 4:22",
          startTime: new Date(),
        },
      }),
      db.stream.create({
        data: {
          title: 'La Liga — El Clásico',
          description: 'The biggest rivalry in world football',
          thumbnail: '',
          category: 'football',
          status: 'live',
          viewerCount: 67890,
          peakViewers: 72000,
          fps: 60,
          bitrate: 4500,
          isFeatured: true,
          homeTeam: 'Real Madrid',
          awayTeam: 'Atlético Madrid',
          homeScore: 3,
          awayScore: 2,
          matchTime: "82'",
          startTime: new Date(),
        },
      }),
      db.stream.create({
        data: {
          title: 'Formula 1 — Monaco Grand Prix',
          description: 'The crown jewel of Formula 1 racing',
          thumbnail: '',
          category: 'racing',
          status: 'live',
          viewerCount: 19234,
          peakViewers: 22000,
          fps: 60,
          bitrate: 6000,
          isFeatured: false,
          homeTeam: 'Verstappen',
          awayTeam: 'Hamilton',
          homeScore: 1,
          awayScore: 2,
          matchTime: 'Lap 45/78',
          startTime: new Date(),
        },
      }),
      db.stream.create({
        data: {
          title: 'Tennis — Wimbledon Final',
          description: 'The pinnacle of grass court tennis',
          thumbnail: '',
          category: 'tennis',
          status: 'offline',
          viewerCount: 0,
          peakViewers: 0,
          isFeatured: false,
          homeTeam: 'Djokovic',
          awayTeam: 'Alcaraz',
          homeScore: 0,
          awayScore: 0,
          matchTime: 'Upcoming',
          startTime: new Date(Date.now() + 86400000),
        },
      }),
    ])

    // Seed videos (highlights)
    await Promise.all([
      db.video.create({
        data: {
          title: '⚽ Champions League Best Goals — Round of 16',
          description: 'All the incredible goals from the knockout stage',
          thumbnail: '',
          duration: 842,
          category: 'highlights',
          views: 1245000,
          isFeatured: true,
          streamId: streams[0].id,
        },
      }),
      db.video.create({
        data: {
          title: '🏀 NBA Top 10 Plays of the Week',
          description: 'The most spectacular plays from this week in the NBA',
          thumbnail: '',
          duration: 615,
          category: 'highlights',
          views: 892000,
          isFeatured: true,
          streamId: streams[2].id,
        },
      }),
      db.video.create({
        data: {
          title: '🏎️ Monaco GP Qualifying Highlights',
          description: 'All the action from qualifying at Monte Carlo',
          thumbnail: '',
          duration: 428,
          category: 'highlights',
          views: 567000,
          isFeatured: false,
          streamId: streams[4].id,
        },
      }),
      db.video.create({
        data: {
          title: '⚽ Premier League Goals of the Month',
          description: 'The most stunning goals from the Premier League this month',
          thumbnail: '',
          duration: 960,
          category: 'highlights',
          views: 2340000,
          isFeatured: true,
        },
      }),
      db.video.create({
        data: {
          title: '🎾 Wimbledon Day 5 Recap',
          description: 'All the key moments from day 5 at the All England Club',
          thumbnail: '',
          duration: 723,
          category: 'highlights',
          views: 445000,
          isFeatured: false,
        },
      }),
      db.video.create({
        data: {
          title: '⚽ El Clásico — Classic Moments',
          description: 'Relive the greatest El Clásico moments of all time',
          thumbnail: '',
          duration: 1420,
          category: 'highlights',
          views: 8900000,
          isFeatured: true,
        },
      }),
    ])

    // Seed continue watching
    await Promise.all([
      db.continueWatching.create({
        data: {
          videoId: 'cw1',
          title: 'Champions League Semi Final Recap',
          thumbnail: '',
          duration: 1200,
          progress: 0.65,
        },
      }),
      db.continueWatching.create({
        data: {
          videoId: 'cw2',
          title: 'NBA Playoffs Game 3 Highlights',
          thumbnail: '',
          duration: 900,
          progress: 0.32,
        },
      }),
      db.continueWatching.create({
        data: {
          videoId: 'cw3',
          title: 'Premier League Review Show',
          thumbnail: '',
          duration: 2700,
          progress: 0.88,
        },
      }),
    ])

    // Seed some chat messages
    await Promise.all([
      db.chatMessage.create({
        data: { streamId: streams[0].id, username: 'FootballFan99', message: 'What a goal by Lewandowski! 🎯' },
      }),
      db.chatMessage.create({
        data: { streamId: streams[0].id, username: 'Barca4Life', message: 'LET\'S GOOO BARÇA! 🔵🔴' },
      }),
      db.chatMessage.create({
        data: { streamId: streams[0].id, username: 'SoccerExpert', message: 'Bayern needs to push forward, they are trailing' },
      }),
      db.chatMessage.create({
        data: { streamId: streams[0].id, username: 'TacticalNerd', message: 'Xavi\'s substitution changed the game completely', isAdmin: true },
      }),
      db.chatMessage.create({
        data: { streamId: streams[0].id, username: 'GoalMachine', message: 'That pass was insane 🤯' },
      }),
    ])

    return NextResponse.json({ message: 'Database seeded successfully', streamCount: streams.length })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
