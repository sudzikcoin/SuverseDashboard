import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('env module', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  it('should return valid defaults when env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_BASE_CHAIN_ID;
    delete process.env.NEXT_PUBLIC_USDC_ADDRESS;
    delete process.env.NEXT_PUBLIC_ESCROW_ADDRESS;
    delete process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS;
    delete process.env.NEXT_PUBLIC_USDC_DECIMALS;

    const { env } = await import('../env');

    expect(env.NEXT_PUBLIC_BASE_CHAIN_ID).toBe(8453);
    expect(env.NEXT_PUBLIC_USDC_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(env.NEXT_PUBLIC_ESCROW_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(env.NEXT_PUBLIC_PLATFORM_FEE_BPS).toBe(100);
    expect(env.NEXT_PUBLIC_USDC_DECIMALS).toBe(6);
  });

  it('should reject negative fee and clamp to default', async () => {
    process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS = '-1';
    
    jest.resetModules();
    const { env } = await import('../env');

    expect(env.NEXT_PUBLIC_PLATFORM_FEE_BPS).toBe(100);
  });

  it('should reject excessive fee (>10000) and clamp to default', async () => {
    process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS = '999999';
    
    jest.resetModules();
    const { env } = await import('../env');

    expect(env.NEXT_PUBLIC_PLATFORM_FEE_BPS).toBe(100);
  });

  it('should reject decimals > 18 and clamp to default', async () => {
    process.env.NEXT_PUBLIC_USDC_DECIMALS = '25';
    
    jest.resetModules();
    const { env } = await import('../env');

    expect(env.NEXT_PUBLIC_USDC_DECIMALS).toBe(6);
  });

  it('should reject malformed addresses and use defaults', async () => {
    process.env.NEXT_PUBLIC_USDC_ADDRESS = '0xINVALID';
    process.env.NEXT_PUBLIC_ESCROW_ADDRESS = 'not-an-address';
    
    jest.resetModules();
    const { env } = await import('../env');

    expect(env.NEXT_PUBLIC_USDC_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(env.NEXT_PUBLIC_ESCROW_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it('should accept valid environment variables', async () => {
    process.env.NEXT_PUBLIC_BASE_CHAIN_ID = '1';
    process.env.NEXT_PUBLIC_USDC_ADDRESS = '0x1234567890123456789012345678901234567890';
    process.env.NEXT_PUBLIC_ESCROW_ADDRESS = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS = '250';
    process.env.NEXT_PUBLIC_USDC_DECIMALS = '18';
    
    jest.resetModules();
    const { env } = await import('../env');

    expect(env.NEXT_PUBLIC_BASE_CHAIN_ID).toBe(1);
    expect(env.NEXT_PUBLIC_USDC_ADDRESS).toBe('0x1234567890123456789012345678901234567890');
    expect(env.NEXT_PUBLIC_ESCROW_ADDRESS).toBe('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
    expect(env.NEXT_PUBLIC_PLATFORM_FEE_BPS).toBe(250);
    expect(env.NEXT_PUBLIC_USDC_DECIMALS).toBe(18);
  });

  it('should reject Infinity and NaN for numeric fields', async () => {
    process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS = 'Infinity';
    process.env.NEXT_PUBLIC_USDC_DECIMALS = 'NaN';
    
    jest.resetModules();
    const { env } = await import('../env');

    expect(env.NEXT_PUBLIC_PLATFORM_FEE_BPS).toBe(100);
    expect(env.NEXT_PUBLIC_USDC_DECIMALS).toBe(6);
  });
});
