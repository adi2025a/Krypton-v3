import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Newspaper,
  LineChart,
  ShieldAlert,
  MessageSquareCode,
  KeyRound,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Unified Dashboard',
    description: 'Every signal that matters — price, indicators, news, and risk — in one live view.',
  },
  {
    icon: LineChart,
    title: 'Live Technical Indicators',
    description: 'Real-time RSI, MACD, moving averages and more, computed deterministically off live candles.',
  },
  {
    icon: Newspaper,
    title: 'News & Sentiment',
    description: 'Crypto headlines ranked and scored for sentiment so you feel market mood at a glance.',
  },
  {
    icon: ShieldAlert,
    title: 'Risk Analysis',
    description: 'Portfolio-aware risk metrics computed straight from your connected Binance account.',
  },
  {
    icon: MessageSquareCode,
    title: 'AI Chat Assistant',
    description: 'A LangGraph multi-agent system synthesizes technicals, sentiment and risk into plain-English commentary.',
  },
  {
    icon: KeyRound,
    title: 'Bring Your Own LLM',
    description: 'Plug in OpenAI, Groq, Gemini or Claude — your key is encrypted at rest and never leaves your control.',
  },
];

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-40 h-16 glass-panel border-b border-white/10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center p-1">
              <img src="/assets/krypton_logo.png" alt="Krypton Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="font-black tracking-wider text-base text-white flex items-center gap-1.5">
            KRYPTON <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
          </div>
        </div>
        <button
          onClick={onGetStarted}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-colors"
        >
          Sign In
        </button>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 max-w-6xl mx-auto text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-indigo-500/20 text-xs font-bold text-indigo-300 mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Crypto Trading Intelligence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight"
        >
          Trade smarter with a
          <span className="block bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            multi-agent market co-pilot
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Krypton pairs live technical indicators, news sentiment and portfolio risk with a LangGraph
          agent that turns it all into natural-language trading commentary — using your own LLM key.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <button
            onClick={onGetStarted}
            className="group flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Lock className="w-3.5 h-3.5" />
            Encrypted key storage, OTP-verified accounts
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Everything you need, in one glass panel</h2>
          <p className="mt-2 text-sm text-slate-500">Deterministic market data stays fast and free — the LLM only runs when you ask it something.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-indigo-300" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{feature.title}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA footer */}
      <section className="px-6 pb-20 max-w-4xl mx-auto text-center">
        <div className="glass-card rounded-3xl border border-white/10 p-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">Ready to see it in action?</h2>
          <p className="text-sm text-slate-400 mb-6">Create an account in under a minute — no credit card, bring your own LLM key.</p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-xs text-slate-600 border-t border-white/5">
        © {new Date().getFullYear()} Krypton. All data is illustrative — not financial advice.
      </footer>
    </div>
  );
};
