import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Edit2, ShieldAlert, Trash2, X, Check, Heart, Power, Stethoscope } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function PatientManager() {
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Assign Doctor state
  const [assignDoctorId, setAssignDoctorId] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
    password: ''
  });

  useEffect(() => {
    fetchPatientsAndDoctors();
  }, [search]);

  const fetchPatientsAndDoctors = async () => {
    try {
      const pRes = await api.get(`/admin/patients?search=${search}`);
      setPatients(pRes.data);

      const dRes = await api.get('/admin/doctors');
      setDoctors(dRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch patient records.');
    } finally {
      setLoading(false);
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
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      address: '',
      emergencyContact: '',
      password: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.user.name,
      email: patient.user.email,
      phone: patient.phone || '',
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || '',
      bloodGroup: patient.bloodGroup || '',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact || '',
      password: ''
    });
    setAssignDoctorId(patient.assignedDoctor?.id || '');
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/patients', formData, {
        params: { password: formData.password }
      });
      setShowAddModal(false);
      toast.success('Patient registered successfully!');
      fetchPatientsAndDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error registering patient.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Save profile updates
      await api.put(`/admin/patients/${selectedPatient.id}`, formData);

      // Save assigned doctor if changed
      if (assignDoctorId) {
        await api.put(`/admin/patients/${selectedPatient.id}/assign-doctor/${assignDoctorId}`);
      }

      setShowEditModal(false);
      toast.success('Patient record updated successfully!');
      fetchPatientsAndDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating patient record.');
    }
  };

  const toggleStatus = async (patient) => {
    const action = patient.user.enabled ? 'disable' : 'enable';
    try {
      await api.put(`/admin/patients/${patient.id}/${action}`);
      toast.success(`Patient account ${action}d successfully.`);
      fetchPatientsAndDoctors();
    } catch (err) {
      console.error(err);
      toast.error('Error toggling patient account status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient profile? All records, history, and scheduled visits will be deleted.')) return;
    try {
      await api.delete(`/admin/patients/${id}`);
      toast.success('Patient profile deleted successfully.');
      fetchPatientsAndDoctors();
    } catch (err) {
      toast.error('Error deleting patient profile.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Patient Database</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Manage patient files, profiles, and doctor linkages</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-95"
        >
          <UserPlus size={16} />
          <span>Register Patient</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 shadow-sm max-w-md">
        <Search size={18} className="text-slate-400 mr-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or telephone number..."
          className="w-full bg-transparent border-none text-slate-700 dark:text-slate-300 placeholder-slate-400 text-sm focus:outline-none focus:ring-0"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <div 
              key={patient.id} 
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col space-y-4 relative ${!patient.user.enabled && 'opacity-65'}`}
            >
              {/* Card Header details */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 dark:text-white truncate max-w-[185px]">{patient.user.name}</h3>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      Blood: {patient.bloodGroup || 'N/A'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      {patient.gender || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users size={20} />
                </div>
              </div>

              {/* Patient Contacts Info */}
              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <p><strong>DOB:</strong> {patient.dateOfBirth || 'N/A'}</p>
                <p><strong>Phone:</strong> {patient.phone || 'N/A'}</p>
                <p><strong>Email:</strong> {patient.user.email}</p>
                <p><strong>Emergency:</strong> {patient.emergencyContact || 'N/A'}</p>
                <div className="flex items-center space-x-1 mt-2 p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-slate-600 dark:text-slate-300">
                  <Stethoscope size={14} className="text-teal-500 mr-1" />
                  <span className="truncate">
                    <strong>Doctor:</strong> {patient.assignedDoctor ? `Dr. ${patient.assignedDoctor.user.name}` : 'None Assigned'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                <button
                  onClick={() => openEditModal(patient)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit2 size={12} />
                  <span>Edit File</span>
                </button>
                <button
                  onClick={() => toggleStatus(patient)}
                  className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center ${
                    patient.user.enabled
                      ? 'border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                      : 'border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                  }`}
                  title={patient.user.enabled ? "Disable Patient Login" : "Enable Patient Login"}
                >
                  <Power size={14} />
                </button>
                <button
                  onClick={() => handleDelete(patient.id)}
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

      {/* Modal - Add Patient */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">Register Patient File</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Patient Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Email Address *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Date of Birth *</label>
                  <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Gender *</label>
                  <select name="gender" required value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Blood Group *</label>
                  <select name="bloodGroup" required value={formData.bloodGroup} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white">
                    <option value="">Select Blood</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Password *</label>
                  <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Emergency Contact *</label>
                  <input type="text" name="emergencyContact" required value={formData.emergencyContact} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Home Address</label>
                  <textarea name="address" rows={2} value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                Register Patient
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Edit Patient & Assign Doctor */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">Edit Patient Record</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Patient Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Blood Group</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white">
                    <option value="">Select Blood</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
                </div>
              </div>
              
              {/* Linked Doctor Assign dropdown */}
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Assigned Care Practitioner</label>
                <select 
                  value={assignDoctorId} 
                  onChange={(e) => setAssignDoctorId(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
                >
                  <option value="">Assign Care Practitioner</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>Dr. {d.user.name} ({d.specialization})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Emergency Contact</label>
                <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Home Address</label>
                <textarea name="address" rows={2} value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                Save Record Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
