import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./db"
import { sendWelcomeEmail } from "./email/send"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { company: true }
        })

        if (!user || !user.hashedPassword) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isValid) {
          return null
        }

        if (user.role === "COMPANY" && user.company) {
          if (user.company.status === "ARCHIVED") {
            throw new Error("Company is archived. Please contact info@suverse.io")
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: user.company?.legalName ?? null,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.name = user.name || token.name
        token.companyId = user.companyId
        token.companyName = user.companyName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string | null
        session.user.companyId = token.companyId as string | null
        session.user.companyName = token.companyName as string | null
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
  events: {
    async createUser({ user }) {
      try {
        const email = user?.email as string | undefined;
        const name = (user as any)?.name || (user as any)?.companyName || undefined;
        if (email) {
          const r = await sendWelcomeEmail(email, name);
          if (!r.ok) console.error('[Auth:createUser] email failed:', r.error);
        } else {
          console.warn('[Auth:createUser] user has no email');
        }
      } catch (e: any) {
        console.error('[Auth:createUser] exception:', e?.message || e);
      }
    },
  },
}
