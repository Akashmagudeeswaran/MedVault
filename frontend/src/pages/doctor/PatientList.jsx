import React, { useState, useEffect } from 'react';
import { Users, Search, FolderOpen, Heart, Activity, FileText, ChevronRight } from 'lucide-react';
import api, { BASE_URL } from '../../services/api';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState({
    appointments: [],
    prescriptions: [],
    records: []
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const query = search.toLowerCase();
      setFilteredPatients(
        patients.filter(p => 
          p.user.name.toLowerCase().includes(query) || 
          (p.phone && p.phone.includes(query)) ||
          p.user.email.toLowerCase().includes(query)
        )
      );
    }
  }, [search, patients]);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/doctor/patients');
      setPatients(res.data);
      setFilteredPatients(res.data);
      if (res.data.length > 0) {
        handleSelectPatient(res.data[0]); // Select first patient by default
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    try {
      const apptRes = await api.get(`/admin/appointments`); // Get all to filter, or we can fetch by patient
      const patientAppts = apptRes.data.filter(a => a.patient.id === patient.id);
      
      const prescRes = await api.get(`/prescriptions/patient/${patient.id}`);
      const recRes = await api.get(`/records/patient/${patient.id}`);

      setPatientHistory({
        appointments: patientAppts,
        prescriptions: prescRes.data,
        records: recRes.data
      });
    } catch (err) {
      console.error('Error fetching patient history:', err);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Patient Directory</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Review assigned patient files, clinical history, and documents</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 overflow-hidden">
        {/* Left Side: Patient Directory List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col p-4 space-y-4 overflow-hidden">
          <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
            <Search size={16} className="text-slate-400 mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assigned patients..."
              className="w-full bg-transparent border-none text-slate-700 dark:text-slate-300 placeholder-slate-400 text-xs focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No matching patient records found.</div>
            ) : (
              filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    selectedPatient?.id === patient.id
                      ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/20'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{patient.user.name}</h4>
                    <span className="text-[10px] text-slate-400 mt-1 block">Blood Group: {patient.bloodGroup || 'N/A'}</span>
                  </div>
                  <ChevronRight size={14} className={selectedPatient?.id === patient.id ? 'text-emerald-500' : 'text-slate-400'} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Case File Details */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col overflow-hidden">
          {selectedPatient ? (
            <div className="flex-1 flex flex-col min-h-0 space-y-6 overflow-y-auto pr-1">
              {/* Profile Card Summary */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base shadow-sm">
                    {selectedPatient.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Case File: {selectedPatient.user.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{selectedPatient.user.email} | {selectedPatient.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2.5 text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                  <span className="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">Age: {selectedPatient.dateOfBirth ? (new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()) : 'N/A'}</span>
                  <span className="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">Blood: {selectedPatient.bloodGroup || 'N/A'}</span>
                  <span className="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">Gender: {selectedPatient.gender || 'N/A'}</span>
                </div>
              </div>

              {/* History Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                {/* Past Consultations */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 flex flex-col">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center">
                    <Activity size={14} className="mr-1.5 text-emerald-500" />
                    <span>Consultation History</span>
                  </h4>
                  <div className="flex-1 overflow-y-auto space-y-2 max-h-48 text-xs">
                    {patientHistory.appointments.length === 0 ? (
                      <div className="text-slate-400 text-center py-6">No clinical visits logged.</div>
                    ) : (
                      patientHistory.appointments.map(a => (
                        <div key={a.id} className="p-2 border border-slate-100 dark:border-slate-800 rounded-lg">
                          <div className="flex justify-between font-bold">
                            <span>{new Date(a.appointmentDate).toLocaleDateString()}</span>
                            <span className="text-emerald-500 uppercase text-[9px]">{a.status}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1">{a.symptoms || a.reason || 'Checkup'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Issued Prescriptions */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 flex flex-col">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center">
                    <FileText size={14} className="mr-1.5 text-teal-500" />
                    <span>Issued Prescriptions</span>
                  </h4>
                  <div className="flex-1 overflow-y-auto space-y-2 max-h-48 text-xs">
                    {patientHistory.prescriptions.length === 0 ? (
                      <div className="text-slate-400 text-center py-6">No prescriptions found.</div>
                    ) : (
                      patientHistory.prescriptions.map(p => (
                        <div key={p.id} className="p-2 border border-slate-100 dark:border-slate-800 rounded-lg flex justify-between items-center">
                          <div>
                            <span className="font-bold">{new Date(p.datePrescribed).toLocaleDateString()}</span>
                            <p className="text-slate-400 text-[9px] mt-0.5">{p.medicines?.length || 0} medicines prescribed</p>
                          </div>
                          <a
                            href={`${BASE_URL}/api/prescriptions/${p.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded text-[9px] font-bold transition-colors"
                          >
                            PDF
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Uploaded Diagnostics Scans & Reports */}
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center">
                  <FolderOpen size={14} className="mr-1.5 text-blue-500" />
                  <span>Diagnostics Scans & Reports</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {patientHistory.records.length === 0 ? (
                    <div className="col-span-2 text-slate-400 text-center py-6">No diagnostic scans found.</div>
                  ) : (
                    patientHistory.records.map(r => (
                      <div key={r.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl flex items-start justify-between">
                        <div className="min-w-0">
                          <span className="font-bold text-slate-700 dark:text-slate-200 block truncate">{r.title}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full font-medium inline-block mt-1">
                            {r.category}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(r.recordDate).toLocaleDateString()}</p>
                        </div>
                        {/* If file exists, show view button */}
                        {r.description && r.description.includes('uploads') ? (
                          <a
                            href={`${BASE_URL}${r.description}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-blue-600 font-bold"
                          >
                            Open
                          </a>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <FolderOpen size={48} className="mb-3 opacity-60" />
              <p className="text-xs">Select a patient from the directory to review their medical case file.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
