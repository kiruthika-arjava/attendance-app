import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { sendSMS } from '../smsService';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Employee'
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
        phone: formData.phone,
        role: formData.role,
        createdAt: new Date()
      });
      
      // Send welcome SMS
      const welcomeMessage = `Welcome ${formData.name}! Your account has been created successfully. You can now login to the Smart Attendance System.`;
      await sendSMS(formData.phone, welcomeMessage);
      
      navigate('/');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email or login.');
      } else {
        setError(error.message);
      }
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{display: 'flex', minHeight: '100vh'}}>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <img 
          src="https://cdni.iconscout.com/illustration/premium/thumb/user-registration-illustration-download-in-svg-png-gif-file-formats--sign-up-form-account-creation-pack-business-illustrations-2912016.png" 
          alt="Registration" 
          style={{maxWidth: '80%', maxHeight: '400px', objectFit: 'contain'}}
        />
      </div>
      
      <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: 'white'}}>
        <div className="form-card" style={{width: '100%', maxWidth: '400px', backgroundColor: 'white', color: 'black'}}>
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
                autoComplete="off"
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
                autoComplete="off"
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
              <label className="label" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="input"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1234567890"
                autoComplete="off"
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
    </div>
  );
}