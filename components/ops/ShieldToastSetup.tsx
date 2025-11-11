'use client';

import { useEffect } from 'react';
import { setupShieldToast } from './GlobalErrorBoundary';

export function ShieldToastSetup() {
  useEffect(() => {
    setupShieldToast();
  }, []);

  return null;
}
