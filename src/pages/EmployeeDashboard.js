import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function EmployeeDashboard() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);

  const [currentAttendanceId, setCurrentAttendanceId] = useState(null);

  useEffect(() => {
    checkTodayAttendance();
  }, []);

  const checkTodayAttendance = async () => {
    const today = new Date().toLocaleDateString();
    const userEmail = auth.currentUser?.email;
    
    const q = query(
      collection(db, 'attendance'),
      where('employee', '==', userEmail),
      where('date', '==', today)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0];
      const data = docData.data();
      setCurrentAttendanceId(docData.id);
      setIsCheckedIn(data.status === 'Checked In');
      setCheckInTime(data.checkIn);
      setCheckOutTime(data.checkOut || null);
    }
  };

  const handleCheckIn = async () => {
    const now = new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    const today = new Date().toLocaleDateString();
    const userEmail = auth.currentUser?.email;
    
    try {
      const attendanceRecord = {
        employee: userEmail,
        date: today,
        checkIn: now,
        status: 'Checked In',
        timestamp: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'attendance'), attendanceRecord);
      setCurrentAttendanceId(docRef.id);
      setIsCheckedIn(true);
      setCheckInTime(now);
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const handleCheckOut = async () => {
    const now = new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    
    try {
      if (currentAttendanceId) {
        await updateDoc(doc(db, 'attendance', currentAttendanceId), {
          checkOut: now,
          status: 'Checked Out'
        });
        
        setIsCheckedIn(false);
        setCheckOutTime(now);
      }
    } catch (error) {
      console.error('Error checking out:', error);
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

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="dashboard">
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
      
      <div className="dashboard-container">
        <h1>Employee Dashboard</h1>
        
        <div className="welcome-card">
          <h2>Welcome, {auth.currentUser?.email?.split('@')[0] || 'Employee'}!</h2>
          <p style={{fontSize: '1.2rem', color: '#666', marginTop: '10px'}}>
            Today is {today}
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <h2>Daily Attendance</h2>
            <div style={{marginBottom: '20px'}}>
              <p><strong>Status:</strong> {isCheckedIn ? 'Checked In' : 'Checked Out'}</p>
              {checkInTime && <p><strong>Check-in Time:</strong> {checkInTime}</p>}
              {checkOutTime && <p><strong>Check-out Time:</strong> {checkOutTime}</p>}
            </div>
            
            {!isCheckedIn ? (
              <button className="button" onClick={handleCheckIn}>
                Check In
              </button>
            ) : (
              <button className="button" onClick={handleCheckOut}>
                Check Out
              </button>
            )}
          </div>

          <div className="card">
            <h2>Leave Management</h2>
            <p style={{marginBottom: '20px'}}>
              Manage your leave requests and check status
            </p>
            
            <Link to="/apply-leave">
              <button className="button">
                Apply for Leave
              </button>
            </Link>
            
            <Link to="/leave-status">
              <button className="button" style={{marginTop: '10px'}}>
                View Leave Status
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}