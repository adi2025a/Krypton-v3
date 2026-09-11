import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
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
  UserPlus,
  Cable,
  Bot,
  Zap,
  ShieldCheck,
  Fingerprint,
  EyeOff,
  ChevronDown,
  Cpu,
  Rss,
} from 'lucide-react';
import heroImg from '../assets/hero.png';

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Unified Dashboard',
    description: 'Every signal that matters — price, indicators, news, and risk — in one live view that refreshes without you asking.',
  },
  {
    icon: LineChart,
    title: 'Live Technical Indicators',
    description: 'RSI, MACD, moving averages and more, computed deterministically off live candles — no LLM latency, no LLM cost.',
  },
  {
    icon: Newspaper,
    title: 'News & Sentiment',
    description: 'Crypto headlines pulled from RSS feeds, ranked and scored for sentiment so you feel market mood at a glance.',
  },
  {
    icon: ShieldAlert,
    title: 'Risk Analysis',
    description: 'Portfolio-aware exposure and risk metrics computed straight from your connected Binance account.',
  },
  {
    icon: MessageSquareCode,
    title: 'AI Chat Assistant',
    description: 'A LangGraph multi-agent system synthesizes technicals, sentiment and risk into plain-English commentary.',
  },
  {
    icon: KeyRound,
    title: 'Bring Your Own LLM',
    description: 'Plug in OpenAI, Groq, Gemini or Claude — your key is Fernet-encrypted at rest and never leaves your control.',
  },
];

const STEPS = [
  {
    icon: UserPlus,
    title: 'Create your account',
    description: 'Sign up with email, verify with a one-time code. No password reaches us until you prove you own the inbox.',
  },
  {
    icon: KeyRound,
    title: 'Bring your own LLM key',
    description: 'Paste an OpenAI, Groq, Gemini or Claude key. It\'s encrypted at rest — Krypton never sees it in plaintext again.',
  },
  {
    icon: Cable,
    title: 'Connect Binance (optional)',
    description: 'Link a read-focused API key to pull live balances into risk analysis. Skip it and use market-wide data only.',
  },
  {
    icon: Bot,
    title: 'Ask the agent anything',
    description: 'Every other panel is free and instant. The LLM is called exactly once — when you actually ask a question.',
  },
];

