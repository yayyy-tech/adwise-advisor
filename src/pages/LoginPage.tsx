import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { useAdvisorStore } from '../store/useAdvisorStore';
import { supabase } from '../lib/supabase';

const STATS = [
  { value: '\u20b92.8Cr', desc: 'Average AUM per advisor on Adwise' },
  { value: '94%', desc: 'Client retention rate across our advisor network' },
  { value: '4.8\u2605', desc: 'Average platform rating from 2,400+ client reviews' },
  { value: '18 days', desc: 'Average time from first lead to signed engagement' },
];
const QUOTES = [
  { text: '\u201cI closed 3 new clients in my first month without any cold outreach.\u201d', name: 'Deepak I., Chennai' },
  { text: '\u201cThe document system alone saves me 2 hours per client onboarding.\u201d', name: 'Sneha N., Delhi' },
  { text: '\u201cMy clients trust the platform. That trust transfers to me.\u201d', name: 'Rohan M., Mumbai' },
  { text: '\u201cThe CRM pipeline gives me clarity I never had before.\u201d', name: 'Ananya S., Pune' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, mustChangePassword, profileCompleted } = useAdvisorStore();
  const [idx, setIdx] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (mustChangePassword) navigate('/onboarding');
      else if (!profileCompleted) navigate('/onboarding');
      else navigate('/dashboard');
    }
  }, [isAuthenticated, mustChangePassword, profileCompleted, navigate]);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % 4), 4000);
    return () => clearInterval(t);
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setError('');
    setResetSent(false);
    setLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      }
    } catch (e: any) {
      setError(e.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setError(error.message);
      } else {
        setResetSent(true);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to send reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left - Cream */}
      <div className="w-full md:w-[480px] md:min-w-[480px] bg-light-base p-8 flex flex-col">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <span className="mt-1 inline-flex w-fit rounded-full bg-dark-base px-2.5 py-0.5 font-body text-[10px] font-medium uppercase tracking-wider text-dark-muted">Advisor Portal</span>

        <div className="flex flex-1 flex-col justify-center max-w-[380px] mt-8">
          <h1 className="font-display text-[32px] leading-tight text-light-text">
            Your practice. Your clients.<br />All in one place.
          </h1>
          <p className="mt-3 font-body text-sm text-light-muted">Log in to access your dashboard, client pipeline, and documents.</p>

          <div className="mt-8 space-y-3">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="h-12 w-full rounded-[12px] border border-light-border bg-white px-4 font-body text-[15px] text-light-text placeholder:text-light-muted focus:border-teal focus:outline-none" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} type="password" placeholder="Password" className="h-12 w-full rounded-[12px] border border-light-border bg-white px-4 font-body text-[15px] text-light-text placeholder:text-light-muted focus:border-teal focus:outline-none" />
            {error && <p className="font-body text-xs text-red-500">{error}</p>}
            {resetSent && <p className="font-body text-xs text-teal">Password reset email sent. Check your inbox.</p>}
            <Button variant="primary" size="lg" fullWidth onClick={handleLogin} disabled={loading} className="bg-dark-base text-white hover:bg-dark-surface-2">{loading ? 'Signing in...' : 'Sign In'} &rarr;</Button>
            <button type="button" onClick={handleForgotPassword} disabled={resetLoading} className="w-full text-center font-body text-sm text-light-muted hover:text-teal">{resetLoading ? 'Sending...' : 'Forgot password?'}</button>
          </div>

          <p className="mt-8 font-body text-xs text-light-muted">
            Looking for financial advice? <a href="/" className="text-teal hover:underline">Find an advisor &rarr;</a>
          </p>
        </div>
      </div>

      {/* Right - Dark */}
      <div className="flex-1 bg-dark-base noise-bg flex items-center justify-center p-8 min-h-[300px]">
        <div className="relative z-10 flex w-full max-w-[400px] flex-col items-center gap-8">
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="w-full rounded-[20px] bg-dark-surface p-8 border border-dark-border">
              <p className="font-mono text-[48px] font-medium text-white leading-none">{STATS[idx].value}</p>
              <p className="mt-3 font-body text-sm text-dark-muted">{STATS[idx].desc}</p>
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <p className="font-display italic text-xl text-white leading-snug">{QUOTES[idx].text}</p>
              <p className="mt-3 font-body text-[13px] text-dark-muted">&mdash; {QUOTES[idx].name}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <button key={i} onClick={() => setIdx(i)} className={`h-2 w-2 rounded-full transition-colors ${i === idx ? 'bg-teal' : 'bg-dark-muted-2'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
