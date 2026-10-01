import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, ShieldCheck, ArrowRight, Lock, User, Info } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginAsPersona, personas } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaClick = async (personaUser: string) => {
    setError('');
    setLoading(true);
    try {
      await loginAsPersona(personaUser);
      navigate('/');
    } catch (err: any) {
      setError('Unable to authenticate as persona');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 rounded-2xl bg-sap-navy text-white shadow-md mb-3">
          <BarChart3 className="w-8 h-8 text-sap-gold" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Digital Control Tower Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          SAP MM/SD Process Simulation & Analytics Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-lg sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-800">
          {/* Portfolio simulation notice */}
          <div className="mb-6 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <span className="font-semibold">Portfolio Simulation Notice:</span> This is an educational enterprise simulation inspired by SAP MM and SD business workflows. Select any role below for instant single-click demo access.
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          {/* Persona Quick Select */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Select Demo Role (1-Click Instant Login)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { u: 'admin', role: 'System Admin', name: 'Alexander Vance' },
                { u: 'procurement', role: 'Lead Buyer (MM)', name: 'Elena Rostova' },
                { u: 'warehouse', role: 'Warehouse Lead', name: 'Marcus Weber' },
                { u: 'finance', role: 'Financial Controller', name: 'Sofia Lindqvist' },
                { u: 'sales', role: 'Commercial Lead (SD)', name: 'David Chen' },
                { u: 'management', role: 'VP Global Supply', name: 'Dr. B. Thorne' },
              ].map((p) => (
                <button
                  key={p.u}
                  type="button"
                  onClick={() => handlePersonaClick(p.u)}
                  className="p-2.5 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-sap-blue dark:hover:border-sap-blue hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs group"
                >
                  <div className="font-medium text-slate-900 dark:text-white group-hover:text-sap-blue flex items-center justify-between">
                    <span>{p.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.role}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">Or Login Manually</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-sap-blue"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-sap-blue"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-sap-blue hover:bg-sap-darkBlue text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Control Tower'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
