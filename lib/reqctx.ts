"use server";
import { headers } from "next/headers";

export interface RequestContext {
  ip: string;
  userAgent: string;
}

export async function getRequestContext(): Promise<RequestContext> {
  try {
    const h = await headers();
    
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("cf-connecting-ip") ||
      h.get("x-real-ip") ||
      h.get("x-client-ip") ||
      "unknown";
    
    const userAgent = h.get("user-agent") || "unknown";
    
    return { ip, userAgent };
  } catch (error) {
    console.error("[reqctx] Failed to extract request context:", error);
    return {
      ip: "unknown",
      userAgent: "unknown",
    };
  }
}
