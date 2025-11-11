'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[shield] GlobalErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-su-base flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <AlertTriangle className="h-8 w-8 text-amber-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-amber-100 mb-2">
                    ⚠️ An error occurred
                  </h1>
                  <p className="text-amber-200 mb-4">
                    The application encountered an unexpected error. The error has been logged to the console.
                  </p>
                  {this.state.error && (
                    <div className="bg-su-base border border-white/10 rounded-lg p-4 mb-4">
                      <div className="text-xs font-mono text-su-muted break-all">
                        {this.state.error.message}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors font-medium"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="px-6 py-3 bg-su-card border border-white/10 text-su-text rounded-lg hover:border-su-emerald/50 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function setupShieldToast() {
  if (typeof window === 'undefined') return;

  (window as any).__shieldToast = (message: string, type: 'info' | 'warn' | 'error' = 'info') => {
    const container = document.getElementById('shield-toast-container') || createToastContainer();
    const toast = document.createElement('div');
    
    const bgColors = {
      info: 'bg-blue-500/90',
      warn: 'bg-amber-500/90',
      error: 'bg-red-500/90',
    };

    const icons = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };

    toast.className = `${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg mb-2 animate-slide-in flex items-center gap-2`;
    toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'shield-toast-container';
    container.className = 'fixed top-4 right-4 z-[9999] max-w-md';
    document.body.appendChild(container);
    return container;
  }
}
