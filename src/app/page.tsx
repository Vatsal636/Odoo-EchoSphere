'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf, TrendingUp, Shield, Zap, Users, BarChart3, Gamepad2,
  ArrowRight, Check, Star, Globe, Target,
  Award, Sparkles, Menu, X, ExternalLink,
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
} as const

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
} as const

const modules = [
  {
    title: 'Environmental',
    icon: Leaf,
    color: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    description: 'Track carbon emissions, set reduction goals, and monitor environmental KPIs in real-time.',
    features: ['Carbon emissions tracking', 'Goal setting & monitoring', 'Real-time environmental score', 'Automated reporting'],
  },
  {
    title: 'Social',
    icon: Users,
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    description: 'Manage CSR activities, track employee participation, and foster community engagement.',
    features: ['CSR activity management', 'Employee participation tracking', 'Community impact metrics', 'Volunteer coordination'],
  },
  {
    title: 'Governance',
    icon: Shield,
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    description: 'Maintain compliance, manage policies, and conduct audits with full traceability.',
    features: ['Policy management', 'Audit trails & compliance', 'Issue tracking', 'Regulatory reporting'],
  },
  {
    title: 'Gamification',
    icon: Gamepad2,
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    description: 'Boost engagement with challenges, badges, and rewards that drive sustainability actions.',
    features: ['Challenge system', 'Badge & achievement engine', 'Reward marketplace', 'Leaderboard & XP'],
  },
]

const stats = [
  { label: 'Carbon Reduction', value: '42%', suffix: 'avg.' },
  { label: 'Employee Engagement', value: '89%', suffix: 'participation' },
  { label: 'Policy Compliance', value: '97%', suffix: 'rate' },
  { label: 'Active Users', value: '10K+', suffix: 'worldwide' },
]

