'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  role: 'client' | 'admin' | 'super_admin' | null;
  profile: {
    name: string;
    phone: string;
    address: string;
  } | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  role: null, 
  profile: null,
  loading: true 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'client' | 'admin' | 'super_admin' | null>(null);
  const [profile, setProfile] = useState<{ name: string; phone: string; address: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch role and profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const dbRole = data.role;
            
            setProfile({
              name: data.name || '',
              phone: data.phone || '',
              address: data.address || ''
            });

            // Override role for default super admin if they were accidentally saved as client
            if (currentUser.email === 'evotech4001@gmail.com' && dbRole !== 'super_admin') {
              await setDoc(doc(db, 'users', currentUser.uid), { role: 'super_admin' }, { merge: true });
              setRole('super_admin');
            } else {
              setRole(dbRole);
            }
          } else {
            // Create default user
            const isDefaultAdmin = currentUser.email === 'evotech4001@gmail.com';
            const newUser = {
              uid: currentUser.uid,
              email: currentUser.email,
              role: isDefaultAdmin ? 'super_admin' : 'client',
              name: currentUser.displayName || '',
              phone: '',
              address: '',
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', currentUser.uid), newUser);
            setRole(isDefaultAdmin ? 'super_admin' : 'client');
            setProfile({
              name: newUser.name,
              phone: newUser.phone,
              address: newUser.address
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          if (currentUser.email === 'evotech4001@gmail.com') {
            setRole('super_admin');
          } else {
            setRole('client'); // Default fallback
          }
        }
      } else {
        setRole(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
