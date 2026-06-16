import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "../../../../lib/prisma"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email }
        })
        if (!user) return null

        const passwordMatch = await bcrypt.compare(credentials?.password!, user.password)
        if (!passwordMatch) return null

        if (user.role !== 'ADMIN') return null

        return user
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }