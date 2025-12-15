import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    workStartTime: '9:00',
    workStartPeriod: 'AM',
    workEndTime: '6:00',
    workEndPeriod: 'PM'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // Store user data in Firestore using UID as document ID
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        workStartTime: `${formData.workStartTime} ${formData.workStartPeriod}`,
        workEndTime: `${formData.workEndTime} ${formData.workEndPeriod}`,
        createdAt: new Date()
      });
      
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container">
      <div className="form-card">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="role">Role</label>
            <select
              id="role"
              className="input"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
            >
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="label">Work Start Time</label>
            <div style={{display: 'flex', gap: '10px'}}>
              <input
                type="time"
                className="input"
                value={formData.workStartTime}
                onChange={(e) => handleChange('workStartTime', e.target.value)}
              />
              <select
                className="input"
                value={formData.workStartPeriod}
                onChange={(e) => handleChange('workStartPeriod', e.target.value)}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label className="label">Work End Time</label>
            <div style={{display: 'flex', gap: '10px'}}>
              <input
                type="time"
                className="input"
                value={formData.workEndTime}
                onChange={(e) => handleChange('workEndTime', e.target.value)}
              />
              <select
                className="input"
                value={formData.workEndPeriod}
                onChange={(e) => handleChange('workEndPeriod', e.target.value)}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="button">
            Register
          </button>
          <div className="text-center mt-4">
            <Link to="/" className="link">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}