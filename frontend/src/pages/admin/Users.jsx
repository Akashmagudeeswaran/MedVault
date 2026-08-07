import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Power, UserCheck } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (roleFilter !== 'All') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    if (statusFilter !== 'All') {
      const isEnabled = statusFilter === 'Active';
      filtered = filtered.filter(u => u.enabled === isEnabled);
    }

    if (search.trim() !== '') {
      const query = search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to page 1 on search or filter change
  }, [search, roleFilter, statusFilter, users]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load system users list.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    // Avoid disabling oneself
    const currentUserEmail = localStorage.getItem('email');
    if (user.email === currentUserEmail) {
      toast.error('You cannot disable your own administrator account!');
      return;
    }

    try {
      await api.put(`/admin/users/${user.id}/toggle`);
      toast.success(`User account status updated successfully.`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Error toggling user account status.');
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'System Admin';
      case 'ROLE_DOCTOR': return 'Doctor';
      case 'ROLE_PATIENT': return 'Patient';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50';
      case 'ROLE_DOCTOR': return 'bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50';
      case 'ROLE_PATIENT': return 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">User Account Matrix</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Review active doctor, patient, and administrator log files and toggle system credentials</p>
      </div>

      {/* Filters, Categories and Search */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch">
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 shadow-sm flex-1 max-w-md">
          <Search size={16} className="text-slate-400 mr-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email address..."
            className="w-full bg-transparent border-none text-slate-700 dark:text-slate-300 placeholder-slate-400 text-xs focus:outline-none focus:ring-0"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 text-xs font-semibold">
          {/* Role Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">Role:</span>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl focus:outline-none"
            >
              <option value="All">All Roles</option>
              <option value="ROLE_ADMIN">Admin</option>
              <option value="ROLE_DOCTOR">Doctor</option>
              <option value="ROLE_PATIENT">Patient</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">Status:</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Disabled">Disabled Only</option>
            </select>
          </div>

          {/* Items Per Page */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">Page Size:</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl focus:outline-none"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          No system users found.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-950/25">
                    <th className="py-3.5 px-6">ID</th>
                    <th className="py-3.5 px-6">Full Name</th>
                    <th className="py-3.5 px-6">Email Address</th>
                    <th className="py-3.5 px-6">Assigned System Role</th>
                    <th className="py-3.5 px-6">Created On</th>
                    <th className="py-3.5 px-6">Access Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300 font-mono">#{u.id}</td>
                      <td className="py-4 px-6 font-semibold text-slate-800 dark:text-white">{u.name}</td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getRoleColor(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                          u.enabled 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50' 
                            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50'
                        }`}>
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg border transition-colors inline-flex items-center justify-center cursor-pointer ${
                            u.enabled
                              ? 'border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                              : 'border-rose-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                          }`}
                          title={u.enabled ? "Deactivate User Access" : "Activate User Access"}
                        >
                          <Power size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-6 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase">
                Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} entries
              </span>
              <div className="flex space-x-1 text-xs">
                <button 
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white shadow'
                        : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button 
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
