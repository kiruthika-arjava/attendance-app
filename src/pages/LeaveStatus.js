import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function LeaveStatus() {
  const [leaveHistory, setLeaveHistory] = useState([]);

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    try {
      const userEmail = auth.currentUser?.email;
      const q = query(
        collection(db, 'leaveRequests'),
        where('employeeName', '==', userEmail)
      );
      
      const querySnapshot = await getDocs(q);
      const leaveList = [];
      querySnapshot.forEach((doc) => {
        leaveList.push({ id: doc.id, ...doc.data() });
      });
      
      setLeaveHistory(leaveList);
    } catch (error) {
      console.error('Error fetching leave history:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      case 'Pending': return 'status-pending';
      default: return '';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <h1>Leave Status</h1>
        
        <div className="card">
          <h2>Your Leave History</h2>
          
          {leaveHistory.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
              <h3>No Leave Requests Found</h3>
              <p>You haven't applied for any leave yet.</p>
              <p>Click "Apply New Leave" below to submit your first leave request.</p>
            </div>
          ) : (
            <div className="ag-theme-alpine" style={{height: 400, width: '100%'}}>
              <AgGridReact
                rowData={leaveHistory}
                columnDefs={[
                  { field: 'leaveType', headerName: 'Leave Type' },
                  { field: 'fromDate', headerName: 'From Date' },
                  { field: 'toDate', headerName: 'To Date' },
                  { field: 'reason', headerName: 'Reason', width: 200 },
                  { field: 'appliedDate', headerName: 'Applied Date' },
                  { 
                    field: 'status', 
                    headerName: 'Status',
                    cellStyle: params => {
                      if (params.value === 'Approved') return { color: 'green', fontWeight: 'bold' };
                      if (params.value === 'Rejected') return { color: 'red', fontWeight: 'bold' };
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
          
          <div className="text-center mt-4">
            <Link to="/apply-leave">
              <button className="button" style={{marginRight: '10px'}}>
                Apply New Leave
              </button>
            </Link>
            <Link to="/employee-dashboard" className="link">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}