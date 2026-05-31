import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, Zap, Target, CheckCircle } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: 'easeOut' } }) };

export default function Landing() {
  return (
    <div style={{ background: '#0a0a0f', color: '#e2e8f0', fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
              <Zap size={18} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>Rejection<span style={{ color: '#818cf8' }}>IQ</span></span>
          </div>
          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}
              onMouseOver={e => e.target.style.color='#f1f5f9'} onMouseOut={e => e.target.style.color='#94a3b8'}>Features</a>
            <a href="#how" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}
              onMouseOver={e => e.target.style.color='#f1f5f9'} onMouseOut={e => e.target.style.color='#94a3b8'}>How It Works</a>
            <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Sign In</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 180, paddingBottom: 120, position: 'relative', overflow: 'hidden' }} className="bg-grid">
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(236,72,153,0.12), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', fontSize: 12, fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px #6366f1', display: 'inline-block' }} />
            AI-Powered Rejection Intelligence Engine
          </motion.div>

          <motion.h1 initial="hidden" animate="visible" custom={1} variants={fadeUp}
            style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(48px, 8vw, 84px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-2px', marginBottom: 28 }}>
            Stop Guessing Why You're{' '}
            <span style={{ background: 'linear-gradient(135deg, #a5b4fc, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Getting Rejected.
            </span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" custom={2} variants={fadeUp}
            style={{ fontSize: 18, lineHeight: 1.75, color: '#94a3b8', maxWidth: 620, margin: '0 auto 48px', fontWeight: 400 }}>
            The world's first recruitment intelligence platform. Our ML engine diagnoses your exact failure point — ATS filter, skill gap, or culture fit — in under 15 seconds.
          </motion.p>

          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
              Get Your Free Diagnosis <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary" style={{ fontSize: 16, padding: '14px 32px' }}>
              Sign In
            </Link>
          </motion.div>

          {/* TRUST ROW */}
          <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}
            style={{ marginTop: 64, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            {['Resume Parse', 'NLP Diagnosis', 'Gap Analysis', '30-Day Sprint', 'Peer Benchmarks'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', padding: '6px 14px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.06)' }}>
                <CheckCircle size={13} color="#6366f1" /> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
          {[['2,400+', 'Resumes Analyzed'], ['94%', 'Diagnosis Accuracy'], ['87%', 'Sprint Completion'], ['3.2×', 'Interview Rate Lift']].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 42, fontWeight: 800, letterSpacing: '-1px', background: 'linear-gradient(135deg,#a5b4fc,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{num}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', letterSpacing: '0.04em', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '120px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 16 }}>
              Built for <span style={{ color: '#818cf8' }}>serious</span> job seekers.
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>Every feature is engineered around one goal: getting you from rejection to offer.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: <Zap size={24} color="#818cf8" />, title: 'AI Rejection Diagnosis', color: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', desc: 'NLP engine parses your rejection email to classify the exact failure category — culture fit, skills gap, or internal freeze.' },
              { icon: <BarChart2 size={24} color="#c084fc" />, title: 'Peer Benchmarking', color: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)', desc: 'Compare your CGPA, skill stack, and project count against successful candidates for your target roles.' },
              { icon: <Target size={24} color="#34d399" />, title: '30-Day Recovery Sprint', color: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', desc: 'A personalized, AI-generated task plan every morning to close the gaps identified in your diagnosis.' },
            ].map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 40, transition: 'all 0.3s ease', cursor: 'default' }}
                whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.color, border: `1px solid ${f.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 14, letterSpacing: '-0.5px' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '100px 32px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 16 }}>How It Works</h2>
          <p style={{ color: '#64748b', marginBottom: 72, fontSize: 16 }}>Four steps from rejection to recovery.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[['01', 'Upload Resume', 'We parse your PDF and extract your skills & experience profile.'],
              ['02', 'Log Rejection', 'Paste the rejection email and fill in your application timeline.'],
              ['03', 'Get Diagnosed', 'The ML engine identifies your exact failure stage with 94% accuracy.'],
              ['04', 'Follow Sprint', 'Complete your 30-day AI-generated plan and apply stronger.']].map(([n, title, desc]) => (
              <motion.div key={n} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                style={{ padding: 28, textAlign: 'left', position: 'relative' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: 'rgba(99,102,241,0.12)', marginBottom: 16, lineHeight: 1 }}>{n}</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10, letterSpacing: '-0.3px' }}>{title}</div>
                <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 32px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', padding: '80px 60px', borderRadius: 28, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(192,132,252,0.1))', border: '1px solid rgba(99,102,241,0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '140%', height: '200%', background: 'radial-gradient(circle at center, rgba(99,102,241,0.08), transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 20, lineHeight: 1.1 }}>
              Start diagnosing your rejections today.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 40 }}>Free to use. No credit card. Results in seconds.</p>
            <Link to="/register" className="btn-primary" style={{ fontSize: 16, padding: '16px 40px' }}>
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>Rejection<span style={{ color: '#818cf8' }}>IQ</span></span>
          </div>
          <p style={{ color: '#475569', fontSize: 13 }}>© 2024 RejectionIQ — Final Year Project. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => <a key={l} href="#" style={{ color: '#475569', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='#94a3b8'} onMouseOut={e => e.target.style.color='#475569'}>{l}</a>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
