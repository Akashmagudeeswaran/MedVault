import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Users, 
  Calendar, 
  BarChart2, 
  ShieldAlert, 
  FileText, 
  User, 
  Heart,
  Activity,
  Settings,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const role = localStorage.getItem('role') || 'ROLE_PATIENT';
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    if (role === 'ROLE_ADMIN') {
      navigate('/admin/login');
    } else if (role === 'ROLE_DOCTOR') {
      navigate('/doctor/login');
    } else {
      navigate('/patient/login');
    }
  };

  const getAdminLinks = () => [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/admin/doctors', label: 'Doctors', icon: <Stethoscope size={20} /> },
    { to: '/admin/patients', label: 'Patients', icon: <Users size={20} /> },
    { to: '/admin/appointments', label: 'Appointments', icon: <Calendar size={20} /> },
    { to: '/admin/records', label: 'Medical Records', icon: <FileText size={20} /> },
    { to: '/admin/reports', label: 'Reports', icon: <BarChart2 size={20} /> },
    { to: '/admin/users', label: 'Users', icon: <Users size={20} /> },
    { to: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const getDoctorLinks = () => [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/doctor/patients', label: 'Assigned Patients', icon: <Users size={20} /> },
    { to: '/doctor/appointments', label: 'Manage Appointments', icon: <Calendar size={20} /> },
    { to: '/doctor/records', label: 'Medical History', icon: <FileText size={20} /> },
  ];

  const getPatientLinks = () => [
    { to: '/patient/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/patient/records', label: 'My Medical Records', icon: <FileText size={20} /> },
    { to: '/patient/appointments', label: 'Book Appointment', icon: <Calendar size={20} /> },
    { to: '/patient/profile', label: 'My Health Profile', icon: <User size={20} /> },
  ];

  const getLinks = () => {
    switch (role) {
      case 'ROLE_ADMIN': return getAdminLinks();
      case 'ROLE_DOCTOR': return getDoctorLinks();
      case 'ROLE_PATIENT': return getPatientLinks();
      default: return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col fixed left-0 top-0 z-40 transition-all duration-200">
      {/* Brand logo container */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Heart size={18} className="fill-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white leading-none">MedVault</h1>
          <span className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">Health Records</span>
        </div>
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                  : 'hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <div className="px-4 py-3 border-t border-slate-800/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-all duration-200 text-sm font-medium cursor-pointer"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      {/* Footer system diagnostics summary */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 text-center">
        <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500">
          <Activity size={12} className="text-emerald-500 animate-pulse-slow" />
          <span>System Secure (SSL/AES)</span>
        </div>
      </div>
    </aside>
  );
}
