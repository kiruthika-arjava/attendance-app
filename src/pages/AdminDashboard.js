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
    <div style={{minHeight: '100vh', backgroundColor: '#f5f5f5'}}>
      <div style={{
        backgroundColor: '#8b5cf6',
        color: 'white',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{margin: 0, fontSize: '1.8rem'}}>Admin Dashboard</h1>
          <p style={{margin: '5px 0 0 0', opacity: 0.9}}>Welcome, {auth.currentUser?.email?.split('@')[0] || 'Admin'}!</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: 'white',
            color: '#8b5cf6',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>
      </div>
      
      <div style={{padding: '40px'}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px'}}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{marginTop: 0, color: '#8b5cf6'}}>📊 Today's Attendance</h2>
            <div style={{textAlign: 'center', padding: '20px 0'}}>
              <div style={{fontSize: '3rem', fontWeight: 'bold', color: '#8b5cf6'}}>{attendanceData.length}</div>
              <p style={{color: '#666', margin: '8px 0 0 0'}}>Total Records</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{marginTop: 0, color: '#8b5cf6'}}>⚡ Quick Actions</h2>
            <Link to="/attendance-report" style={{textDecoration: 'none'}}>
              <button style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
                fontSize: '1rem',
                fontWeight: 'bold',
                marginBottom: '12px'
              }}>
                📋 Attendance Reports
              </button>
            </Link>
            
            <Link to="/leave-approval" style={{textDecoration: 'none'}}>
              <button style={{
                backgroundColor: 'white',
                color: '#8b5cf6',
                border: '2px solid #8b5cf6',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}>
                ✅ Leave Requests
              </button>
            </Link>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{marginTop: 0, color: '#8b5cf6', marginBottom: '20px'}}>👥 Employee Attendance Today</h2>
          
          {attendanceData.length === 0 ? (
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '60px 20px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{fontSize: '5rem', marginBottom: '20px'}}>📊</div>
              <h3 style={{fontSize: '1.5rem', marginBottom: '12px', fontWeight: 'bold'}}>Waiting for Check-ins</h3>
              <p style={{margin: 0, fontSize: '1.1rem', opacity: 0.9}}>No employees have checked in yet today</p>
            </div>
          ) : (
            <div>
              {attendanceData.map((record, index) => (
                <div key={index} style={{
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{margin: 0, fontWeight: 'bold', color: '#1f2937'}}>{record.employee}</p>
                    <p style={{margin: '4px 0 0 0', fontSize: '0.9rem', color: '#6b7280'}}>
                      Check-in: {record.checkIn} {record.checkOut && `| Check-out: ${record.checkOut}`}
                    </p>
                  </div>
                  <div style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    backgroundColor: record.status === 'Checked In' ? '#d1fae5' : '#fee2e2',
                    color: record.status === 'Checked In' ? '#065f46' : '#991b1b',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}>
                    {record.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}