import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, FileText, Heart, ShieldCheck, Stethoscope, ArrowRight, Download, Activity, Clock } from 'lucide-react';
import api, { BASE_URL } from '../../services/api';

export default function PatientDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userName = localStorage.getItem('name') || 'Patient';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/patient');
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load patient dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-rose-500 font-semibold">{error}</div>;
  }

  const summary = stats?.healthSummary || {};

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Patient Care Center</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Hello, {userName}. Review your digital health card and clinical schedules</p>
      </div>

      {/* Health Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Blood Group & Doctor */}
        <div className="space-y-6 col-span-1">
          {/* Blood group */}
          <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">Personal Health Card</span>
              <Heart size={18} className="fill-white animate-pulse-slow" />
            </div>
            <div>
              <span className="text-[10px] block opacity-75">Blood Type Group</span>
              <p className="text-4xl font-black mt-1">{summary.bloodGroup || 'N/A'}</p>
            </div>
            <div className="pt-3 border-t border-white/20 text-[10px] opacity-90 flex justify-between items-center">
              <span>Primary Practitioner</span>
              <span className="font-bold flex items-center">
                <Stethoscope size={12} className="mr-1" />
                {summary.assignedDoctor}
              </span>
            </div>
          </div>

          {/* Immunization logs summary */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center">
              <ShieldCheck size={14} className="mr-1.5 text-emerald-500" />
              <span>Vaccination Ledger</span>
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto text-xs">
              {summary.vaccinations?.length === 0 ? (
                <div className="text-slate-400 text-center py-4">No vaccination records found.</div>
              ) : (
                summary.vaccinations?.map(v => (
                  <div key={v.id} className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="font-bold">{v.vaccineName}</span>
                      <p className="text-[9px] text-slate-400 mt-0.5">Administered: {new Date(v.dateAdministered).toLocaleDateString()}</p>
                    </div>
                    {v.nextDueDate && (
                      <span className="text-[8px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full font-bold">
                        Due: {new Date(v.nextDueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Latest prescription detailed card */}
        <div className="md:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center">
                <FileText size={16} className="mr-1.5 text-blue-500" />
                <span>Latest Prescription Sheet</span>
              </h3>
              {summary.latestPrescription && (
                <a
                  href={`${BASE_URL}/api/prescriptions/${summary.latestPrescription.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] rounded-lg shadow transition-colors"
                >
                  <Download size={12} />
                  <span>Download PDF Copy</span>
                </a>
              )}
            </div>

            {summary.latestPrescription ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Clinician Notes:</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{summary.latestPrescription.notes || 'No recovery notes provided.'}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Medications List:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {summary.latestPrescription.medicines?.map(m => (
                      <div key={m.id} className="p-2 border border-slate-100 dark:border-slate-800/80 rounded-lg bg-slate-50/20">
                        <span className="font-bold text-slate-800 dark:text-white block">{m.name} ({m.dosage})</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{m.frequency} | {m.duration}</span>
                        {m.instructions && <span className="text-[9px] text-blue-500 block mt-0.5">{m.instructions}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">No active medical prescriptions found.</div>
            )}
          </div>
          {summary.latestPrescription && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between mt-4">
              <span>Date Issued: {new Date(summary.latestPrescription.datePrescribed).toLocaleDateString()}</span>
              <span>Issued By: Dr. {summary.latestPrescription.doctor?.user.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming reservation slots and recent file entries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming appointments queue */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Upcoming Reservations</h3>
            <button onClick={() => navigate('/patient/appointments')} className="text-xs text-blue-600 hover:text-blue-500 font-semibold flex items-center">
              <span>Book Appointment</span>
              <ArrowRight size={14} className="ml-1" />
            </button>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {stats?.upcomingAppointments?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No upcoming doctor appointments scheduled.</div>
            ) : (
              stats?.upcomingAppointments?.map(a => (
                <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">Dr. {a.doctor.user.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{a.doctor.specialization} | {a.doctor.department}</p>
                  </div>
                  <div className="flex items-center space-x-3 text-right">
                    <div className="text-[10px] text-slate-500 font-semibold leading-tight">
                      <div className="flex items-center"><Calendar size={10} className="mr-1" /> {new Date(a.appointmentDate).toLocaleDateString()}</div>
                      <div className="flex items-center mt-0.5"><Clock size={10} className="mr-1" /> {new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent file uploads log */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Recent Health Documents</h3>
            <button onClick={() => navigate('/patient/records')} className="text-xs text-blue-600 hover:text-blue-500 font-semibold flex items-center">
              <span>View All Records</span>
              <ArrowRight size={14} className="ml-1" />
            </button>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {stats?.recentMedicalRecords?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No health records uploaded yet.</div>
            ) : (
              stats?.recentMedicalRecords?.map(r => (
                <div key={r.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/70 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{r.title}</p>
                    <p className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 mt-1 inline-block font-semibold uppercase tracking-wider">{r.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">{new Date(r.recordDate).toLocaleDateString()}</span>
                    {r.description && r.description.includes('uploads') ? (
                      <a
                        href={`${BASE_URL}${r.description}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-bold text-blue-600 hover:text-blue-500 block mt-1"
                      >
                        Open File
                      </a>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
