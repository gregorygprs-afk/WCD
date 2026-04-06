import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'organizer' | 'volunteer';
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, appUser: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubUserDoc: () => void;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        unsubUserDoc = onSnapshot(userRef, async (userSnap) => {
          if (userSnap.exists()) {
            setAppUser(userSnap.data() as AppUser);
            setLoading(false);
          } else if (!firebaseUser.isAnonymous) {
            // Create new user for Google Login
            const newUser: AppUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Unknown',
              email: firebaseUser.email || '',
              role: firebaseUser.email === 'gregorygprs@gmail.com' ? 'admin' : 'volunteer',
              photoURL: firebaseUser.photoURL || undefined
            };
            await setDoc(userRef, newUser);
            // onSnapshot will trigger again after setDoc
          } else {
            // For anonymous users, Login.tsx will create the document.
            // We just wait for the snapshot to trigger when it's created.
            // But we need to set loading to false so the UI can render Login.tsx
            setLoading(false);
          }
        });
      } else {
        setAppUser(null);
        setLoading(false);
        if (unsubUserDoc) unsubUserDoc();
      }
    });

    return () => {
      unsubscribe();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, appUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
