import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, RefreshCcw } from 'lucide-react';
import api from '../../services/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const query = search.toLowerCase();
    const actionMatch = log.action.toLowerCase().includes(query);
    const actorMatch = log.user ? log.user.email.toLowerCase().includes(query) : 'system'.includes(query);
    const detailsMatch = log.details ? log.details.toLowerCase().includes(query) : false;
    return actionMatch || actorMatch || detailsMatch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Security Audit Logs</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Review system activities, login events, and database actions</p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          title="Refresh Logs"
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 shadow-sm max-w-md">
        <Search size={18} className="text-slate-400 mr-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter logs by email, action, details..."
          className="w-full bg-transparent border-none text-slate-700 dark:text-slate-300 placeholder-slate-400 text-sm focus:outline-none focus:ring-0"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          No audit logs matching search query.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-950/25">
                  <th className="py-3.5 px-6">Log ID</th>
                  <th className="py-3.5 px-6">Action Operation</th>
                  <th className="py-3.5 px-6">Actor Account</th>
                  <th className="py-3.5 px-6">IP Address</th>
                  <th className="py-3.5 px-6">Details Description</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">#{log.id}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] uppercase font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200">{log.user ? log.user.email : 'SYSTEM'}</td>
                    <td className="py-4 px-6 font-mono text-slate-500">{log.ipAddress}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{log.details}</td>
                    <td className="py-4 px-6 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
