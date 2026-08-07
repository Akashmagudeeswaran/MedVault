import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Stethoscope, 
  Calendar, 
  XCircle, 
  CheckCircle2, 
  FileText, 
  Activity, 
  Edit, 
  Clipboard, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  ArrowUpDown,
  Filter
} from 'lucide-react';
import api from '../services/api';

export default function ActivityTimeline() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('Newest First');
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/activity');
      setActivities(res.data);
    } catch (err) {
      console.error('Error fetching timeline activities:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format Date (Today, Yesterday, Date string)
  const formatDate = (timeStr) => {
    const date = new Date(timeStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Format Time (10:15 AM)
  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Compute Relative Time (2 minutes ago, Yesterday, etc.)
  const getRelativeTime = (timeStr) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Dynamic styling based on activity type
  const getActivityStyles = (activityType) => {
    switch (activityType) {
      case 'New Patient Registered':
        return {
          icon: <Users size={14} />,
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
          textColor: 'text-emerald-655 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-800/40',
          dotColor: 'bg-emerald-500'
        };
      case 'New Doctor Added':
        return {
          icon: <Stethoscope size={14} />,
          bgColor: 'bg-blue-50 dark:bg-blue-950/40',
          textColor: 'text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40',
          dotColor: 'bg-blue-500'
        };
      case 'Appointment Booked':
        return {
          icon: <Calendar size={14} />,
          bgColor: 'bg-teal-50 dark:bg-teal-950/40',
          textColor: 'text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/40',
          dotColor: 'bg-teal-500'
        };
      case 'Appointment Cancelled':
        return {
          icon: <XCircle size={14} />,
          bgColor: 'bg-rose-50 dark:bg-rose-950/40',
          textColor: 'text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40',
          dotColor: 'bg-rose-500'
        };
      case 'Appointment Completed':
        return {
          icon: <CheckCircle2 size={14} />,
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
          textColor: 'text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40',
          dotColor: 'bg-emerald-500'
        };
      case 'Medical Record Uploaded':
        return {
          icon: <FileText size={14} />,
          bgColor: 'bg-purple-50 dark:bg-purple-950/40',
          textColor: 'text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40',
          dotColor: 'bg-purple-500'
        };
      case 'Prescription Created':
        return {
          icon: <Activity size={14} />,
          bgColor: 'bg-pink-50 dark:bg-pink-950/40',
          textColor: 'text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800/40',
          dotColor: 'bg-pink-500'
        };
      case 'Patient Profile Updated':
        return {
          icon: <Edit size={14} />,
          bgColor: 'bg-amber-50 dark:bg-amber-950/40',
          textColor: 'text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40',
          dotColor: 'bg-amber-500'
        };
      case 'Doctor Profile Updated':
        return {
          icon: <Clipboard size={14} />,
          bgColor: 'bg-orange-50 dark:bg-orange-950/40',
          textColor: 'text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/40',
          dotColor: 'bg-orange-500'
        };
      case 'Login Activity':
        return {
          icon: <LogIn size={14} />,
          bgColor: 'bg-green-50 dark:bg-green-950/40',
          textColor: 'text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/40',
          dotColor: 'bg-green-500'
        };
      case 'Logout Activity':
        return {
          icon: <LogOut size={14} />,
          bgColor: 'bg-slate-100 dark:bg-slate-900',
          textColor: 'text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/50',
          dotColor: 'bg-slate-500'
        };
      default:
        return {
          icon: <Activity size={14} />,
          bgColor: 'bg-slate-100 dark:bg-slate-900',
          textColor: 'text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/50',
          dotColor: 'bg-slate-500'
        };
    }
  };

  // Filtering Logic
  const filteredActivities = activities.filter(act => {
    // 1. Search Query Filter (User name or Description)
    const matchesSearch = 
      (act.user && act.user.toLowerCase().includes(search.toLowerCase())) ||
      (act.description && act.description.toLowerCase().includes(search.toLowerCase())) ||
      (act.activity && act.activity.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    // 2. Tab Filter
    if (filter === 'All') return true;
    if (filter === 'Patients') return act.role === 'Patient';
    if (filter === 'Doctors') return act.role === 'Doctor';
    if (filter === 'Appointments') {
      return act.activity === 'Appointment Booked' || act.activity === 'Appointment Cancelled' || act.activity === 'Appointment Completed';
    }
    if (filter === 'Medical Records') {
      return act.activity === 'Medical Record Uploaded' || act.activity === 'Prescription Created';
    }
    if (filter === 'Login Activity') {
      return act.activity === 'Login Activity' || act.activity === 'Logout Activity';
    }
    return true;
  });

  // Sorting Logic
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();
    return sortBy === 'Newest First' ? timeB - timeA : timeA - timeB;
  });

  // Paginated/Sliced List
  const displayedActivities = sortedActivities.slice(0, visibleCount);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-white">Activity Timeline</h3>
          <p className="text-slate-400 text-[10px] font-bold">Chronological ledger of clinical events, profile revisions, and authorizations</p>
        </div>
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {/* Sorting */}
          <div className="relative">
            <span className="absolute left-2.5 top-2.5 text-slate-400">
              <ArrowUpDown size={12} />
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-8 pr-6 py-2 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-[10px] font-bold cursor-pointer appearance-none min-w-[120px]"
            >
              <option value="Newest First">Newest First</option>
              <option value="Oldest First">Oldest First</option>
            </select>
            <ChevronDown size={10} className="absolute right-2.5 top-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(20); // Reset pagination on search
            }}
            placeholder="Search by user, activity description, or role..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 text-[10px] transition-colors"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          <Filter size={10} className="text-slate-400 mr-1 hidden sm:block shrink-0" />
          {['All', 'Patients', 'Doctors', 'Appointments', 'Medical Records', 'Login Activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setFilter(tab);
                setVisibleCount(20); // Reset pagination on filter change
              }}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === tab
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-slate-50 dark:bg-slate-950/40 text-slate-500 border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>

      {/* Timeline entries list */}
      <div className="relative">
        
        {loading ? (
          /* Loading Skeleton State */
          <div className="space-y-4 py-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex space-x-4 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800/80" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-slate-100 dark:bg-slate-800/80 rounded w-1/4" />
                  <div className="h-3.5 bg-slate-100 dark:bg-slate-800/80 rounded w-1/2" />
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded w-1/6" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedActivities.length === 0 ? (
          /* Empty state */
          <div className="py-12 text-center text-slate-400 italic">No Activity Found</div>
        ) : (
          <div className="relative pl-6 border-l border-slate-150 dark:border-slate-800 ml-4.5 py-2 space-y-6">
            
            {displayedActivities.map((act, index) => {
              const styles = getActivityStyles(act.activity);
              return (
                <div key={act.id} className="relative group">
                  
                  {/* Timeline bullet node */}
                  <span className="absolute -left-10 top-0.5 flex items-center justify-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${styles.bgColor} ${styles.textColor} shadow-sm z-10 hover:scale-105 transition-transform`}>
                      {styles.icon}
                    </span>
                    <span className={`absolute -right-0.5 -bottom-0.5 w-2 h-2 rounded-full border border-white dark:border-slate-900 ${styles.dotColor}`} />
                  </span>

                  {/* Activity Details Card */}
                  <div className="p-4 bg-slate-50/45 dark:bg-slate-950/15 border border-slate-150/60 dark:border-slate-800/50 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-950/25 transition-colors">
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-800 dark:text-white text-[11px]">{act.user}</span>
                        <span className={`px-1.5 py-0.2 rounded-md font-bold text-[8px] uppercase tracking-wider ${
                          act.role === 'Patient' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' :
                          act.role === 'Doctor' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                          'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {act.role}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-350 font-semibold text-[11px] leading-relaxed">
                        {act.description}
                      </p>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start shrink-0 text-right gap-1 self-stretch md:self-auto pt-1.5 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/50">
                      <span className="text-[10px] text-slate-400 font-bold">
                        {formatDate(act.time)} • {formatTime(act.time)}
                      </span>
                      <span className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold font-mono">
                        {getRelativeTime(act.time)}
                      </span>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Load More Button */}
      {!loading && sortedActivities.length > visibleCount && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => setVisibleCount(prev => prev + 20)}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 text-slate-500 dark:text-slate-400 font-bold rounded-2xl shadow-sm hover:shadow transition-all cursor-pointer text-[10px] bg-slate-50/50 dark:bg-slate-950/20 hover:bg-white dark:hover:bg-slate-900"
          >
            Load More Activities
          </button>
        </div>
      )}

    </div>
  );
}
