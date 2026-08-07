import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, ShieldAlert, Heart, Calendar, Lock, Check } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function PatientProfile() {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form profile state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: '',
    emergencyContact: ''
  });

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/patient/profile');
      setProfile(res.data);
      setFormData({
        name: res.data.user.name,
        phone: res.data.phone || '',
        dateOfBirth: res.data.dateOfBirth || '',
        gender: res.data.gender || '',
        bloodGroup: res.data.bloodGroup || '',
        address: res.data.address || '',
        emergencyContact: res.data.emergencyContact || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg('');
    try {
      const res = await api.put('/patient/profile', formData);
      setProfile(res.data);
      toast.success('Profile details updated successfully!');
    } catch (err) {
      toast.error('Error updating profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        email: profile.user.email,
        token: 'MOCK_TOKEN', // skip mock check in backend seeder
        newPassword
      });
      toast.success('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Failed to reset password.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">My Profile Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Manage your demographics details, emergency contact, and passwords</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Meta */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center font-bold text-2xl shadow-inner border border-blue-100 dark:border-blue-900/30">
            {profile?.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">{profile?.user.name}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{profile?.user.email}</p>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 font-bold uppercase tracking-wider">
            Patient File
          </span>
          
          <div className="w-full text-xs text-left space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <p><strong>Member Since:</strong> {new Date(profile?.user.createdAt).toLocaleDateString()}</p>
            <p><strong>Account Status:</strong> <span className="text-emerald-500 font-semibold">Active</span></p>
          </div>
        </div>

        {/* Right Column: Update details */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile details Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Demographic Details</h4>
            
            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold">Blood Group</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none">
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
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold">Emergency Contact</label>
                  <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold">Home Address</label>
                <textarea name="address" rows={2} value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none" />
              </div>
              
              <button type="submit" disabled={updating} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow transition-colors">
                <span>Save Profile Settings</span>
              </button>
            </form>
          </div>

          {/* Change Password settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Change Password</h4>
            
            {passwordSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold">New Password</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold">Confirm Password</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors">
                Update Account Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
