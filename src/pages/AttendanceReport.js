import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function AttendanceReport() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [usersData, setUsersData] = useState({});

  useEffect(() => {
    fetchAllAttendance();
    fetchUsersData();
  }, []);

  const fetchUsersData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = {};
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users[userData.email] = userData;
      });
      setUsersData(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAllAttendance = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'attendance'));
      const attendanceList = [];
      querySnapshot.forEach((doc) => {
        attendanceList.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('Fetched attendance data:', attendanceList);
      setAttendanceData(attendanceList);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const [filters, setFilters] = useState({
    employee: '',
    date: '',
    status: ''
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const filteredData = attendanceData.filter(record => {
    return (
      (filters.employee === '' || record.employee.toLowerCase().includes(filters.employee.toLowerCase())) &&
      (filters.date === '' || record.date === filters.date) &&
      (filters.status === '' || record.status === filters.status)
    );
  });

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <h1>Attendance Report</h1>
        
        <div className="card">
          <h2>Filter Records</h2>
          <div className="grid" style={{gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px'}}>
            <div className="form-group">
              <label className="label">Employee Email</label>
              <input
                type="text"
                className="input"
                placeholder="Search by email..."
                value={filters.employee}
                onChange={(e) => handleFilterChange('employee', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="label">Status</label>
              <select
                className="input"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Checked In">Checked In</option>
                <option value="Checked Out">Checked Out</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Attendance Records ({filteredData.length} records)</h2>
          
          {filteredData.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
              <h3>No Attendance Records Found</h3>
              <p>No employees have checked in yet.</p>
              <p>Attendance records will appear here when employees check in/out.</p>
            </div>
          ) : (
            <div className="ag-theme-alpine" style={{height: 500, width: '100%'}}>
              <AgGridReact
                rowData={filteredData}
                columnDefs={[
                  { field: 'employee', headerName: 'Employee' },
                  { 
                    field: 'phone', 
                    headerName: 'Phone',
                    valueGetter: params => usersData[params.data.employee]?.phone || 'N/A'
                  },
                  { field: 'date', headerName: 'Date' },
                  { field: 'checkIn', headerName: 'Check In' },
                  { field: 'checkOut', headerName: 'Check Out' },
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
          )}
          
          {filteredData.length === 0 && (
            <p style={{textAlign: 'center', padding: '20px', color: '#666'}}>
              No records found matching the selected filters.
            </p>
          )}
          
          <div className="text-center mt-4">
            <Link to="/admin-dashboard" className="link">
              Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}