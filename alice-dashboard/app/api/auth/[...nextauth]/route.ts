import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Hardcoded admin credentials
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'alice2026'

        if (credentials?.username === ADMIN_USERNAME && credentials?.password === ADMIN_PASSWORD) {
          return {
            id: '1',
            name: 'Admin',
            email: 'admin@alice.com',
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || 'alice-secret-key-change-in-production',
})

export { handler as GET, handler as POST }
