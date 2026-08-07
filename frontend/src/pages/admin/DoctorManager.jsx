import React, { useState, useEffect } from 'react';
import { Stethoscope, Search, UserPlus, Edit2, Trash2, X, Check, Power, FileText } from 'lucide-react';
import api, { BASE_URL } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function DoctorManager() {
  const toast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Tabs & Applications State
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' or 'applications'
  const [applications, setApplications] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [appsLoading, setAppsLoading] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    department: '',
    bio: '',
    password: ''
  });

  useEffect(() => {
    fetchDoctors();
    fetchApplications();
    fetchPendingCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get(`/admin/doctors?search=${search}`);
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch doctor list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const res = await api.get('/admin/doctor-applications?status=PENDING');
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAppsLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await api.get('/admin/doctor-applications/stats');
      setPendingCount(res.data.pending || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveApplication = async (id) => {
    try {
      await api.put(`/admin/doctor-applications/${id}/approve`);
      toast.success('Doctor application approved successfully! Profile and user account created.');
      fetchApplications();
      fetchPendingCount();
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve application.');
    }
  };

  const handleRejectApplication = async (id) => {
    if (!window.confirm('Are you sure you want to reject this application? This action cannot be undone.')) return;
    try {
      await api.put(`/admin/doctor-applications/${id}/reject`);
      toast.success('Doctor application rejected.');
      fetchApplications();
      fetchPendingCount();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject application.');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      licenseNumber: '',
      department: '',
      bio: '',
      password: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.user.name,
      email: doctor.user.email,
      phone: doctor.phone || '',
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      department: doctor.department || '',
      bio: doctor.bio || '',
      password: '' // Hide password for edits
    });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/doctors', formData, {
        params: { password: formData.password }
      });
      setShowAddModal(false);
      toast.success('Doctor account created successfully!');
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating doctor account.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/doctors/${selectedDoctor.id}`, formData);
      setShowEditModal(false);
      toast.success('Doctor profile updated successfully!');
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating doctor profile.');
    }
  };

  const toggleStatus = async (doctor) => {
    const action = doctor.user.enabled ? 'disable' : 'enable';
    try {
      await api.put(`/admin/doctors/${doctor.id}/${action}`);
      toast.success(`Doctor account ${action}d successfully.`);
      fetchDoctors();
    } catch (err) {
      console.error(err);
      toast.error('Error toggling doctor account status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor? This action is permanent and deletes all associated records.')) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      toast.success('Doctor profile deleted successfully.');
      fetchDoctors();
    } catch (err) {
      console.error(err);
      toast.error('Error deleting doctor profile.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Doctor Directory</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Manage clinical practitioners and logins</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-95"
        >
          <UserPlus size={16} />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 relative transition-all cursor-pointer ${
            activeTab === 'directory'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
        >
          Active Doctors
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 relative transition-all flex items-center cursor-pointer ${
            activeTab === 'applications'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
        >
          <span>Pending Onboarding</span>
          {pendingCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full shadow-sm shadow-red-500/20 animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Filters & Search */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 shadow-sm max-w-md">
            <Search size={18} className="text-slate-400 mr-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, specialization, or department..."
              className="w-full bg-transparent border-none text-slate-700 dark:text-slate-300 placeholder-slate-400 text-sm focus:outline-none focus:ring-0"
            />
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div 
                  key={doctor.id} 
                  className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col space-y-4 relative ${!doctor.user.enabled && 'opacity-65'}`}
                >
                  {/* Card Header details */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-800 dark:text-white truncate max-w-[180px]">Dr. {doctor.user.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 font-medium">
                        {doctor.specialization}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <Stethoscope size={20} />
                    </div>
                  </div>

                  {/* Body contacts details */}
                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <p><strong>License:</strong> {doctor.licenseNumber}</p>
                    <p><strong>Department:</strong> {doctor.department || 'N/A'}</p>
                    <p><strong>Email:</strong> {doctor.user.email}</p>
                    <p><strong>Phone:</strong> {doctor.phone || 'N/A'}</p>
                  </div>

                  {/* Action operations buttons */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <button
                      onClick={() => openEditModal(doctor)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit2 size={12} />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => toggleStatus(doctor)}
                      className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center ${
                        doctor.user.enabled
                          ? 'border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                          : 'border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                      }`}
                      title={doctor.user.enabled ? "Disable Doctor Account" : "Enable Doctor Account"}
                    >
                      <Power size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(doctor.id)}
                      className="p-1.5 border border-rose-200 dark:border-rose-900/50 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center justify-center"
                      title="Delete Profile"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {appsLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm font-semibold">
              No pending practitioner applications found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col space-y-4 relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-800 dark:text-white truncate max-w-[180px]">{app.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 font-medium">
                        {app.specialization}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Stethoscope size={20} />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <p><strong>Hospital:</strong> {app.hospital}</p>
                    <p><strong>Email:</strong> {app.email}</p>
                    <p><strong>Applied:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>

                  {/* Document Certificates Links */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    {app.mbbsCertificatePath ? (
                      <a
                        href={`${BASE_URL}/uploads/${app.mbbsCertificatePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-355 rounded-lg transition-colors cursor-pointer"
                      >
                        <FileText size={12} />
                        <span>MBBS Certificate</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-450 italic">No MBBS uploaded</span>
                    )}

                    {app.experienceCertificatePath ? (
                      <a
                        href={`${BASE_URL}/uploads/${app.experienceCertificatePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-355 rounded-lg transition-colors cursor-pointer"
                      >
                        <FileText size={12} />
                        <span>Exp Certificate</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-455 italic">No Exp uploaded</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <button
                      onClick={() => handleApproveApplication(app.id)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 shadow-md shadow-emerald-500/10 cursor-pointer"
                    >
                      <Check size={12} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleRejectApplication(app.id)}
                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 shadow-md shadow-rose-500/10 cursor-pointer"
                    >
                      <X size={12} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal - Add Doctor */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">Register Clinical Doctor</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Doctor Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Clinical Email *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Specialization *</label>
                  <input type="text" name="specialization" required value={formData.specialization} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">License Number *</label>
                  <input type="text" name="licenseNumber" required value={formData.licenseNumber} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs text-slate-500 font-semibold">Account Password *</label>
                <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Clinical Bio</label>
                <textarea name="bio" rows={2} value={formData.bio} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                Register Doctor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Edit Doctor */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">Edit Doctor Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Doctor Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Clinical Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Specialization</label>
                  <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">License Number</label>
                  <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Clinical Bio</label>
                <textarea name="bio" rows={2} value={formData.bio} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
