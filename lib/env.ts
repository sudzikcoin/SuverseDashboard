import { z } from "zod";

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_BASE_CHAIN_ID: z.coerce.number().int().positive(),
  NEXT_PUBLIC_USDC_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  NEXT_PUBLIC_ESCROW_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  NEXT_PUBLIC_PLATFORM_FEE_BPS: z.coerce.number().int().min(0).max(10000),
  NEXT_PUBLIC_USDC_DECIMALS: z.coerce.number().int().min(0).max(18),
});

const EmailEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(10, 'RESEND_API_KEY missing or too short'),
  RESEND_FROM: z.string().email('RESEND_FROM must be a valid email').or(z.literal('onboarding@resend.dev')),
});

const TelegramEnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(10).optional(),
  TELEGRAM_CHAT_ID: z.string().min(1).optional(),
  ENABLE_TELEGRAM: z.coerce.boolean().default(false),
});

const CronEnvSchema = z.object({
  CRON_SECRET: z.string().min(16).optional(),
});

const AuthEnvSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET too short (min 32 chars)'),
  SESSION_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  AUTH_TRUST_HOST: z.coerce.boolean().default(true),
});

const WalletEnvSchema = z.object({
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().default("MISSING"),
});

const ServerEnvSchema = PublicEnvSchema.merge(EmailEnvSchema).merge(TelegramEnvSchema).merge(CronEnvSchema);

type PublicEnv = z.infer<typeof PublicEnvSchema>;

const DEFAULTS: PublicEnv = {
  NEXT_PUBLIC_BASE_CHAIN_ID: 8453,
  NEXT_PUBLIC_USDC_ADDRESS: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  NEXT_PUBLIC_ESCROW_ADDRESS: "0xf0b86c1E38ed881e3C94b8096DFE6FD1a71F8721",
  NEXT_PUBLIC_PLATFORM_FEE_BPS: 100,
  NEXT_PUBLIC_USDC_DECIMALS: 6,
};

function parseEnv(raw: Record<string, string | undefined>): PublicEnv {
  const parsed = PublicEnvSchema.safeParse({
    NEXT_PUBLIC_BASE_CHAIN_ID: raw.NEXT_PUBLIC_BASE_CHAIN_ID,
    NEXT_PUBLIC_USDC_ADDRESS: raw.NEXT_PUBLIC_USDC_ADDRESS,
    NEXT_PUBLIC_ESCROW_ADDRESS: raw.NEXT_PUBLIC_ESCROW_ADDRESS,
    NEXT_PUBLIC_PLATFORM_FEE_BPS: raw.NEXT_PUBLIC_PLATFORM_FEE_BPS,
    NEXT_PUBLIC_USDC_DECIMALS: raw.NEXT_PUBLIC_USDC_DECIMALS,
  });

  if (parsed.success) {
    return parsed.data;
  }

  if (typeof window !== "undefined") {
    console.warn(
      "[env] Validation failed, using defaults:",
      parsed.error.flatten().fieldErrors
    );
  }

  function safeInt(val: string | undefined, min: number, max: number, fallback: number): number {
    const n = Number(val);
    if (!Number.isFinite(n) || n < min || n > max) return fallback;
    return Math.floor(n);
  }

  const merged: PublicEnv = {
    NEXT_PUBLIC_BASE_CHAIN_ID: safeInt(raw.NEXT_PUBLIC_BASE_CHAIN_ID, 1, 999999, DEFAULTS.NEXT_PUBLIC_BASE_CHAIN_ID),
    NEXT_PUBLIC_USDC_ADDRESS: 
      (raw.NEXT_PUBLIC_USDC_ADDRESS && /^0x[a-fA-F0-9]{40}$/.test(raw.NEXT_PUBLIC_USDC_ADDRESS))
        ? raw.NEXT_PUBLIC_USDC_ADDRESS
        : DEFAULTS.NEXT_PUBLIC_USDC_ADDRESS,
    NEXT_PUBLIC_ESCROW_ADDRESS:
      (raw.NEXT_PUBLIC_ESCROW_ADDRESS && /^0x[a-fA-F0-9]{40}$/.test(raw.NEXT_PUBLIC_ESCROW_ADDRESS))
        ? raw.NEXT_PUBLIC_ESCROW_ADDRESS
        : DEFAULTS.NEXT_PUBLIC_ESCROW_ADDRESS,
    NEXT_PUBLIC_PLATFORM_FEE_BPS: safeInt(raw.NEXT_PUBLIC_PLATFORM_FEE_BPS, 0, 10000, DEFAULTS.NEXT_PUBLIC_PLATFORM_FEE_BPS),
    NEXT_PUBLIC_USDC_DECIMALS: safeInt(raw.NEXT_PUBLIC_USDC_DECIMALS, 0, 18, DEFAULTS.NEXT_PUBLIC_USDC_DECIMALS),
  };

  return merged;
}

