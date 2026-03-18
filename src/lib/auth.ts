import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.profile.findUnique({
          where: { email: credentials.email },
        })

        if (!user) return null
        if (user.status === 'inativo') throw new Error('Conta inativa')

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          perfil: user.perfil,
          cota_mensal: user.cota_mensal,
          cota_usada: user.cota_usada,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.perfil = (user as any).perfil
        token.cota_mensal = (user as any).cota_mensal
        token.cota_usada = (user as any).cota_usada
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).perfil = token.perfil
        ;(session.user as any).cota_mensal = token.cota_mensal
        ;(session.user as any).cota_usada = token.cota_usada
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
