import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Clear all existing data and create specific users
export const setupInitialUsers = async () => {
  try {
    // Clear existing attendance records
    const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
    for (const doc of attendanceSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Clear existing users (except the ones we're about to create)
    const usersSnapshot = await getDocs(collection(db, 'users'));
    for (const doc of usersSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    console.log('Existing data cleared');

    // Create Tarani (Admin)
    const taraniCredential = await createUserWithEmailAndPassword(auth, 'tarani@admin.com', 'password123');
    await setDoc(doc(db, 'users', taraniCredential.user.uid), {
      name: 'Tarani',
      email: 'tarani@admin.com',
      phone: '+1234567890',
      role: 'Admin',
      createdAt: new Date()
    });

    // Create Likitha (Employee)
    const likithaCredential = await createUserWithEmailAndPassword(auth, 'likitha@employee.com', 'password123');
    await setDoc(doc(db, 'users', likithaCredential.user.uid), {
      name: 'Likitha',
      email: 'likitha@employee.com',
      phone: '+1234567891',
      role: 'Employee',
      createdAt: new Date()
    });

    console.log('Users created successfully');
    console.log('Tarani (Admin): tarani@admin.com / password123');
    console.log('Likitha (Employee): likitha@employee.com / password123');

  } catch (error) {
    console.error('Setup error:', error);
  }
};