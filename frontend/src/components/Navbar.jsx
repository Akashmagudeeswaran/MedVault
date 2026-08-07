import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Check, AlertCircle } from 'lucide-react';
import api from '../services/api';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const userName = localStorage.getItem('name') || 'User';
  const userRole = localStorage.getItem('role') || 'ROLE_PATIENT';
  const userEmail = localStorage.getItem('email') || '';

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Administrator';
      case 'ROLE_DOCTOR': return 'Medical Doctor';
      case 'ROLE_PATIENT': return 'Patient';
      default: return 'User';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50';
      case 'ROLE_DOCTOR': return 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-900/50';
      case 'ROLE_PATIENT': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll notifications every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      const countRes = await api.get('/notifications/unread-count');
      setUnreadCount(countRes.data.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    // Redirect based on role
    if (userRole === 'ROLE_ADMIN') {
      navigate('/admin/login');
    } else if (userRole === 'ROLE_DOCTOR') {
      navigate('/doctor/login');
    } else {
      navigate('/patient/login');
    }
  };

  return (
    <header className="h-16 px-6 glass-panel border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-colors duration-200">
      {/* Brand logo details */}
      <div className="flex items-center space-x-2 lg:hidden">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">MedVault</span>
      </div>
      
      <div className="hidden lg:flex items-center space-x-1">
        <span className="text-sm text-slate-500 dark:text-slate-400">Welcome back,</span>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{userName}</span>
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ml-2 ${getRoleColor(userRole)}`}>
          {getRoleLabel(userRole)}
        </span>
      </div>

      <div className="flex items-center space-x-4 ml-auto">
        <ThemeToggle />

        {/* Notifications Icon with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 relative border border-slate-200 dark:border-slate-700"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden z-50 transition-all">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Notifications</span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium rounded-full">
                  {unreadCount} Unread
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 border-b border-slate-100 dark:border-slate-800 flex items-start space-x-3 transition-colors ${notif.isRead ? 'opacity-70 bg-transparent' : 'bg-blue-50/30 dark:bg-blue-950/10'}`}
                    >
                      <div className="mt-0.5">
                        <AlertCircle size={16} className={notif.isRead ? 'text-slate-400' : 'text-blue-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-semibold text-slate-800 dark:text-slate-200 truncate ${!notif.isRead && 'font-bold'}`}>{notif.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                      {!notif.isRead && (
                        <button 
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-green-600 transition-colors"
                          title="Mark as read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-full bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center font-bold text-sm shadow-inner border border-blue-200 dark:border-blue-900/30">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left min-w-[70px]">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{userEmail}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
