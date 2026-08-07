import React, { useState, useEffect } from 'react';
import { Clock, Stethoscope, CalendarCheck, Loader2, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Book Appointment form state
  const [showBookModal, setShowBookModal] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    symptoms: '',
    reason: ''
  });
  const [booking, setBooking] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const apptRes = await api.get('/patient/appointments');
      setAppointments(apptRes.data);

      const docRes = await api.get('/patient/doctors');
      setDoctors(docRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load consultation history.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorId) {
      toast.error('Please select a doctor.');
      return;
    }

    setBooking(true);
    try {
      await api.post('/patient/appointments', {
        doctorId: parseInt(formData.doctorId),
        appointmentDate: formData.appointmentDate,
        symptoms: formData.symptoms,
        reason: formData.reason
      });
      setShowBookModal(false);
      setFormData({
        doctorId: '',
        appointmentDate: '',
        symptoms: '',
        reason: ''
      });
      fetchData(); // Refresh appointment history
      toast.success('Appointment booked successfully! Pending doctor approval.');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to book appointment. Try selecting a different date.';
      toast.error(errMsg);
    } finally {
      setBooking(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/patient/appointments/${id}/cancel`);
      toast.success('Appointment cancelled successfully.');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Error cancelling appointment.');
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">My Consultations</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Book new checkups, review upcoming visits, and cancel bookings</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              doctorId: '',
              appointmentDate: '',
              symptoms: '',
              reason: ''
            });
            setShowBookModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <CalendarCheck size={16} />
          <span>Book Consultation</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          No appointments scheduled. Click 'Book Consultation' to schedule a visit.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-950/25">
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-6">Practitioner</th>
                  <th className="py-3.5 px-6">Specialization</th>
                  <th className="py-3.5 px-6">Date & Time</th>
                  <th className="py-3.5 px-6">Symptoms Description</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300 font-mono">#{appt.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Stethoscope size={14} className="text-teal-500" />
                        <span className="font-semibold text-slate-800 dark:text-white">Dr. {appt.doctor.user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{appt.doctor.specialization}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center space-x-1">
                        <Clock size={12} className="text-slate-400" />
                        <span>{new Date(appt.appointmentDate).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 truncate max-w-[200px]" title={appt.symptoms}>
                      {appt.symptoms || appt.reason || 'General consulting'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {['PENDING', 'APPROVED'].includes(appt.status.toUpperCase()) ? (
                        <button
                          onClick={() => handleCancelAppointment(appt.id)}
                          className="px-2.5 py-1 text-rose-500 border border-rose-200 dark:border-rose-950/40 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No Action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Book Appointment */}
      {showBookModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Schedule Medical Visit</h3>
              <button onClick={() => setShowBookModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Select Care Practitioner *</label>
                <select
                  required
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none"
                >
                  <option value="">Select Practitioner</option>
                  {doctors.filter(d => d.user && d.user.enabled).map(d => (
                    <option key={d.id} value={d.id}>Dr. {d.user.name} ({d.specialization})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Scheduled Date & Time *</label>
                <input 
                  type="datetime-local" 
                  name="appointmentDate" 
                  required 
                  value={formData.appointmentDate} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Active Symptoms *</label>
                <textarea 
                  name="symptoms" 
                  required 
                  rows={2}
                  value={formData.symptoms} 
                  onChange={handleInputChange} 
                  placeholder="Headache, running nose, fever since last evening."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none placeholder-slate-400" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Reason for Visit</label>
                <input 
                  type="text" 
                  name="reason" 
                  value={formData.reason} 
                  onChange={handleInputChange} 
                  placeholder="Routine consulting or follow-up checkup"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none placeholder-slate-400" 
                />
              </div>

              <button type="submit" disabled={booking} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/10 cursor-pointer">
                {booking ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <span>Book Appointment Slot</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
