import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          return null
        }

        // Mark user as online and update login count
        await db.user.update({
          where: { id: user.id },
          data: {
            isOnline: true,
            lastSeen: new Date(),
            loginCount: { increment: 1 },
          },
        })

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        (session.user as any).role = token.role
      }
      return session
    },
    async signIn({ user }) {
      if (user?.id) {
        // Emit socket event via fetch to notify admin
        fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, action: 'login', name: user.name }),
        }).catch(() => {})
      }
      return true
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.id) {
        await db.user.update({
          where: { id: token.id as string },
          data: { isOnline: false, lastSeen: new Date() },
        }).catch(() => {})
        fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: token.id, action: 'logout', name: token.name }),
        }).catch(() => {})
      }
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET || 'sportix-live-secret-key-2024',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
