import { useState } from 'react';
import { setupInitialUsers } from '../setupUsers';

export default function Setup() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSetup = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      await setupInitialUsers();
      setMessage('Setup completed! Users created:\n• Tarani (Admin): tarani@admin.com\n• Likitha (Employee): likitha@employee.com\nPassword for both: password123');
    } catch (error) {
      setMessage('Setup failed: ' + error.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="container">
      <div className="form-card">
        <h2>Database Setup</h2>
        <p>This will clear all existing data and create only the required users.</p>
        
        <button 
          className="button" 
          onClick={handleSetup}
          disabled={isLoading}
        >
          {isLoading ? 'Setting up...' : 'Clear & Setup Users'}
        </button>
        
        {message && (
          <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', whiteSpace: 'pre-line'}}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}