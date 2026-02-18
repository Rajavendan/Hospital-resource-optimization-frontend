import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import OpdLogin from './pages/Auth/OpdLogin';
import ChangePassword from './pages/Auth/ChangePassword';
import Signup from './pages/Signup';
import Unauthorized from './pages/Auth/Unauthorized';
import PatientDashboard from './pages/Patient/Dashboard';
import VideoPage from './pages/VideoPage';
import Dashboard from './pages/Dashboard';

// ... (imports)

{/* Patient Routes */ }
<Route element={<PrivateRoute allowedRoles={['patient', 'PATIENT']} />}>
  <Route path="/patient-dashboard" element={<PatientDashboard />} />
  <Route path="/book-appointment" element={<BookAppointment />} />
  <Route path="/my-appointments" element={<MyAppointments />} />
</Route>

import BookAppointment from './pages/Patient/BookAppointment';
import MyAppointments from './pages/Patient/MyAppointments';
import Schedule from './pages/Doctor/Schedule';
import Patients from './pages/Doctor/Patients';
import Admission from './pages/Staff/Admission';
import BedManagement from './pages/Staff/BedManagement';
import Equipment from './pages/Staff/Equipment';
import TestManagement from './pages/Staff/TestManagement';
import Resources from './pages/Staff/Resources';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import DoctorManagementAdmin from './pages/Admin/DoctorManagement';
import StaffManagementAdmin from './pages/Admin/StaffManagement';
import BedManagementAdmin from './pages/Admin/BedManagement';
import EquipmentManagementAdmin from './pages/Admin/EquipmentManagement';
import TestDefinitionAdmin from './pages/Admin/TestDefinition';
import RoleManagement from './pages/Admin/RoleManagement';

import OpdEntry from './pages/Staff/OpdEntry';

import PatientConsultation from './pages/Doctor/PatientConsultation';
import TestAssignment from './components/TestAssignment';
import BillingDashboard from './pages/Billing/Dashboard';
import TestHandlerDashboard from './pages/TestHandler/TestHandlerDashboard';
import PharmacistDashboard from './pages/Pharmacist/Dashboard';

import { DataProvider } from './context/DataContext';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Toaster position="top-right" reverseOrder={false} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/opd-login" element={<OpdLogin />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route element={<Layout />}>

              {/* Staff Routes */}
              <Route element={<PrivateRoute allowedRoles={['staff']} />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/opd-entry" element={<OpdEntry />} />
                <Route path="/admission" element={<Admission />} />
                <Route path="/beds" element={<BedManagement />} />
                <Route path="/equipment" element={<Equipment />} />
                <Route path="/tests" element={<TestManagement />} />
                <Route path="/resources" element={<Resources />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<PrivateRoute allowedRoles={['admin', 'ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/doctors" element={<DoctorManagementAdmin />} />
                <Route path="/admin/staff" element={<StaffManagementAdmin />} />
                <Route path="/admin/beds" element={<BedManagementAdmin />} />
                <Route path="/admin/equipment" element={<EquipmentManagementAdmin />} />
                <Route path="/admin/equipment" element={<EquipmentManagementAdmin />} />
                <Route path="/admin/tests" element={<TestDefinitionAdmin />} />
                <Route path="/admin/roles" element={<RoleManagement />} />
              </Route>



              {/* Patient Routes */}
              <Route element={<PrivateRoute allowedRoles={['patient']} />}>
                <Route path="/patient-dashboard" element={<PatientDashboard />} />
                <Route path="/book-appointment" element={<BookAppointment />} />
                <Route path="/my-appointments" element={<MyAppointments />} />
                <Route path="/video-consultation/:id" element={<VideoPage />} />
              </Route>

              {/* Doctor Routes */}
              <Route element={<PrivateRoute allowedRoles={['doctor']} />}>
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/doctor/patients" element={<Patients />} />
                <Route path="/doctor/consultation/:patientId" element={<PatientConsultation />} />
              </Route>

              {/* Billing Routes */}
              <Route element={<PrivateRoute allowedRoles={['billing', 'BILLING']} />}>
                <Route path="/billing" element={<BillingDashboard />} />
              </Route>

              {/* TestHandler Routes */}
              <Route element={<PrivateRoute allowedRoles={['testhandler', 'TESTHANDLER']} />}>
                <Route path="/testhandler" element={<TestHandlerDashboard />} />
              </Route>

              {/* Pharmacist Routes */}
              <Route element={<PrivateRoute allowedRoles={['pharmacist', 'PHARMACIST']} />}>
                <Route path="/pharmacist" element={<PharmacistDashboard />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider >
  );
}

export default App;
