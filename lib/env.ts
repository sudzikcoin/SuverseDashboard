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

export default env;
