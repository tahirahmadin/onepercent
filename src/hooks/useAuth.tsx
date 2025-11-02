import { useState, useEffect } from 'react';
import { User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const MOCK_USER_KEY = 'mockAdminUser';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
          localStorage.removeItem(MOCK_USER_KEY);
        }
      } catch (error) {
        console.error('Error getting redirect result:', error);
      }
    };

    checkRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const mockUserData = localStorage.getItem(MOCK_USER_KEY);

      if (mockUserData) {
        setUser(JSON.parse(mockUserData) as User);
      } else {
        setUser(firebaseUser);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        localStorage.removeItem(MOCK_USER_KEY);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInAsAdmin = async () => {
    try {
      const mockUser = {
        uid: 'admin-dev-user',
        email: 'tahir@sayy.ai',
        displayName: 'Admin (Dev)',
        photoURL: null,
      };
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
      setUser(mockUser as User);
    } catch (error) {
      console.error('Error signing in as admin:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem(MOCK_USER_KEY);
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return { user, loading, signInWithGoogle, signInAsAdmin, signOut };
}
