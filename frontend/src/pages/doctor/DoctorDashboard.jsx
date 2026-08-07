import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, CheckCircle, Clock, ArrowRight, UserCheck } from 'lucide-react';
import api from '../../services/api';

export default function DoctorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/doctor');
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load doctor dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-rose-500 font-semibold">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Clinical Dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Review your patient schedule, appointments queue, and histories</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Assigned Patients</span>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{stats?.totalAssignedPatients}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Completed Consultations</span>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{stats?.completedAppointments}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Bookings</span>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{stats?.pendingAppointments}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Grid of Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Queue */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Today's Appointment Queue</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold uppercase tracking-wider">
              {stats?.todayAppointments?.length || 0} Consultations
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {stats?.todayAppointments?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No scheduled consultations today.</div>
            ) : (
              stats?.todayAppointments?.map((appt) => (
                <div key={appt.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{appt.patient.user.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{appt.symptoms || 'Routine consulting'}</p>
                  </div>
                  <div className="flex items-center space-x-3 text-right">
                    <div className="text-[10px] text-slate-500 font-medium">
                      <Clock size={10} className="inline mr-1" />
                      {new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <button
                      onClick={() => navigate('/doctor/appointments')}
                      className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Upcoming Schedule</h3>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {stats?.upcomingAppointments?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No upcoming sessions scheduled.</div>
            ) : (
              stats?.upcomingAppointments?.map((appt) => (
                <div key={appt.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{appt.patient.user.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(appt.appointmentDate).toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
