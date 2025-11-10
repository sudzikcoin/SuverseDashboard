"use client";

import { useEffect } from "react";

export default function ClientInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const MIGRATION_FLAG = "suverse:wagmi:migration:v1";
    
    if (localStorage.getItem(MIGRATION_FLAG)) {
      return;
    }
    
    const cleanupOldKeys = () => {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        if (
          (key.startsWith("wagmi.") || key === "wagmi.store") &&
          !key.startsWith("suverse:wagmi:")
        ) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(k => {
        console.log("Migrating old wagmi key:", k);
        localStorage.removeItem(k);
      });
      
      localStorage.setItem(MIGRATION_FLAG, "true");
    };
    
    cleanupOldKeys();
  }, []);

  return null;
}
