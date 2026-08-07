import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Stethoscope, Users, Check, X, CalendarClock, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AppointmentManager() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Reschedule state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newDateTime, setNewDateTime] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/admin/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch appointment schedules.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/appointments/${id}/status`, null, {
        params: { status }
      });
      toast.success(`Appointment status updated to ${status.toLowerCase()}!`);
      fetchAppointments();
    } catch (err) {
      toast.error('Error updating appointment status.');
    }
  };

  const openRescheduleModal = (appt) => {
    setSelectedAppt(appt);
    setNewDateTime(appt.appointmentDate.substring(0, 16)); // prefill date-time picker format
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/appointments/${selectedAppt.id}/reschedule`, null, {
        params: { newDate: newDateTime }
      });
      setShowRescheduleModal(false);
      toast.success('Appointment rescheduled successfully!');
      fetchAppointments();
    } catch (err) {
      toast.error('Error rescheduling appointment.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await api.delete(`/admin/appointments/${id}`);
      toast.success('Appointment deleted successfully.');
      fetchAppointments();
    } catch (err) {
      toast.error('Error deleting appointment.');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50';
      case 'APPROVED': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50';
      case 'REJECTED': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50';
      case 'CANCELLED': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Appointments Ledger</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Review clinical reservations, approve queues, and reschedule sessions</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          No appointments found in the system ledger.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-950/25">
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-6">Patient Name</th>
                  <th className="py-3.5 px-6">Doctor Assigned</th>
                  <th className="py-3.5 px-6">Schedule Date & Time</th>
                  <th className="py-3.5 px-6">Symptoms Description</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">#{appt.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Users size={14} className="text-blue-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{appt.patient.user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Stethoscope size={14} className="text-teal-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Dr. {appt.doctor.user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center space-x-1">
                        <Clock size={12} className="text-slate-400" />
                        <span>{new Date(appt.appointmentDate).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 truncate max-w-[200px]" title={appt.symptoms}>
                      {appt.symptoms || appt.reason || 'Routine Checkup'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {appt.status.toUpperCase() === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(appt.id, 'APPROVED')}
                              className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 rounded border border-slate-200 dark:border-slate-800"
                              title="Approve"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(appt.id, 'REJECTED')}
                              className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded border border-slate-200 dark:border-slate-800"
                              title="Reject"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {['PENDING', 'APPROVED'].includes(appt.status.toUpperCase()) && (
                          <button
                            onClick={() => openRescheduleModal(appt)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 rounded border border-slate-200 dark:border-slate-800"
                            title="Reschedule"
                          >
                            <CalendarClock size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(appt.id)}
                          className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded border border-slate-200 dark:border-slate-800"
                          title="Delete Appointment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Reschedule Appointment */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">Reschedule Appointment</h3>
              <button onClick={() => setShowRescheduleModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold">New Date & Time</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={newDateTime} 
                  onChange={(e) => setNewDateTime(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" 
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                Reschedule Session
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
