import React, { useState, useEffect } from 'react';
import { FileText, Download, BarChart2, Activity, FileSpreadsheet } from 'lucide-react';
import api, { BASE_URL } from '../../services/api';

export default function ReportsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Analytical Reports</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Export clinical registries and system security logs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report 1: User Statistics */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">User Registry Statistics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Generates a comprehensive registry list of all administrators, clinical doctors, and registered patients. Includes contact metadata, profile details, account enabled states, and registration timestamps.
            </p>
          </div>
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-medium">Format: XLSX (Microsoft Excel)</span>
            <a
              href={`${BASE_URL}/api/admin/reports/excel/users`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              <Download size={14} />
              <span>Download Report</span>
            </a>
          </div>
        </div>

        {/* Report 2: Audit Logs */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">System Security Audit Logs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Exports a full security audit trail logging every administrative command, user login, patient self-registration, password reset, and upload event, along with client IP addresses.
            </p>
          </div>
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-medium">Format: XLSX (Microsoft Excel)</span>
            <a
              href={`${BASE_URL}/api/admin/reports/excel/audit-logs`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              <Download size={14} />
              <span>Download Report</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Activity metrics */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Historical Activity Highlights</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Doctors Registered</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white mt-1 block">{stats?.totalDoctors || 0}</span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Patients Registered</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white mt-1 block">{stats?.totalPatients || 0}</span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Total Consultations</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white mt-1 block">{stats?.totalAppointments || 0}</span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Medical File Uploads</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white mt-1 block">{stats?.totalMedicalRecords || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
