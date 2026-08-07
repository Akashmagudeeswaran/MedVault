import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Check, X, FileText, Plus, Trash2, Eye, Download } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function DoctorAppointments() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prescription Modal State
  const [showPrescModal, setShowPrescModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  
  // Prescription Form State
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/doctor/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/doctor/appointments/${id}/status`, null, {
        params: { status }
      });
      toast.success(`Appointment ${status.toLowerCase()} successfully!`);
      fetchAppointments();
    } catch (err) {
      toast.error('Error updating appointment status.');
    }
  };

  // Prescription Form Helpers
  const addMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicineRow = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = medicines.map((med, i) => {
      if (i === index) {
        return { ...med, [field]: value };
      }
      return med;
    });
    setMedicines(updated);
  };

  const openPrescriptionModal = (appt) => {
    setSelectedAppt(appt);
    setNotes('');
    setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setShowPrescModal(true);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        appointmentId: selectedAppt.id,
        patientId: selectedAppt.patient.id,
        doctorId: selectedAppt.doctor.id,
        datePrescribed: new Date().toISOString().substring(0, 10),
        notes,
        medicines: medicines.filter(m => m.name.trim() !== '')
      };

      await api.post('/prescriptions', payload);
      setShowPrescModal(false);
      fetchAppointments(); // Refresh queue (should show completed state)
      toast.success('Prescription created successfully!');
    } catch (err) {
      toast.error('Failed to save prescription.');
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
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Patient Schedule</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Review pending visits, approve appointments, and write clinical prescriptions</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          No appointments found in your clinical schedule.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-950/25">
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-6">Patient Name</th>
                  <th className="py-3.5 px-6">Reserved Date & Time</th>
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
                        <span className="font-semibold text-slate-800 dark:text-white">{appt.patient.user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center space-x-1">
                        <Clock size={12} className="text-slate-400" />
                        <span>{new Date(appt.appointmentDate).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 truncate max-w-[200px]" title={appt.symptoms}>
                      {appt.symptoms || appt.reason || 'Consultation'}
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
                              title="Accept Appointment"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(appt.id, 'REJECTED')}
                              className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-650 rounded border border-slate-200 dark:border-slate-800"
                              title="Reject Appointment"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {appt.status.toUpperCase() === 'APPROVED' && (
                          <button
                            onClick={() => openPrescriptionModal(appt)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center space-x-1"
                            title="Complete and Write Prescription"
                          >
                            <FileText size={12} />
                            <span>Complete & Prescribe</span>
                          </button>
                        )}
                        {appt.status.toUpperCase() === 'COMPLETED' && (
                          <span className="text-[10px] text-slate-400 font-semibold italic">Prescribed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Complete Appointment & Write Prescription */}
      {showPrescModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-6 my-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Write Clinical Prescription</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Patient: {selectedAppt?.patient.user.name}</p>
              </div>
              <button onClick={() => setShowPrescModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
              {/* Clinical Notes */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold">Clinical Notes / Recovery Instructions</label>
                <textarea 
                  rows={2} 
                  required
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Rest for 3 days, drink plenty of fluids, and check temperature twice daily."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white placeholder-slate-400 focus:outline-none" 
                />
              </div>

              {/* Medicines Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Medicines Registry</span>
                  <button 
                    type="button" 
                    onClick={addMedicineRow}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all"
                  >
                    <Plus size={12} />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {medicines.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl relative">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Name *</label>
                        <input 
                          type="text" required value={med.name} 
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)} 
                          placeholder="Paracetamol"
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Dosage *</label>
                        <input 
                          type="text" required value={med.dosage} 
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)} 
                          placeholder="500 mg"
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Frequency *</label>
                        <input 
                          type="text" required value={med.frequency} 
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)} 
                          placeholder="Twice Daily"
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Duration *</label>
                        <input 
                          type="text" required value={med.duration} 
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)} 
                          placeholder="5 days"
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 relative pr-8">
                        <label className="text-[10px] text-slate-400">Instructions</label>
                        <input 
                          type="text" value={med.instructions} 
                          onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)} 
                          placeholder="After meals"
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] dark:text-white focus:outline-none"
                        />
                        {medicines.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeMedicineRow(idx)}
                            className="absolute right-0 bottom-1.5 p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/10">
                Finalize & Issue Prescription Sheet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
