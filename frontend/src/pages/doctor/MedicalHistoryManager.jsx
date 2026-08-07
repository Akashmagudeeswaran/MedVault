import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Trash2, UploadCloud, X, CheckCircle, FileUp } from 'lucide-react';
import api, { BASE_URL } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function MedicalHistoryManager() {
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    title: '',
    description: '',
    category: 'Scan', // Scan, X-Ray, Blood Report, Prescription, Other
    recordDate: new Date().toISOString().substring(0, 10)
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const pRes = await api.get('/doctor/patients');
      setPatients(pRes.data);

      const rRes = await api.get('/records/patient/' + (pRes.data[0]?.id || '0')); // load for first patient as start
      setRecords(rRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = async (patientId) => {
    setLoading(true);
    setFormData({ ...formData, patientId });
    try {
      const rRes = await api.get(`/records/patient/${patientId}`);
      setRecords(rRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size exceeds 20 MB limit!');
        return;
      }
      setSelectedFile(file);
      setSelectedFileName(file.name);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId) {
      toast.error('Please select a patient first.');
      return;
    }

    setUploading(true);
    try {
      const actorId = localStorage.getItem('profileId');
      const payload = {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(actorId),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        recordDate: formData.recordDate
      };

      // 1. Create record metadata
      const recordRes = await api.post('/records', payload);
      const recordId = recordRes.data.id;

      // 2. Upload file if exists
      if (selectedFile) {
        const fileData = new FormData();
        fileData.append('file', selectedFile);
        fileData.append('testName', formData.title);
        
        await api.post(`/records/${recordId}/upload`, fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setShowAddModal(false);
      setSelectedFile(null);
      setSelectedFileName('');
      // Reload records list
      handlePatientSelect(formData.patientId);
      toast.success('Medical record added successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save medical record.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical record?')) return;
    try {
      await api.delete(`/records/${id}`);
      toast.success('Medical record deleted successfully.');
      handlePatientSelect(formData.patientId);
    } catch (err) {
      toast.error('Error deleting medical record.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Medical Files Uploads</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Upload and link diagnostics scans, clinical reports, or prescriptions directly to patient profiles</p>
        </div>
        <button
          onClick={() => {
            setFormData({ ...formData, title: '', description: '' });
            setSelectedFile(null);
            setSelectedFileName('');
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition-all hover:scale-[1.02]"
        >
          <FileUp size={16} />
          <span>Upload Medical File</span>
        </button>
      </div>

      {/* Select Patient Profile */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm items-center justify-between">
        <div className="space-y-1 w-full sm:max-w-xs">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select Patient File</label>
          <select
            value={formData.patientId}
            onChange={(e) => handlePatientSelect(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white mt-1 focus:outline-none"
          >
            <option value="">Select Patient Profile</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.user.name} ({p.user.email})</option>
            ))}
          </select>
        </div>
        
        {formData.patientId && (
          <span className="text-[10px] px-2.5 py-1 rounded bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400 font-bold uppercase tracking-wider">
            {records.length} files attached
          </span>
        )}
      </div>

      {/* Medical Records Files table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !formData.patientId ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          Please select a patient profile to review or upload files.
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          No medical records found for this patient.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {records.map((record) => (
            <div key={record.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs">{record.title}</h4>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 font-bold uppercase tracking-wider">
                    {record.category}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteRecord(record.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors"
                  title="Delete File Record"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">{record.description || 'No clinical case description added.'}</p>
              
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Date: {new Date(record.recordDate).toLocaleDateString()}</span>
                {/* Find report file details if any description includes attachment details */}
                {record.description && record.description.includes('uploads') ? (
                  <a
                    href={`${BASE_URL}${record.description}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <span>Open Attached File</span>
                  </a>
                ) : (
                  <span className="text-slate-400 italic">No File Uploaded</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Upload / Add Medical File */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">Upload Diagnostic Document</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Associated Patient *</label>
                <select
                  required
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none"
                >
                  <option value="">Select Patient Profile</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.user.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Document Title *</label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="X-Ray Chest Posteroanterior" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Category Type *</label>
                  <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none">
                    <option value="Scan">Scan</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="Blood Report">Blood Report</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Document Date *</label>
                  <input type="date" name="recordDate" required value={formData.recordDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Clinical Description</label>
                <textarea name="description" rows={2} value={formData.description} onChange={handleInputChange} placeholder="Visual inspection confirms minor fracture on the left side rib cage." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none" />
              </div>

              {/* Upload Drag/Drop zone box */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-semibold">File Upload (PDF, JPG, PNG, max 20MB) *</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-950/20 relative transition-colors">
                  <input
                    type="file"
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <div className="flex flex-col items-center space-y-1">
                    <UploadCloud size={28} className="text-slate-400" />
                    {selectedFileName ? (
                      <span className="text-[10px] text-emerald-600 font-semibold max-w-[200px] truncate">{selectedFileName}</span>
                    ) : (
                      <>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Click or Drag to Upload</span>
                        <span className="text-[9px] text-slate-400">PDF, JPG, PNG up to 20MB</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={uploading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2">
                {uploading ? 'Processing File Upload...' : 'Save & Upload Document'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
