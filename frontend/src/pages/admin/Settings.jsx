import React, { useState } from 'react';
import { Shield, Settings as SettingsIcon, Save, KeyRound, Globe, Server, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function Settings() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [systemConfig, setSystemConfig] = useState({
    maintenanceMode: false,
    fileLimitMB: 20,
    twoFactorAuth: true,
    emailNotifications: true
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const toast = useToast();

  const handleConfigChange = (e) => {
    const { name, checked, value } = e.target;
    setSystemConfig({
      ...systemConfig,
      [name]: e.target.type === 'checkbox' ? checked : value
    });
  };

  const handleConfigSubmit = (e) => {
    e.preventDefault();
    setSavingConfig(true);
    setTimeout(() => {
      setSavingConfig(false);
      toast.success('System configuration saved successfully.');
    }, 1000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Administrator password changed successfully.');
    }, 1200);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">System Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Manage portal configurations, security credentials, and server properties</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: System Configurations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Globe size={18} className="text-blue-600" />
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Portal Properties</h3>
            </div>

            <form onSubmit={handleConfigSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Max File Size */}
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Maximum File Upload Limit (MB)</label>
                  <select 
                    name="fileLimitMB" 
                    value={systemConfig.fileLimitMB}
                    onChange={handleConfigChange}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white focus:outline-none"
                  >
                    <option value={10}>10 MB</option>
                    <option value={20}>20 MB (Default)</option>
                    <option value={50}>50 MB</option>
                  </select>
                </div>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                {/* Maintenance Mode */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-white">Maintenance Mode</span>
                    <p className="text-[10px] text-slate-400">Put the portal in offline mode for patients and doctors</p>
                  </div>
                  <input 
                    type="checkbox"
                    name="maintenanceMode"
                    checked={systemConfig.maintenanceMode}
                    onChange={handleConfigChange}
                    className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </label>

                {/* 2FA */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-white">Enforce Two-Factor Authentication</span>
                    <p className="text-[10px] text-slate-400">Enforce secondary OTP codes for administrator logins</p>
                  </div>
                  <input 
                    type="checkbox"
                    name="twoFactorAuth"
                    checked={systemConfig.twoFactorAuth}
                    onChange={handleConfigChange}
                    className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </label>

                {/* Email Notifications */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-white">Email Event Alerts</span>
                    <p className="text-[10px] text-slate-400">Send system alert emails on configuration changes</p>
                  </div>
                  <input 
                    type="checkbox"
                    name="emailNotifications"
                    checked={systemConfig.emailNotifications}
                    onChange={handleConfigChange}
                    className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

              <button 
                type="submit" 
                disabled={savingConfig}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow cursor-pointer transition-all hover:scale-[1.01]"
              >
                {savingConfig ? (
                  <>
                    <Server size={14} className="animate-spin" />
                    <span>Saving configurations...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Portal Settings</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Password and Profile Details */}
        <div className="space-y-6">
          {/* Admin Profile */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Shield size={32} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Active System Operator</h3>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">System Administrator</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">admin@gmail.com</p>
            </div>
            <span className="text-[9px] px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 font-bold uppercase tracking-wider rounded-full">
              Full System Access (Root)
            </span>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <KeyRound size={18} className="text-blue-600" />
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Change Credentials</h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Current Secure Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••" 
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">New Secure Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••••" 
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Confirm Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••" 
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white focus:outline-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={savingPassword}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow cursor-pointer transition-all hover:scale-[1.01]"
              >
                {savingPassword ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <span>Update Admin Password</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
