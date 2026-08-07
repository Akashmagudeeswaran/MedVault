import React, { useState, useEffect, useRef } from 'react';
import { FileText, Search, Trash2, UploadCloud, X, FileUp, Download, Eye, Loader2 } from 'lucide-react';
import api, { BASE_URL } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function MedicalHistory() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Custom Preview modal state
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  
  const fileInputRef = useRef(null);
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
        (r.description && r.description.toLowerCase().includes(query)) ||
        (r.fileName && r.fileName.toLowerCase().includes(query))
      );
    }

    setFilteredRecords(filtered);
  }, [search, categoryFilter, records]);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/patient/records');
      setRecords(res.data);
      setFilteredRecords(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load medical records.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file size (20 MB limit)
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size exceeds the 20 MB limit!');
        return;
      }

      // Validate file extension
      const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        toast.error('Unsupported file type! Only PDF, JPG, JPEG, and PNG are allowed.');
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        await api.post('/patient/records/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Medical report uploaded successfully!');
        fetchRecords();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to upload report.');
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input
        }
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical file record?')) return;
    try {
      await api.delete(`/files/${id}`);
      toast.success('Medical record deleted successfully!');
      fetchRecords();
    } catch (err) {
      console.error(err);
      toast.error('Error deleting medical record.');
    }
  };

  const handlePreview = (record) => {
    if (!record.filePath) {
      toast.error('No attached file for this record.');
      return;
    }

    const fileUrl = `${BASE_URL}/api/files/${record.id}`;
    const fileExtension = record.filePath.split('.').pop().toLowerCase();

    if (fileExtension === 'pdf') {
      window.open(fileUrl, '_blank');
    } else if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      setPreviewImageUrl(fileUrl);
    } else {
      toast.warning('Preview not supported for this file format.');
    }
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
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
      />

      {/* Uploading screen overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center space-y-4 shadow-2xl">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Uploading...</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Processing medical file upload. Please wait.</p>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">My Medical History</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Access, download, or self-upload your diagnostic scans and laboratory files</p>
        </div>
        <button
          onClick={handleUploadClick}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <FileUp size={16} />
          <span>Upload Previous Report</span>
        </button>
      </div>

      {/* Filters, Categories and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 shadow-sm flex-1 max-w-md">
          <Search size={16} className="text-slate-400 mr-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records by title, file name..."
            className="w-full bg-transparent border-none text-slate-700 dark:text-slate-300 placeholder-slate-400 text-xs focus:outline-none focus:ring-0"
          />
        </div>

        {/* Categories filters */}
        <div className="flex space-x-2 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
          {['All', 'Scan', 'X-Ray', 'Blood Report', 'Prescription', 'Other'].map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-4 py-2.5 rounded-xl border transition-all truncate cursor-pointer ${
                categoryFilter === category
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/10'
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
          No medical records found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecords.map((record) => (
            <div key={record.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs">{record.title}</h4>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 font-bold uppercase tracking-wider">
                      {record.category}
                    </span>
                  </div>
                  {/* Delete button (only show for self-uploaded or allowed, in this case patients can delete their own uploaded files) */}
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors cursor-pointer"
                    title="Delete Document"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{record.description || 'No diagnostic notes provided.'}</p>
                
                {record.fileName && (
                  <div className="text-[10px] bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">File Name:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[180px]">{record.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">File Size:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{formatFileSize(record.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Upload Date:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {record.uploadedAt ? new Date(record.uploadedAt).toLocaleDateString() : new Date(record.recordDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] mt-4">
                <span className="text-slate-400">Record Date: {new Date(record.recordDate).toLocaleDateString()}</span>
                {record.filePath ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePreview(record)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleDownload(record)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Download</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No File Attachment</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal lightbox */}
      {previewImageUrl && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full bg-slate-950 rounded-3xl p-2 shadow-2xl border border-slate-800">
            <button 
              onClick={() => setPreviewImageUrl('')} 
              className="absolute top-4 right-4 z-50 p-2 bg-slate-900/80 hover:bg-slate-800 text-white hover:text-rose-400 rounded-full cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex justify-center items-center overflow-hidden max-h-[80vh] rounded-2xl">
              <img 
                src={previewImageUrl} 
                alt="Medical Report Preview" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
