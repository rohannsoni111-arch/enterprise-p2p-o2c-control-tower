import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  FileText,
  Package,
  Truck,
  Receipt,
  AlertTriangle,
  GitCommit,
  BookOpen,
  History,
  Boxes,
  Users,
  Building2,
  Network,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Compass,
  Cpu,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const DashboardLayout: React.FC = () => {
  const { user, personas, loginAsPersona, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [personaOpen, setPersonaOpen] = useState(false);

  const navigationSections = [
    {
      title: 'Control Towers',
      items: [
        { name: 'Executive Overview', path: '/', icon: LayoutDashboard },
        { name: 'P2P Control Tower', path: '/p2p-dashboard', icon: ShoppingCart },
        { name: 'O2C Control Tower', path: '/o2c-dashboard', icon: TrendingUp },
      ],
    },
    {
      title: 'Procure-to-Pay (SAP MM)',
      items: [
        { name: 'Purchase Requisitions', path: '/purchase-requisitions', icon: FileText },
        { name: 'Purchase Orders', path: '/purchase-orders', icon: Package },
        { name: 'Goods Receipts (Mvt 101)', path: '/goods-receipts', icon: Truck },
        { name: 'Invoices & 3-Way Match', path: '/supplier-invoices', icon: Receipt },
      ],
    },
    {
      title: 'Order-to-Cash (SAP SD)',
      items: [
        { name: 'Customer Inquiries', path: '/customer-inquiries', icon: FileText },
        { name: 'Sales Orders', path: '/sales-orders', icon: ShoppingCart },
        { name: 'Deliveries & Goods Issue', path: '/deliveries', icon: Truck },
        { name: 'Customer Billing', path: '/customer-invoices', icon: Receipt },
      ],
    },
    {
      title: 'Governance & Analytics',
      items: [
        { name: 'Exceptions Center', path: '/exceptions', icon: AlertTriangle, badge: 'Active' },
        { name: 'Process Trace (Doc Flow)', path: '/trace', icon: GitCommit },
        { name: 'Business Rules Engine', path: '/business-rules', icon: Cpu },
        { name: 'Enterprise Audit Trail', path: '/audit-logs', icon: History },
      ],
    },
    {
      title: 'Master Data Governance',
      items: [
        { name: 'Material Master', path: '/materials', icon: Boxes },
        { name: 'Vendor Master', path: '/vendors', icon: Building2 },
        { name: 'Customer Master', path: '/customers', icon: Users },
        { name: 'Enterprise Org Hierarchy', path: '/org-structure', icon: Network },
      ],
    },
    {
      title: 'Consultant Walkthrough',
      items: [
        { name: 'As-Is vs To-Be & BPMN / FSD', path: '/consultant-walkthrough', icon: Compass, highlight: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      {/* Top Enterprise Header */}
      <header className="sticky top-0 z-40 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sap-navy flex items-center justify-center text-white shadow-xs">
            <BarChart3 className="w-5 h-5 text-sap-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                Enterprise Digital Control Tower
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                SAP MM/SD Process Simulation
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">P2P & O2C Process Intelligence & Operational Decision Support</p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPersonaOpen(!personaOpen)}
              className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sap-blue" />
              <span className="max-w-[120px] truncate">{user?.fullName || 'Switch Persona'}</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 uppercase">
                {user?.role}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {personaOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setPersonaOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Demo Persona (1-Click)
                </div>
                {personas.map((p) => (
                  <button
                    key={p.username}
                    onClick={() => loginAsPersona(p.username)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      user?.username === p.username ? 'bg-sap-blue/10 text-sap-blue font-semibold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{p.fullName}</div>
                      <div className="text-[10px] text-slate-400">@{p.username}</div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {p.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 text-slate-600 dark:text-slate-300 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col justify-between overflow-y-auto">
          <nav className="p-3 space-y-6">
            {navigationSections.map((sec) => (
              <div key={sec.title}>
                <h4 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  {sec.title}
                </h4>
                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-sap-blue text-white shadow-xs'
                            : item.highlight
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-600' : 'text-slate-400'}`} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && !isActive && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer note */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
            Portfolio Simulation • Educational Control Tower
          </div>
        </aside>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
