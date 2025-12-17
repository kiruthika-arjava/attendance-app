// Simple SMS service - In production, integrate with Twilio, AWS SNS, or similar service
export const sendSMS = async (phoneNumber, message) => {
  try {
    // For demo purposes, we'll just log the SMS
    // In production, replace with actual SMS API call
    console.log(`SMS to ${phoneNumber}: ${message}`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, messageId: Date.now() });
      }, 1000);
    });
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
};