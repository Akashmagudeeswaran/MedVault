import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Mail, Lock, User, Calendar, Phone, MapPin, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import { authAPI } from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authAPI.register(formData);
      setSuccess('Registration successful! Redirecting to login portal...');
      setTimeout(() => {
        navigate('/patient/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.data) {
        // Collect field validation messages
        const messages = Object.values(err.response.data).join(', ');
        setError(messages || 'Registration failed. Please check inputs.');
      } else {
        setError('Connection to backend lost.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.05),transparent_45%)]" />
      
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-2xl relative backdrop-blur-md">
        {/* Header logo details */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center mb-3">
            <Heart size={24} className="fill-current" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Create Health Profile</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Start managing your digital medical records securely</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Full Name *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User size={16} /></span>
                <input
                  type="text" required name="name" value={formData.name} onChange={handleChange} placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Email Address *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={16} /></span>
                <input
                  type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="john.doe@gmail.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Secret Password * (min 6 chars)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={16} /></span>
                <input
                  type="password" required name="password" minLength={6} value={formData.password} onChange={handleChange} placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Date of Birth *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Calendar size={16} /></span>
                <input
                  type="date" required name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Gender *</label>
              <select
                name="gender" required value={formData.gender} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:border-blue-500 focus:outline-none transition-all"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Blood Group */}
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Blood Group *</label>
              <select
                name="bloodGroup" required value={formData.bloodGroup} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:border-blue-500 focus:outline-none transition-all"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={16} /></span>
                <input
                  type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1-555-0199"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Emergency Contact Info *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><ShieldAlert size={16} /></span>
                <input
                  type="text" required name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Mary Doe (+1-555-0145)"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Home Address</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400"><MapPin size={16} /></span>
              <textarea
                name="address" rows={2} value={formData.address} onChange={handleChange} placeholder="123 Maple Street, Springfield"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all hover:shadow-lg hover:shadow-blue-500/10 active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Already have a Patient account?{' '}
            <Link to="/patient/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold transition-colors">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
