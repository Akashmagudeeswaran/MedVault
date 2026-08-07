import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Mail, Lock, User, Stethoscope, Building, FileUp, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function DoctorSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    hospital: '',
    specialization: ''
  });
  
  const [mbbsFile, setMbbsFile] = useState(null);
  const [mbbsFileName, setMbbsFileName] = useState('');
  const [expFile, setExpFile] = useState(null);
  const [expFileName, setExpFileName] = useState('');

  const [loading, setLoading] = useState(false);
  
  const mbbsInputRef = useRef(null);
  const expInputRef = useRef(null);
  
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, fileType) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Limit to 20MB
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size exceeds the 20 MB limit!');
        return;
      }

      const allowedExts = ['pdf', 'jpg', 'jpeg', 'png'];
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowedExts.includes(ext)) {
        toast.error('Unsupported file format! Only PDF, JPG, JPEG, and PNG are allowed.');
        return;
      }

      if (fileType === 'mbbs') {
        setMbbsFile(file);
        setMbbsFileName(file.name);
      } else {
        setExpFile(file);
        setExpFileName(file.name);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('hospital', formData.hospital);
    data.append('specialization', formData.specialization);
    if (mbbsFile) {
      data.append('mbbsCertificate', mbbsFile);
    }
    if (expFile) {
      data.append('experienceCertificate', expFile);
    }

    try {
      await api.post('/auth/doctor/signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Application submitted successfully! It is pending administrator review.');
      setTimeout(() => {
        navigate('/doctor/login');
      }, 2500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,184,166,0.05),transparent_45%)]" />
      
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-2xl relative backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm mb-4">
            <Heart size={24} className="fill-current animate-pulse-slow" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Practitioner Portal</h2>
          <p className="text-slate-400 text-xs mt-1 font-medium">Apply to join MedVault as an approved health practitioner</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-slate-500">Full Name *</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dr. John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-slate-500">Email Address *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="johndoe@hospital.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl dark:text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-slate-500">Secure Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Specialization */}
            <div className="space-y-1.5">
              <label className="text-slate-500">Clinical Specialization *</label>
              <div className="relative">
                <Stethoscope size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Cardiology, Pediatrics"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Hospital */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-slate-500">Hospital / Affiliated Medical Department *</label>
              <div className="relative">
                <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  placeholder="City General Hospital"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Certificate Attachments */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Verification Credentials</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* MBBS Certificate */}
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
                <input
                  type="file"
                  ref={mbbsInputRef}
                  onChange={(e) => handleFileChange(e, 'mbbs')}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => mbbsInputRef.current?.click()}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] text-slate-600 dark:text-slate-350 cursor-pointer"
                >
                  <FileUp size={12} />
                  <span>MBBS Certificate (Optional)</span>
                </button>
                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                  {mbbsFileName || 'PDF, JPG or PNG (Max 20MB)'}
                </span>
              </div>

              {/* Experience Certificate */}
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
                <input
                  type="file"
                  ref={expInputRef}
                  onChange={(e) => handleFileChange(e, 'exp')}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => expInputRef.current?.click()}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] text-slate-600 dark:text-slate-350 cursor-pointer"
                >
                  <FileUp size={12} />
                  <span>Experience Certificate (Optional)</span>
                </button>
                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                  {expFileName || 'PDF, JPG or PNG (Max 20MB)'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/10 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>Submit Practitioner Application</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="text-center pt-2 text-slate-400 text-[10px] font-medium">
            Already applied?{' '}
            <Link to="/doctor/login" className="text-teal-500 font-bold hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
