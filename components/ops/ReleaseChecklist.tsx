'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, ClipboardCheck, ExternalLink, X } from 'lucide-react';

interface CheckResult {
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

interface ChecklistState {
  health: CheckResult;
  diagnostics: CheckResult;
  login: CheckResult;
  database: CheckResult;
}

export function ReleaseChecklist() {
  const [isOpen, setIsOpen] = useState(false);
  const [checks, setChecks] = useState<ChecklistState>({
    health: { status: 'pending' },
    diagnostics: { status: 'pending' },
    login: { status: 'pending' },
    database: { status: 'pending' },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('shield-checklist');
    if (saved) {
      try {
        setChecks(JSON.parse(saved));
      } catch {
        // Invalid saved data, ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shield-checklist', JSON.stringify(checks));
  }, [checks]);

  const runCheck = async (
    checkName: keyof ChecklistState,
    fn: () => Promise<{ ok: boolean; message?: string }>
  ) => {
    const startTime = Date.now();
    setChecks(prev => ({ ...prev, [checkName]: { status: 'running' } }));

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      
      setChecks(prev => ({
        ...prev,
        [checkName]: {
          status: result.ok ? 'success' : 'error',
          message: result.message,
          duration,
        },
      }));
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        [checkName]: {
          status: 'error',
          message: error instanceof Error ? error.message : 'Check failed',
          duration: Date.now() - startTime,
        },
      }));
    }
  };

  const checkHealth = () => runCheck('health', async () => {
    const response = await fetch('/api/health');
    if (response.status === 401 || response.status === 403) {
      return { ok: false, message: 'Admin login required' };
    }
    const data = await response.json();
    return {
      ok: data.ok,
      message: data.ok ? 'All systems operational' : `${Object.values(data.checks || {}).filter((c: any) => !c.ok).length} systems need attention`,
    };
  });

  const checkDiagnostics = () => runCheck('diagnostics', async () => {
    window.open('/admin/diagnostics', '_blank');
    return { ok: true, message: 'Opened in new tab' };
  });

  const checkLogin = () => runCheck('login', async () => {
    const response = await fetch('/login');
    return {
      ok: response.ok,
      message: response.ok ? 'Login page accessible' : `HTTP ${response.status}`,
    };
  });

  const checkDatabase = () => runCheck('database', async () => {
    const response = await fetch('/api/health/db');
    if (response.status === 401 || response.status === 403) {
      return { ok: false, message: 'Admin login required' };
    }
    const data = await response.json();
    return {
      ok: data.ok,
      message: data.ok ? 'Connected' : data.error,
    };
  });

  const resetChecks = () => {
    setChecks({
      health: { status: 'pending' },
      diagnostics: { status: 'pending' },
      login: { status: 'pending' },
      database: { status: 'pending' },
    });
  };

  const CheckItem = ({ 
    name, 
    check, 
    onRun 
  }: { 
    name: string; 
    check: CheckResult; 
    onRun: () => void;
  }) => {
    const StatusIcon = 
      check.status === 'success' ? CheckCircle2 :
      check.status === 'error' ? XCircle :
      check.status === 'running' ? Loader2 :
      ClipboardCheck;

    const statusColor = 
      check.status === 'success' ? 'text-emerald-400' :
      check.status === 'error' ? 'text-red-400' :
      check.status === 'running' ? 'text-blue-400' :
      'text-gray-400';

    return (
      <div className="flex items-center justify-between p-3 bg-su-base rounded-lg border border-white/10">
        <div className="flex items-center gap-3 flex-1">
          <StatusIcon className={`h-4 w-4 ${statusColor} ${check.status === 'running' ? 'animate-spin' : ''}`} />
          <div className="flex-1">
            <div className="text-sm font-medium text-su-text">{name}</div>
            {check.message && (
              <div className="text-xs text-su-muted mt-1">{check.message}</div>
            )}
          </div>
          {check.duration !== undefined && (
            <div className="text-xs text-su-muted font-mono">{check.duration}ms</div>
          )}
        </div>
        <button
          onClick={onRun}
          disabled={check.status === 'running'}
          className="ml-2 px-3 py-1 bg-su-emerald/10 hover:bg-su-emerald/20 text-su-emerald text-xs font-medium rounded border border-su-emerald/30 disabled:opacity-50 transition-colors"
        >
          Run
        </button>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-gradient-to-r from-su-emerald to-su-sky text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        title="Keyboard shortcut: Ctrl/Cmd + K"
      >
        <ClipboardCheck className="h-4 w-4" />
        Checklist
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-su-card border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-su-text flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-su-emerald" />
          Release Checklist
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="h-4 w-4 text-su-muted" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <CheckItem name="System Health" check={checks.health} onRun={checkHealth} />
        <CheckItem name="Diagnostics Page" check={checks.diagnostics} onRun={checkDiagnostics} />
        <CheckItem name="Login Page" check={checks.login} onRun={checkLogin} />
        <CheckItem name="Database" check={checks.database} onRun={checkDatabase} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={resetChecks}
          className="flex-1 px-3 py-2 bg-su-base border border-white/10 text-su-text text-sm font-medium rounded-lg hover:border-su-emerald/50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="flex-1 px-3 py-2 bg-su-emerald/10 border border-su-emerald/30 text-su-emerald text-sm font-medium rounded-lg hover:bg-su-emerald/20 transition-colors"
        >
          Close
        </button>
      </div>

      <div className="mt-3 text-xs text-su-muted text-center">
        <kbd className="px-2 py-1 bg-su-base border border-white/10 rounded">Ctrl/Cmd + K</kbd> to toggle
      </div>
    </div>
  );
}