const SECURITY_POINTS = [
  {
    icon: Fingerprint,
    title: 'OTP-verified accounts',
    description: 'Signup and login are two distinct checks, so a leaked code alone can never grant a session.',
  },
  {
    icon: Lock,
    title: 'Fernet-encrypted keys',
    description: 'LLM and Binance credentials are encrypted at rest with a dedicated key-encryption key, never stored in plaintext.',
  },
  {
    icon: EyeOff,
    title: 'No secrets in the frontend',
    description: 'The browser never computes on or persists a raw API key — everything sensitive stays server-side.',
  },
  {
    icon: ShieldCheck,
    title: 'You control the LLM spend',
    description: 'Krypton runs on your key and your quota. Deterministic panels stay free; only chat spends a token.',
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -40]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#060911] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Ambient animated background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-indigo-600/20 blur-[110px]"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full bg-cyan-500/15 blur-[130px]"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[120px]"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Nav */}
      <header
        className={`sticky top-0 z-40 h-16 px-6 flex items-center justify-between border-b transition-colors duration-300 ${
          scrolled ? 'glass-panel border-white/10' : 'border-transparent'
        }`}
      >
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
        <motion.button
          onClick={onGetStarted}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-colors"
        >
          Sign In
        </motion.button>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-16 pb-24 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
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
              className="mt-6 text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Krypton pairs live technical indicators, news sentiment and portfolio risk with a LangGraph
              agent that turns it all into natural-language trading commentary — using your own LLM key.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="group flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-colors"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                Encrypted key storage, OTP-verified accounts
              </div>
            </motion.div>
          </div>

          <motion.div
            style={{ y: heroY }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative flex justify-center lg:justify-end"
          >
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <div className="absolute inset-0 bg-indigo-500/25 blur-[80px] rounded-full" />
              <img src={heroImg} alt="Krypton" className="relative w-64 sm:w-80 drop-shadow-2xl" />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="hidden sm:flex flex-col items-center gap-1 text-slate-600 mt-16"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats strip */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="px-6 pb-20 max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { icon: LineChart, label: 'Live modules', value: '6' },
          { icon: Cpu, label: 'LLM calls per free panel', value: '0' },
          { icon: Rss, label: 'News sources tracked', value: 'Multi-RSS' },
          { icon: Zap, label: 'LLM providers supported', value: '4+' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="glass-card rounded-2xl border border-white/10 p-4 text-center"
            >
              <Icon className="w-4 h-4 text-indigo-300 mx-auto mb-2" />
              <div className="text-xl font-black text-white">{stat.value}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Everything you need, in one glass panel</h2>
          <p className="mt-2 text-sm text-slate-500">Deterministic market data stays fast and free — the LLM only runs when you ask it something.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-colors"
              >
                <motion.div
                  whileHover={{ rotate: -6, scale: 1.08 }}
                  className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mb-4"
                >
                  <Icon className="w-5 h-5 text-indigo-300" />
                </motion.div>
                <h3 className="text-sm font-bold text-white mb-1.5">{feature.title}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="text-center mb-14"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">From signup to first insight</h2>
          <p className="mt-2 text-sm text-slate-500">Four steps, no credit card, your keys stay yours the whole way.</p>
        </motion.div>

        <div className="relative">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            style={{ originY: 0 }}
            className="hidden sm:block absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500 via-cyan-400 to-emerald-400"
          />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="space-y-6"
          >
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.title} variants={fadeUp} className="relative sm:pl-16 flex items-start gap-4">
                  <div className="hidden sm:flex absolute left-0 w-12 h-12 rounded-full bg-[#0d1220] border-2 border-indigo-500/40 items-center justify-center shrink-0 shadow-lg shadow-indigo-500/10">
                    <Icon className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div className="glass-card rounded-2xl border border-white/10 p-5 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="sm:hidden w-7 h-7 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-indigo-300" />
                      </span>
                      <span className="text-[11px] font-black text-indigo-400 tracking-widest">STEP {i + 1}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
                    <p className="text-[13px] text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Deterministic vs Agent */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Fast by default, intelligent on demand</h2>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl mx-auto">
            Krypton's backend is split deliberately: a deterministic layer that's always instant and free, and a
            single LLM call that only fires when you talk to the agent.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="glass-card rounded-2xl border border-emerald-500/20 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Deterministic layer — always free</h3>
            </div>
            <ul className="space-y-2.5 text-[13px] text-slate-400">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" /> Indicators computed directly from live candles</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" /> News fetched and scored via pure sentiment math</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" /> Risk metrics pulled straight from your Binance balances</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" /> Zero LLM tokens spent just viewing the dashboard</li>
            </ul>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: 0.08 }}
            className="glass-card rounded-2xl border border-indigo-500/20 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Agent layer — one call, on demand</h3>
            </div>
            <ul className="space-y-2.5 text-[13px] text-slate-400">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" /> Market, sentiment and risk nodes run in parallel</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" /> Results feed a single synthesis step — the only LLM call</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" /> Runs on your own LLM key, at your own provider's rates</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" /> Answers in plain English, grounded in live data</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Security */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Built to hold your keys, not leak them</h2>
          <p className="mt-2 text-sm text-slate-500">Security isn't a feature toggle here — it's the reason the backend is shaped the way it is.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {SECURITY_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <motion.div key={point.title} variants={fadeUp} whileHover={{ y: -4 }} className="glass-card p-5 rounded-2xl border border-white/10 text-center">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center mb-4 mx-auto">
                  <Icon className="w-5 h-5 text-cyan-300" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{point.title}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed">{point.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* CTA footer */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="px-6 pb-20 max-w-4xl mx-auto text-center"
      >
        <div className="relative glass-card rounded-3xl border border-white/10 p-10 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-600/20 blur-[80px]"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h2 className="relative text-xl sm:text-2xl font-extrabold text-white mb-2">Ready to see it in action?</h2>
          <p className="relative text-sm text-slate-400 mb-6">Create an account in under a minute — no credit card, bring your own LLM key.</p>
          <motion.button
            onClick={onGetStarted}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="relative inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-colors"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.section>

      <footer className="px-6 py-8 text-center text-xs text-slate-600 border-t border-white/5">
        © {new Date().getFullYear()} Krypton. All data is illustrative — not financial advice.
      </footer>
    </div>
  );
};
