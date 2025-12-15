import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApplyLeave from './pages/ApplyLeave';
import LeaveStatus from './pages/LeaveStatus';
import LeaveApproval from './pages/LeaveApproval';
import AttendanceReport from './pages/AttendanceReport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/apply-leave" element={<ApplyLeave />} />
        <Route path="/leave-status" element={<LeaveStatus />} />
        <Route path="/leave-approval" element={<LeaveApproval />} />
        <Route path="/attendance-report" element={<AttendanceReport />} />
      </Routes>
    </Router>
  );
}

export default App;