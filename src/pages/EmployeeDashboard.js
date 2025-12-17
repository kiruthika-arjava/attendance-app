import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { sendSMS } from '../smsService';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function EmployeeDashboard() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [currentAttendanceId, setCurrentAttendanceId] = useState(null);
  const [userPhone, setUserPhone] = useState('');
  const [monthlyAttendance, setMonthlyAttendance] = useState(0);

  useEffect(() => {
    checkTodayAttendance();
    fetchUserData();
    fetchMonthlyAttendance();
  }, []);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserPhone(userDoc.data().phone);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchMonthlyAttendance = async () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const userEmail = auth.currentUser?.email;
    
    try {
      const q = query(
        collection(db, 'attendance'),
        where('employee', '==', userEmail)
      );
      
      const querySnapshot = await getDocs(q);
      let count = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const attendanceDate = new Date(data.date);
        if (attendanceDate.getMonth() === currentMonth && 
            attendanceDate.getFullYear() === currentYear &&
            data.status === 'Checked Out') {
          count++;
        }
      });
      
      setMonthlyAttendance(count);
    } catch (error) {
      console.error('Error fetching monthly attendance:', error);
    }
  };

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
      
      // Send SMS notification
      if (userPhone) {
        const message = `Hello! Your attendance for today (${today}) has been marked at ${now}. Have a great day!`;
        await sendSMS(userPhone, message);
      }
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
          <h1 style={{margin: 0, fontSize: '1.8rem'}}>Employee Dashboard</h1>
          <p style={{margin: '5px 0 0 0', opacity: 0.9}}>Welcome, {auth.currentUser?.email?.split('@')[0] || 'Employee'}!</p>
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
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{fontSize: '1.1rem', color: '#666', margin: 0}}>
            📅 Today is {today}
          </p>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px'}}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{marginTop: 0, color: '#8b5cf6'}}>⏰ Daily Attendance</h2>
            <div style={{marginBottom: '20px'}}>
              <p style={{fontSize: '1.1rem'}}>
                <strong>Status:</strong> 
                <span style={{color: isCheckedIn ? '#10b981' : '#ef4444', marginLeft: '8px'}}>
                  {isCheckedIn ? '✓ Checked In' : '○ Checked Out'}
                </span>
              </p>
              {checkInTime && <p><strong>Check-in:</strong> {checkInTime}</p>}
              {checkOutTime && <p><strong>Check-out:</strong> {checkOutTime}</p>}
            </div>
            
            {!isCheckedIn ? (
              <button 
                onClick={handleCheckIn}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  width: '100%',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                Check In
              </button>
            ) : (
              <button 
                onClick={handleCheckOut}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  width: '100%',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                Check Out
              </button>
            )}
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{marginTop: 0, color: '#8b5cf6'}}>📊 Monthly Summary</h2>
            <div style={{textAlign: 'center', padding: '20px 0'}}>
              <div style={{fontSize: '3rem', fontWeight: 'bold', color: '#8b5cf6'}}>{monthlyAttendance}</div>
              <p style={{color: '#666', margin: '8px 0 0 0'}}>Days Present This Month</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{marginTop: 0, color: '#8b5cf6'}}>🏖️ Leave Management</h2>
            <p style={{color: '#666', marginBottom: '20px'}}>
              Manage your leave requests
            </p>
            
            <Link to="/apply-leave" style={{textDecoration: 'none'}}>
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
                Apply for Leave
              </button>
            </Link>
            
            <Link to="/leave-status" style={{textDecoration: 'none'}}>
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
                View Leave Status
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}