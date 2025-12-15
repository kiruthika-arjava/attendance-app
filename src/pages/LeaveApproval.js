import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function LeaveApproval() {
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'leaveRequests'));
      const requestsList = [];
      querySnapshot.forEach((docRef) => {
        requestsList.push({ id: docRef.id, ...docRef.data() });
      });
      
      setLeaveRequests(requestsList);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(db, 'leaveRequests', id), {
        status: 'Approved'
      });
      
      // Remove from admin view
      const filteredRequests = leaveRequests.filter(req => req.id !== id);
      setLeaveRequests(filteredRequests);
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await updateDoc(doc(db, 'leaveRequests', id), {
        status: 'Rejected'
      });
      
      // Remove from admin view
      const filteredRequests = leaveRequests.filter(req => req.id !== id);
      setLeaveRequests(filteredRequests);
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <h1>Leave Approval</h1>
        
        <div className="card">
          <h2>Pending Leave Requests</h2>
          
          <div className="ag-theme-alpine" style={{height: 400, width: '100%'}}>
            <AgGridReact
              rowData={leaveRequests}
              columnDefs={[
                { field: 'employeeName', headerName: 'Employee' },
                { field: 'leaveType', headerName: 'Type' },
                { field: 'fromDate', headerName: 'From Date' },
                { field: 'toDate', headerName: 'To Date' },
                { field: 'reason', headerName: 'Reason', width: 200 },
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