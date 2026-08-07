import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Auth Pages
import AdminLogin from './pages/AdminLogin';
import DoctorLogin from './pages/DoctorLogin';
import PatientLogin from './pages/PatientLogin';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DoctorSignup from './pages/DoctorSignup';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorManager from './pages/admin/DoctorManager';
import PatientManager from './pages/admin/PatientManager';
import AppointmentManager from './pages/admin/AppointmentManager';
import ReportsDashboard from './pages/admin/ReportsDashboard';
import AuditLogs from './pages/admin/AuditLogs';
import MedicalRecords from './pages/admin/MedicalRecords';
import Users from './pages/admin/Users';
import Settings from './pages/admin/Settings';
import { ToastProvider } from './context/ToastContext';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientList from './pages/doctor/PatientList';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import MedicalHistoryManager from './pages/doctor/MedicalHistoryManager';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import MedicalHistory from './pages/patient/MedicalHistory';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientProfile from './pages/patient/PatientProfile';

// Layout wrapper for authenticated dashboard viewports
const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
        {/* Public auth routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/signup" element={<DoctorSignup />} />
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Admin protected routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/doctors" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <DashboardLayout><DoctorManager /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/patients" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <DashboardLayout><PatientManager /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/appointments" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <DashboardLayout><AppointmentManager /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <DashboardLayout><ReportsDashboard /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/logs" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <DashboardLayout><AuditLogs /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/records" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <DashboardLayout><MedicalRecords /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <DashboardLayout><Users /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <DashboardLayout><Settings /></DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Doctor protected routes */}
        <Route 
          path="/doctor/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <DashboardLayout><DoctorDashboard /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctor/patients" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <DashboardLayout><PatientList /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctor/appointments" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <DashboardLayout><DoctorAppointments /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctor/records" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <DashboardLayout><MedicalHistoryManager /></DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Patient protected routes */}
        <Route 
          path="/patient/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
              <DashboardLayout><PatientDashboard /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/patient/records" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
              <DashboardLayout><MedicalHistory /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/patient/appointments" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
              <DashboardLayout><PatientAppointments /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/patient/profile" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
              <DashboardLayout><PatientProfile /></DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Default fallback route */}
        <Route path="*" element={<Navigate to="/patient/login" replace />} />
      </Routes>
    </Router>
    </ToastProvider>
  );
}
