import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Cpu,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Activity,
  LayoutDashboard,
  Newspaper,
  LineChart,
  ShieldAlert,
  MessageSquareCode,
  Settings,
} from 'lucide-react';
export type NavTab = 'dashboard' | 'news' | 'indicators' | 'risk' | 'chat' | 'settings';

const POPULAR_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT'];

const NAV_ITEMS: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'indicators', label: 'Indicators', icon: LineChart },
  { id: 'risk', label: 'Risk', icon: ShieldAlert },
  { id: 'chat', label: 'AI Chat', icon: MessageSquareCode },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { user, llmStatus, binanceStatus, logout, activeSymbol, setActiveSymbol, setShowLLMSetup, setShowBinanceSetup } = useAuth();

  return (
    <header className="border-b border-white/10 glass-panel sticky top-0 z-40 px-4 sm:px-6">
      <div className="h-16 flex items-center justify-between gap-4">
        {/* Left: Brand logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center p-1">
              <img src="/assets/krypton_logo.png" alt="Krypton Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="font-black tracking-wider text-base text-white flex items-center gap-1.5">
              KRYPTON <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
            </div>
          </div>
        </div>

        {/* Center: Pill navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 border border-white/10 rounded-2xl p-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Symbol, status pills & user */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Symbol Selector */}
          <div className="relative hidden md:flex items-center gap-2 bg-slate-900/60 border border-white/10 px-3 py-1.5 rounded-xl">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <select
              value={activeSymbol}
              onChange={(e) => setActiveSymbol(e.target.value)}
              className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer pr-4"
            >
              {POPULAR_SYMBOLS.map((sym) => (
                <option key={sym} value={sym} className="bg-slate-900 text-white">
                  {sym}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2" />
          </div>

          {/* LLM Status Pill */}
          <button
            onClick={() => setShowLLMSetup(true)}
            title={llmStatus?.is_valid ? `LLM: ${llmStatus.provider}` : 'LLM Key Required'}
            className={`flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all ${
              llmStatus?.is_valid
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
                : 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className={`w-2 h-2 rounded-full ${llmStatus?.is_valid ? 'bg-emerald-400 animate-ping' : 'bg-red-400'}`} />
          </button>

          {/* Binance Status Pill */}
          <button
            onClick={() => setShowBinanceSetup(true)}
            title={binanceStatus?.is_active ? 'Binance Connected' : 'Connect Binance'}
            className={`flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all ${
              binanceStatus?.is_active
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-slate-800/60 border-white/10 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className={`w-2 h-2 rounded-full ${binanceStatus?.is_active ? 'bg-amber-400' : 'bg-slate-600'}`} />
          </button>

          {/* User Email & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <span className="text-xs font-medium text-slate-300 hidden xl:inline max-w-[140px] truncate">
              {user?.email}
            </span>
            <button
              onClick={logout}
              title="Log Out"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / tablet nav row */}
      <nav className="lg:hidden flex items-center gap-1 overflow-x-auto pb-2.5 -mt-0.5 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 bg-slate-900/60 border border-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
