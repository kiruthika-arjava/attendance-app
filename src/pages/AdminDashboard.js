import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function AdminDashboard() {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toLocaleDateString();
      const q = query(
        collection(db, 'attendance'),
        where('date', '==', today)
      );
      
      const querySnapshot = await getDocs(q);
      const attendanceList = [];
      querySnapshot.forEach((doc) => {
        attendanceList.push({ id: doc.id, ...doc.data() });
      });
      
      setAttendanceData(attendanceList);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="dashboard">
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
      
      <div className="dashboard-container">
        <h1>Admin Dashboard</h1>
        
        <div className="welcome-card">
          <h2>Welcome, {auth.currentUser?.email?.split('@')[0] || 'Admin'}!</h2>
          <p style={{fontSize: '1.2rem', color: '#666', marginTop: '10px'}}>
            Manage employees, attendance, and leave requests
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <h2>Employee Attendance Today</h2>
            <p style={{marginBottom: '20px'}}>
              Total Records: {attendanceData.length}
            </p>
            
            <div className="ag-theme-alpine" style={{height: 300, width: '100%'}}>
              <AgGridReact
                rowData={attendanceData}
                columnDefs={[
                  { field: 'employee', headerName: 'Employee Email' },
                  { field: 'date', headerName: 'Date' },
                  { field: 'checkIn', headerName: 'Check In Time' },
                  { field: 'checkOut', headerName: 'Check Out Time' },
                  { 
                    field: 'status', 
                    headerName: 'Status',
                    cellStyle: params => {
                      if (params.value === 'Checked In') return { color: 'green', fontWeight: 'bold' };
                      if (params.value === 'Checked Out') return { color: 'red', fontWeight: 'bold' };
                      return { color: 'orange', fontWeight: 'bold' };
                    }
                  }
                ]}
                defaultColDef={{
                  sortable: true,
                  filter: true,
                  resizable: true
                }}
              />
            </div>
          </div>

          <div className="card">
            <h2>Quick Actions</h2>
            <p style={{marginBottom: '20px'}}>
              Access reports and manage requests
            </p>
            
            <Link to="/attendance-report">
              <button className="button">
                View Attendance Reports
              </button>
            </Link>
            
            <Link to="/leave-approval">
              <button className="button" style={{marginTop: '10px'}}>
                Manage Leave Requests
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}