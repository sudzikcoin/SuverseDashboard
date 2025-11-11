'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Download, Server, Shield, Mail, Wallet, DollarSign, FileText } from 'lucide-react';

interface HealthCheck {
  ok: boolean;
  info?: any;
  error?: string;
}

interface SelfTestResult {
  ok: boolean;
  durationMs: number;
  failures: string[];
  report: any;
}

export default function DiagnosticsPage() {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<SelfTestResult | null>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runSelfTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/selftest');
      const data = await response.json();
      setTestResult(data);
      setHealthData(data.report);
      
      if (data.ok) {
        showToast('All systems operational! ✅', 'success');
      } else {
        showToast(`${data.failures.length} system(s) need attention`, 'error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run self-test');
      showToast('Self-test failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    if (typeof window !== 'undefined' && (window as any).__shieldToast) {
      (window as any).__shieldToast(message, type);
    } else {
      const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
      console.log(`[shield] ${emoji} ${message}`);
    }
  };

  const downloadReport = () => {
    if (!testResult) return;
    
    const blob = new Blob([JSON.stringify(testResult.report, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suverse-diagnostics-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report downloaded', 'success');
  };

  const StatusCard = ({ 
    title, 
    icon: Icon, 
    check 
  }: { 
    title: string; 
    icon: any; 
    check: HealthCheck | undefined;
  }) => {
    const isOk = check?.ok ?? false;
    const StatusIcon = isOk ? CheckCircle2 : XCircle;
    
    return (
      <div className="bg-su-card border border-white/10 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <Icon className="h-5 w-5 text-su-emerald" />
          <h3 className="font-semibold text-su-text">{title}</h3>
          <StatusIcon className={`h-5 w-5 ml-auto ${isOk ? 'text-emerald-400' : 'text-red-400'}`} />
        </div>
        
        {check?.error && (
          <div className="text-sm text-red-400 mb-2 bg-red-500/10 p-2 rounded border border-red-500/20">
            {check.error}
          </div>
        )}
        
        {check?.info && (
          <div className="text-xs text-su-muted space-y-1">
            {Object.entries(check.info).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="opacity-70">{key}:</span>
                <span className="font-mono">
                  {typeof value === 'boolean' ? (value ? '✓' : '✗') : 
                   typeof value === 'object' ? JSON.stringify(value) :
                   String(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-su-base text-su-text p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-su-emerald to-su-sky bg-clip-text text-transparent">
            System Diagnostics
          </h1>
          <p className="text-su-muted">
            Real-time health monitoring and stability checks
          </p>
        </div>

        {healthData && (
          <div className="mb-6 p-4 bg-su-card border border-white/10 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-su-muted">Version Hash</div>
                <div className="font-mono text-su-emerald">{healthData.versionHashPrefix || 'N/A'}</div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-sm text-su-muted">Last Check</div>
                <div className="font-mono text-su-text text-sm">
                  {healthData.ts ? new Date(healthData.ts).toLocaleString() : 'Never'}
                </div>
              </div>
              {healthData.durationMs !== undefined && (
                <div className="space-y-1 text-right">
                  <div className="text-sm text-su-muted">Duration</div>
                  <div className="font-mono text-su-text text-sm">{healthData.durationMs}ms</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-8">
          <button
            onClick={runSelfTest}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-su-emerald to-su-sky text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-su-emerald/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Run Full Self-Test
          </button>

          <button
            onClick={loadHealth}
            disabled={loading}
            className="px-6 py-3 bg-su-card border border-white/10 text-su-text font-semibold rounded-xl hover:border-su-emerald/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Refresh Status
          </button>

          {testResult && (
            <button
              onClick={downloadReport}
              className="px-6 py-3 bg-su-card border border-white/10 text-su-text font-semibold rounded-xl hover:border-su-emerald/50 transition-all flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Report
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}

        {healthData?.checks && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatusCard title="Database" icon={Server} check={healthData.checks.db} />
            <StatusCard title="Authentication" icon={Shield} check={healthData.checks.auth} />
            <StatusCard title="Email (Resend)" icon={Mail} check={healthData.checks.email} />
            <StatusCard title="WalletConnect" icon={Wallet} check={healthData.checks.wallet} />
            <StatusCard title="USDC Config" icon={DollarSign} check={healthData.checks.usdc} />
            <StatusCard title="Audit Logger" icon={FileText} check={healthData.checks.audit} />
          </div>
        )}

        {testResult && (
          <div className="bg-su-card border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-su-emerald" />
              Full Test Report
            </h2>
            <div className="bg-su-base rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-su-muted font-mono whitespace-pre-wrap">
                {JSON.stringify(testResult.report, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {!healthData && !loading && (
          <div className="text-center py-12 text-su-muted">
            <Shield className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>Click "Run Full Self-Test" to begin diagnostics</p>
          </div>
        )}
      </div>
    </div>
  );
}
