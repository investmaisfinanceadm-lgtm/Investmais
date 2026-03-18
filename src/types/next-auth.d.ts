import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    perfil: 'admin' | 'criador'
    cota_mensal: number
    cota_usada: number
  }

  interface Session {
    user: User & {
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    perfil: 'admin' | 'criador'
    cota_mensal: number
    cota_usada: number
  }
}
