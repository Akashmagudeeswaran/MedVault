import React, { useState, useEffect } from 'react';
import { FileText, Search, Trash2, Eye, Download } from 'lucide-react';
import api, { BASE_URL } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const toast = useToast();

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    let filtered = records;

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(r => r.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    if (search.trim() !== '') {
      const query = search.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) || 
        (r.patient && r.patient.user && r.patient.user.name.toLowerCase().includes(query)) ||
        (r.fileName && r.fileName.toLowerCase().includes(query))
      );
    }

    setFilteredRecords(filtered);
  }, [search, categoryFilter, records]);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/admin/records');
      setRecords(res.data);
      setFilteredRecords(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve medical records.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical file record permanently?')) return;
    try {
      await api.delete(`/files/${id}`);
      toast.success('Medical record and associated file deleted.');
      fetchRecords();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete medical record.');
    }
  };

  const handlePreview = (record) => {
    if (!record.filePath) {
      toast.error('No attached file.');
      return;
    }
    window.open(`${BASE_URL}/api/files/${record.id}`, '_blank');
  };

  const handleDownload = (record) => {
    if (!record.id) return;
    window.open(`${BASE_URL}/api/files/${record.id}?download=true`, '_blank');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Medical Files Repository</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Review and manage clinical scans, lab reports, and prescriptions uploaded across the system</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 shadow-sm flex-1 max-w-md">
          <Search size={16} className="text-slate-400 mr-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, patient, or file name..."
            className="w-full bg-transparent border-none text-slate-700 dark:text-slate-300 placeholder-slate-400 text-xs focus:outline-none focus:ring-0"
          />
        </div>

        {/* Categories filters */}
        <div className="flex space-x-2 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
          {['All', 'Scan', 'X-Ray', 'Blood Report', 'Prescription', 'Other'].map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-4 py-2 rounded-xl border transition-all truncate cursor-pointer ${
                categoryFilter === category
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          No medical records found.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-950/25">
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-6">Title</th>
                  <th className="py-3.5 px-6">Patient Name</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">File Attachment Details</th>
                  <th className="py-3.5 px-6">Record Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300 font-mono">#{record.id}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-white">{record.title}</td>
                    <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">{record.patient?.user?.name || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                        {record.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {record.fileName ? (
                        <div className="text-[10px] text-slate-500 space-y-0.5">
                          <p className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{record.fileName}</p>
                          <p className="text-slate-400">{formatFileSize(record.fileSize)}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Attachment</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500">{new Date(record.recordDate).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {record.filePath && (
                          <>
                            <button
                              onClick={() => handlePreview(record)}
                              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Preview Report"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleDownload(record)}
                              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Download Report"
                            >
                              <Download size={14} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors cursor-pointer"
                          title="Delete Record"
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
    </div>
  );
}
