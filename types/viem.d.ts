declare module 'viem' {
  export function formatUnits(value: bigint, decimals: number): string;
  export function parseUnits(value: string, decimals: number): bigint;
  export function createPublicClient(config: any): any;
  export function http(url?: string): any;
  export type Address = `0x${string}`;
}

declare module 'viem/chains' {
  export const base: any;
  export const mainnet: any;
  export const polygon: any;
  export const arbitrum: any;
  export const optimism: any;
}
