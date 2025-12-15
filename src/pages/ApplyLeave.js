import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function ApplyLeave() {
  const [leaveData, setLeaveData] = useState({
    leaveType: 'Casual',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const leaveRequest = {
      id: Date.now(),
      ...leaveData,
      status: 'Pending',
      appliedDate: new Date().toLocaleDateString(),
      employeeName: auth.currentUser?.email || 'Unknown User'
    };
    
    try {
      // Save to Firestore
      await addDoc(collection(db, 'leaveRequests'), leaveRequest);
      
      alert('Leave request submitted successfully!');
      navigate('/employee-dashboard');
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Error submitting leave request. Please try again.');
    }
  };

  const handleChange = (field, value) => {
    setLeaveData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container">
      <div className="form-card">
        <h2>Apply for Leave</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="leaveType">Leave Type</label>
            <select
              id="leaveType"
              className="input"
              value={leaveData.leaveType}
              onChange={(e) => handleChange('leaveType', e.target.value)}
            >
              <option value="Casual">Casual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Paid">Paid Leave</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="fromDate">From Date</label>
            <input
              id="fromDate"
              type="date"
              className="input"
              value={leaveData.fromDate}
              onChange={(e) => handleChange('fromDate', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="toDate">To Date</label>
            <input
              id="toDate"
              type="date"
              className="input"
              value={leaveData.toDate}
              onChange={(e) => handleChange('toDate', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              className="textarea"
              value={leaveData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="Please provide reason for leave..."
              required
            />
          </div>

          <button type="submit" className="button">
            Submit Leave Request
          </button>
          
          <div className="text-center mt-4">
            <Link to="/employee-dashboard" className="link">
              Back to Dashboard
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}