export const env = parseEnv(process.env as Record<string, string | undefined>);

export const clientEnv = env;

export function getEmailEnv() {
  const parsed = EmailEnvSchema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM: process.env.RESEND_FROM || 'onboarding@resend.dev',
  });

  if (!parsed.success) {
    console.error('[env] Email validation failed:', parsed.error.flatten().fieldErrors);
    return {
      RESEND_API_KEY: process.env.RESEND_API_KEY || '',
      RESEND_FROM: process.env.RESEND_FROM || 'onboarding@resend.dev',
      isValid: false,
    };
  }

  return {
    ...parsed.data,
    isValid: true,
  };
}

export function getEnv() {
  const parsed = ServerEnvSchema.safeParse({
    NEXT_PUBLIC_BASE_CHAIN_ID: process.env.NEXT_PUBLIC_BASE_CHAIN_ID,
    NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
    NEXT_PUBLIC_ESCROW_ADDRESS: process.env.NEXT_PUBLIC_ESCROW_ADDRESS,
    NEXT_PUBLIC_PLATFORM_FEE_BPS: process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS,
    NEXT_PUBLIC_USDC_DECIMALS: process.env.NEXT_PUBLIC_USDC_DECIMALS,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM: process.env.RESEND_FROM || 'onboarding@resend.dev',
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    ENABLE_TELEGRAM: process.env.ENABLE_TELEGRAM,
    CRON_SECRET: process.env.CRON_SECRET,
  });

  if (!parsed.success) {
    console.warn('[env] Validation warnings:', parsed.error.flatten().fieldErrors);
  }

  return {
    ...DEFAULTS,
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    RESEND_FROM: process.env.RESEND_FROM || 'onboarding@resend.dev',
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    ENABLE_TELEGRAM: process.env.ENABLE_TELEGRAM === 'true' || process.env.ENABLE_TELEGRAM === '1',
    CRON_SECRET: process.env.CRON_SECRET,
  };
}

export function getAuthEnv() {
  const parsed = AuthEnvSchema.safeParse({
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
  });

  if (!parsed.success) {
    console.error('[auth:env] Critical auth environment validation failed:', parsed.error.flatten().fieldErrors);
    return {
      secret: process.env.NEXTAUTH_SECRET || '',
      url: process.env.NEXTAUTH_URL || '',
      trust: process.env.AUTH_TRUST_HOST === 'true',
      DATABASE_URL: process.env.DATABASE_URL || '',
      isValid: false,
    };
  }

  return {
    secret: parsed.data.NEXTAUTH_SECRET,
    sessionSecret: parsed.data.SESSION_SECRET || parsed.data.NEXTAUTH_SECRET,
    url: parsed.data.NEXTAUTH_URL,
    trust: parsed.data.AUTH_TRUST_HOST,
    DATABASE_URL: parsed.data.DATABASE_URL,
    isValid: true,
  };
}

export function getWalletEnv() {
  const walletParsed = WalletEnvSchema.safeParse({
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  });

  if (!walletParsed.success) {
    console.warn("[walletenv] parse error", walletParsed.error?.flatten?.().fieldErrors);
    return { projectId: null as string | null };
  }

  const pid = walletParsed.data.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  
  const INVALID_VALUES = ['demo', 'MISSING', 'test', 'placeholder', ''];
  
  if (!pid || INVALID_VALUES.includes(pid.toLowerCase())) {
    console.warn("[walletenv] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing or invalid (placeholder detected)");
    return { projectId: null as string | null };
  }

  return { projectId: pid };
}

export default env;
