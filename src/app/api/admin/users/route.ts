import { NextRequest, NextResponse } from 'next/server'

// ── In-memory mock users (no User model in schema) ─────────────────
interface MockUser {
  id: string
  username: string
  email: string
  avatar: string
  role: 'viewer' | 'subscriber' | 'moderator' | 'admin'
  isOnline: boolean
  lastSeen: string
  watchTimeMinutes: number
  joinedAt: string
  subscriptionPlan: string | null
  messagesSent: number
}

let mockUsers: MockUser[] = [
  {
    id: 'usr-001',
    username: 'sportsFan_42',
    email: 'sportsfan42@email.com',
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=SF',
    role: 'subscriber',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    watchTimeMinutes: 2340,
    joinedAt: '2024-06-15T10:30:00Z',
    subscriptionPlan: 'Premium',
    messagesSent: 187,
  },
  {
    id: 'usr-002',
    username: 'cricketKing',
    email: 'cricketking@email.com',
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=CK',
    role: 'moderator',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    watchTimeMinutes: 5120,
    joinedAt: '2024-03-22T08:15:00Z',
    subscriptionPlan: 'Enterprise',
    messagesSent: 942,
  },
  {
    id: 'usr-003',
    username: 'goalGetter',
    email: 'goalgetter@email.com',
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=GG',
    role: 'viewer',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    watchTimeMinutes: 680,
    joinedAt: '2024-09-10T14:00:00Z',
    subscriptionPlan: null,
    messagesSent: 34,
  },
  {
    id: 'usr-004',
    username: 'tennisAce',
    email: 'tennisace@email.com',
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=TA',
    role: 'subscriber',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    watchTimeMinutes: 3890,
    joinedAt: '2024-05-01T20:45:00Z',
    subscriptionPlan: 'Basic',
    messagesSent: 256,
  },
  {
    id: 'usr-005',
    username: 'hoopDreams',
    email: 'hoopdreams@email.com',
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=HD',
    role: 'viewer',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    watchTimeMinutes: 1250,
    joinedAt: '2024-07-18T12:30:00Z',
    subscriptionPlan: null,
    messagesSent: 78,
  },
  {
    id: 'usr-006',
    username: 'raceFanatic',
    email: 'racefanatic@email.com',
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=RF',
    role: 'subscriber',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    watchTimeMinutes: 2100,
    joinedAt: '2024-08-05T16:20:00Z',
    subscriptionPlan: 'Premium',
    messagesSent: 145,
  },
  {
    id: 'usr-007',
    username: 'fieldMarshal',
    email: 'fieldmarshal@email.com',
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=FM',
    role: 'viewer',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    watchTimeMinutes: 420,
    joinedAt: '2024-11-02T09:00:00Z',
    subscriptionPlan: null,
    messagesSent: 12,
  },
  {
    id: 'usr-008',
    username: 'streamAdmin',
    email: 'admin@sportix.live',
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=SA',
    role: 'admin',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    watchTimeMinutes: 8900,
    joinedAt: '2024-01-01T00:00:00Z',
    subscriptionPlan: 'Enterprise',
    messagesSent: 3201,
  },
]

// ── GET /api/admin/users ──────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const sortBy = searchParams.get('sortBy') ?? 'joinedAt'
    const sortOrder = searchParams.get('sortOrder') ?? 'desc'

    let filtered = [...mockUsers]

    // Filter by role
    if (role && role !== 'all') {
      filtered = filtered.filter((u) => u.role === role)
    }

    // Search by username or email
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      )
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof MockUser]
      const bVal = b[sortBy as keyof MockUser]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortOrder === 'asc'
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal)
      }
      return 0
    })

    // Paginate
    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    // Stats
    const onlineCount = mockUsers.filter((u) => u.isOnline).length
    const subscriberCount = mockUsers.filter(
      (u) => u.role === 'subscriber',
    ).length
    const totalWatchTime = mockUsers.reduce(
      (acc, u) => acc + u.watchTimeMinutes,
      0,
    )

    return NextResponse.json({
      success: true,
      data: {
        users: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalUsers: mockUsers.length,
          onlineCount,
          subscriberCount,
          totalWatchTimeMinutes: totalWatchTime,
          avgWatchTimeMinutes: Math.round(totalWatchTime / mockUsers.length),
        },
      },
    })
  } catch (error) {
    console.error('[Users API] GET Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 },
    )
  }
}

// ── POST /api/admin/users ─────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, role, subscriptionPlan } = body

    if (!username || !email) {
      return NextResponse.json(
        { success: false, error: 'Username and email are required' },
        { status: 400 },
      )
    }

    // Check for duplicates
    if (mockUsers.some((u) => u.email === email)) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 },
      )
    }

    const newUser: MockUser = {
      id: `usr-${String(mockUsers.length + 1).padStart(3, '0')}`,
      username,
      email,
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(username.slice(0, 2).toUpperCase())}`,
      role: role ?? 'viewer',
      isOnline: false,
      lastSeen: new Date().toISOString(),
      watchTimeMinutes: 0,
      joinedAt: new Date().toISOString(),
      subscriptionPlan: subscriptionPlan ?? null,
      messagesSent: 0,
    }

    mockUsers.push(newUser)

    return NextResponse.json(
      { success: true, data: newUser, message: 'User created successfully' },
      { status: 201 },
    )
  } catch (error) {
    console.error('[Users API] POST Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 },
    )
  }
}

// ── DELETE /api/admin/users ───────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 },
      )
    }

    const userIndex = mockUsers.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      )
    }

    const deletedUser = mockUsers[userIndex]

    // Prevent deleting admin users
    if (deletedUser.role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete admin users' },
        { status: 403 },
      )
    }

    mockUsers.splice(userIndex, 1)

    return NextResponse.json({
      success: true,
      data: deletedUser,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('[Users API] DELETE Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 },
    )
  }
}
