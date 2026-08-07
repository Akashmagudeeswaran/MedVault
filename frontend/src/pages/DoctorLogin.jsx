import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope, Eye, EyeOff, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { authAPI } from '../services/api';

export default function DoctorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.login(email, password, 'ROLE_DOCTOR');
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('email', res.data.email);
      localStorage.setItem('name', res.data.name);
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('profileId', res.data.profileId);
      
      if (rememberMe) {
        localStorage.setItem('rememberDoctorEmail', email);
      } else {
        localStorage.removeItem('rememberDoctorEmail');
      }

      navigate('/doctor/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        setError(err.response.data.message || 'Invalid Email or Password.');
      } else {
        setError('Invalid Email or Password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_45%)]" />
      
      <div className="w-full max-w-md bg-slate-950/40 border border-slate-800 rounded-3xl p-8 shadow-2xl relative backdrop-blur-md">
        {/* Portal Icon Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/5">
            <Stethoscope size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Doctor Portal</h2>
          <p className="text-slate-400 text-xs mt-1">Access clinical charts, schedules, and prescriptions</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email input field */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-semibold">Clinical Email</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@medvault.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-semibold">Clinical Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me options */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-800 bg-slate-900 text-emerald-600 focus:ring-0"
              />
              <span>Remember Me</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>Sign In Securely</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-800/80 pt-6 text-center">
          <p className="text-slate-500 text-xs mb-2">
            Are you a practitioner?{' '}
            <Link to="/doctor/signup" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors font-semibold">
              Apply to join MedVault
            </Link>
          </p>
          <p className="text-slate-500 text-xs">
            Not a Doctor?{' '}
            <Link to="/patient/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Patient Care Portal
            </Link>
            {' '}|{' '}
            <Link to="/admin/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Admin Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