const highlights = [
  { icon: BarChart3, title: 'Live ESG Score', description: 'Real-time composite scoring across all three pillars with drill-down analytics.' },
  { icon: Zap, title: 'Automated Workflows', description: 'Smart notifications, badge auto-awards, and compliance overdue detection.' },
  { icon: Award, title: 'Badge Engine', description: 'Rule-based achievement system that rewards sustainability milestones.' },
  { icon: Globe, title: 'Full Audit Trail', description: 'Complete transparency with immutable audit logs and policy acknowledgements.' },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-zinc-200/50' : 'bg-transparent'
          }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                EcoSphere
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Modules', 'About'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors"
                >
                  {item}
                </Link>
              ))}
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-700 hover:text-emerald-600 transition-colors px-4 py-2"
                >
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="relative group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            <button
              className="md:hidden p-2 text-zinc-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-zinc-200 bg-white"
            >
              <div className="px-4 py-6 space-y-4">
                {['Features', 'Modules', 'About'].map((item) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors"
                  >
                    {item}
                  </Link>
                ))}
                <div className="pt-4 border-t border-zinc-200 space-y-3">
                  <Link href="/login" className="block text-center text-sm font-medium text-zinc-700 py-2">
                    Sign in
                  </Link>
                  <Link
                    href="/login"
                    className="block text-center rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/30" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-200/20 to-transparent rounded-full blur-3xl translate-x-1/2 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full blur-3xl -translate-x-1/3 translate-y-1/4" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-1.5 text-sm">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-700 font-medium">Next-Gen ESG Platform</span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
              >
                Transform Your{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-500 bg-clip-text text-transparent">
                  Sustainability
                </span>{' '}
                Journey
              </motion.h1>

              <motion.p variants={itemVariants} className="text-lg sm:text-xl text-zinc-600 max-w-xl leading-relaxed">
                Enterprise-grade ESG management platform that helps organizations track, measure, and improve their environmental, social, and governance performance with real-time analytics.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 transition-all"
                >
                  <PlayIcon className="h-4 w-4" />
                  See How It Works
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Free setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Cancel anytime</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 to-blue-400/20 rounded-2xl blur-2xl" />
                <div className="relative rounded-2xl border border-zinc-200 bg-white/90 backdrop-blur-sm shadow-2xl p-6">
                  <DashboardMockup />
                </div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-4 -right-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">ESG Score</p>
                      <p className="text-lg font-bold text-emerald-600">87.4</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-3 -left-3 rounded-xl border border-blue-200 bg-blue-50 p-3 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium text-blue-700">Real-time</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* Stats Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeIn}
        className="relative py-20 border-y border-zinc-100"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-zinc-500">{stat.label}</div>
                <div className="text-xs text-zinc-400">{stat.suffix}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Modules Section */}
      <section id="modules" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-sm text-zinc-600 mb-4">
              <Target className="h-4 w-4" />
              <span>Four Core Modules</span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold tracking-tight">
              Everything You Need{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-blue-500 bg-clip-text text-transparent">
                in One Platform
              </span>
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-lg text-zinc-500 max-w-2xl mx-auto">
              Comprehensive tools across all ESG pillars with gamification to drive engagement
            </motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`group rounded-2xl border ${mod.border} ${mod.bg} p-6 transition-all duration-300 hover:shadow-xl hover:shadow-${mod.color.split(' ')[0]?.replace('from-', '')}/10`}
              >
                <div className={`inline-flex rounded-xl ${mod.color} p-3 shadow-lg`}>
                  <mod.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className={`mt-5 text-lg font-semibold ${mod.text}`}>{mod.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{mod.description}</p>
                <ul className="mt-4 space-y-2">
                  {mod.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-zinc-500">
                      <Check className={`h-3.5 w-3.5 ${mod.text} mt-0.5 shrink-0`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 lg:py-32 bg-zinc-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm text-zinc-600 mb-4">
              <Star className="h-4 w-4" />
              <span>Platform Features</span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold tracking-tight">
              Powerful Features for{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-blue-500 bg-clip-text text-transparent">
                Enterprise ESG
              </span>
            </motion.h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="flex gap-5 rounded-xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:border-emerald-200"
              >
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <h.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">{h.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{h.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-sm text-zinc-600">
                <Globe className="h-4 w-4" />
                <span>About EcoSphere</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15]">
                Built for a{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-blue-500 bg-clip-text text-transparent">
                  Sustainable Future
                </span>
              </h2>
              <p className="text-lg text-zinc-500 leading-relaxed">
                EcoSphere is an enterprise-grade ESG management platform designed to help organizations measure, track, and improve their sustainability performance. Our platform combines real-time analytics with gamification to drive meaningful engagement.
              </p>
              <ul className="space-y-4">
                {[
                  'Real-time ESG scoring with drill-down analytics',
                  'Automated compliance monitoring and policy management',
                  'Employee engagement through gamification and rewards',
                  'Comprehensive audit trails and regulatory reporting',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-600">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
              >
                Get Started Today
                <ExternalLink className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Env. Score', value: '85.2', color: 'text-emerald-500' },
                    { label: 'Social Score', value: '79.8', color: 'text-blue-500' },
                    { label: 'Gov. Score', value: '91.4', color: 'text-purple-500' },
                    { label: 'Overall', value: '87.4', color: 'text-emerald-600' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-zinc-50 p-4 text-center">
                      <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                      <div className="text-xs text-zinc-500 mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  {['Environmental', 'Social', 'Governance'].map((pillar) => (
                    <div key={pillar} className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>{pillar}</span>
                        <span>{pillar === 'Environmental' ? '72%' : pillar === 'Social' ? '68%' : '84%'}</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: pillar === 'Environmental' ? '72%' : pillar === 'Social' ? '68%' : '84%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-full rounded-full ${pillar === 'Environmental' ? 'bg-emerald-500' :
                              pillar === 'Social' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-blue-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBIMjBWMjB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
              Ready to Transform Your ESG Journey?
            </h2>
            <p className="text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              Join thousands of organizations using EcoSphere to drive sustainability, improve compliance, and engage employees.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-emerald-700 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                EcoSphere
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href="/login" className="hover:text-emerald-600 transition-colors">Sign in</Link>
              <Link href="/register" className="hover:text-emerald-600 transition-colors">Register</Link>
              <span>© 2026 EcoSphere. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
    </svg>
  )
}

function DashboardMockup() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-zinc-500">ESG Dashboard</span>
        </div>
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-zinc-300" />
          <div className="h-2 w-2 rounded-full bg-zinc-300" />
          <div className="h-2 w-2 rounded-full bg-zinc-300" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Env.', value: '85.2', color: 'bg-emerald-500' },
          { label: 'Social', value: '79.8', color: 'bg-blue-500' },
          { label: 'Gov.', value: '91.4', color: 'bg-purple-500' },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-zinc-50 p-3 text-center">
            <div className={`h-1.5 w-full rounded-full ${item.color} mb-2`} />
            <div className="text-lg font-bold text-zinc-800">{item.value}</div>
            <div className="text-[10px] text-zinc-400">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-zinc-400">
          <span>Department Scores</span>
          <span>Trend</span>
        </div>
        {[
          { dept: 'Operations', score: 82, color: 'bg-emerald-500' },
          { dept: 'HR', score: 76, color: 'bg-blue-500' },
          { dept: 'Finance', score: 91, color: 'bg-purple-500' },
        ].map((item) => (
          <div key={item.dept} className="flex items-center gap-3">
            <span className="w-16 text-[10px] text-zinc-500">{item.dept}</span>
            <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.score}%` }} />
            </div>
            <span className="text-[10px] font-medium text-zinc-600">{item.score}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3">
        <div>
          <p className="text-xs font-medium text-emerald-700">Overall ESG Score</p>
          <p className="text-2xl font-bold text-emerald-600">87.4</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>+2.4%</span>
        </div>
      </div>
    </div>
  )
}
