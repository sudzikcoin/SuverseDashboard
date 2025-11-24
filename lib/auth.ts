import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./db"
import { sendWelcomeEmail } from "./email/send"
import { writeAudit } from "./audit"
import { maskEmail, normalizeEmail, logAuth, ReasonCode } from "./auth-diagnostics"
import { getAuthEnv } from "./env"

console.log('[auth] Cookie rotated to sv.session.v2 (invalidates old sessions)');

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const authEnv = getAuthEnv()
        
        if (!authEnv.isValid) {
          logAuth('FAILED', {
            stage: 'env_check',
            emailMasked: '***',
            reasonCode: 'ENV_INVALID',
          })
          return null
        }

        if (!credentials?.email || !credentials?.password) {
          logAuth('FAILED', {
            stage: 'credential_validation',
            emailMasked: credentials?.email ? maskEmail(credentials.email) : '***',
            reasonCode: 'MISSING_CREDENTIALS',
          })
          return null
        }

        const normalizedEmail = normalizeEmail(credentials.email)
        const emailMasked = maskEmail(normalizedEmail)

        try {
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { company: true }
          })

          if (!user || !user.hashedPassword) {
            logAuth('FAILED', {
              stage: 'user_lookup',
              emailMasked,
              reasonCode: 'USER_NOT_FOUND',
            })
            return null
          }

          const hashPrefix = user.hashedPassword.substring(0, 4)
          if (!hashPrefix.startsWith('$2')) {
            logAuth('FAILED', {
              stage: 'hash_check',
              emailMasked,
              reasonCode: 'HASH_MISMATCH',
            })
            console.warn(`[auth] User ${emailMasked} has non-bcrypt hash (prefix: ${hashPrefix})`)
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.hashedPassword
          )

          if (!isValid) {
            logAuth('FAILED', {
              stage: 'password_verify',
              emailMasked,
              reasonCode: 'INVALID_PASSWORD',
            })
            return null
          }

          // Check if email is verified
          if (!user.emailVerifiedAt) {
            logAuth('FAILED', {
              stage: 'email_verification_check',
              emailMasked,
              reasonCode: 'UNVERIFIED_EMAIL',
            })
            throw new Error("UNVERIFIED_EMAIL")
          }

          if (user.role === "COMPANY" && user.company) {
            if (user.company.status === "ARCHIVED") {
              logAuth('FAILED', {
                stage: 'company_check',
                emailMasked,
                reasonCode: 'COMPANY_ARCHIVED',
              })
              throw new Error("Company is archived. Please contact info@suverse.io")
            }
          }

          logAuth('SUCCESS', {
            stage: 'complete',
            emailMasked,
            reasonCode: 'SUCCESS',
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
            companyName: user.company?.legalName ?? null,
          }
        } catch (error: any) {
          logAuth('FAILED', {
            stage: 'exception',
            emailMasked,
            reasonCode: 'DB_ERROR',
          })
          console.error('[auth] Exception during authorize:', error.message)
          return null
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
  secret: getAuthEnv().secret,
  debug: false,
  cookies: {
    sessionToken: {
      name: `sv.session.v2`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  events: {
    async createUser({ user }) {
      try {
        const email = user?.email as string | undefined;
        const name = (user as any)?.name || (user as any)?.companyName || undefined;
        const userId = user?.id;
        if (email) {
          const r = await sendWelcomeEmail(email, name, userId);
          if (!r.ok) {
            console.error('[mail:welcome] email failed:', r.error);
          } else {
            console.log('[mail:welcome] email sent successfully');
          }
        } else {
          console.warn('[mail:welcome] user has no email');
        }
      } catch (e: any) {
        console.error('[mail:welcome] exception:', e?.message || e);
      }
    },
    async signIn({ user }) {
      try {
        if (user?.id && user?.email) {
          await writeAudit({
            actorId: user.id,
            actorEmail: user.email,
            action: "LOGIN",
            entity: "USER",
            entityId: user.id,
            details: { method: "credentials" },
            skipRequestContext: true,
          })
        }
      } catch (e: any) {
        console.error('[audit:login] Failed to log login event:', e?.message || e)
      }
    },
  },
}
