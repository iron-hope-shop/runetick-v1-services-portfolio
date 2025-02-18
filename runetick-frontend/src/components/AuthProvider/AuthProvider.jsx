import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  OAuthProvider, 
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateFirebaseProfile,
  updateEmail as updateFirebaseEmail,
  updatePassword as updateFirebasePassword,
  sendSignInLinkToEmail
} from 'firebase/auth';
import { auth } from '../../firebase'; // Adjust this import based on your firebase config file location

const githubProvider = new GithubAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');
const AuthContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const inProgress = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (inProgress.current) {
          return;
        }
        inProgress.current = true;
        try {
          if (firebaseUser.emailVerified) {
            const token = await firebaseUser.getIdToken();
            localStorage.setItem('firebaseToken', token);
            
            const response = await fetch(`${API_URL}/users`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              credentials: 'include',
            });
    
            if (response.ok) {
              const data = await response.json();
              setUser(data);
            } else {
              setUser(null);
            }
          } else {
            // User's email is not verified, don't set the user state
            setUser(null);
          }
        } catch (error) {
          setUser(null);
        } finally {
          inProgress.current = false;
        }
      } else {
        localStorage.removeItem('firebaseToken');
        setUser(null);
      }
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  const handleBackendUserCreation = async (firebaseUser) => {
    if (user) {
      return;
    }
    const token = await firebaseUser.getIdToken();
    localStorage.setItem('firebaseToken', token);
    
    if (firebaseUser.emailVerified) {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });
    
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        throw new Error('Failed to create or retrieve user in backend');
      }
    } else {
      setUser({ ...firebaseUser, emailVerified: false });
    }
  };
  
  const signInWithEmail = async (email, password) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        throw new Error('Please verify your email before signing in.');
      }
      await handleBackendUserCreation(userCredential.user);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await handleBackendUserCreation(userCredential.user);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signUp = async (email, password) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      // Don't set the user state here, wait for email verification
      return { success: true, message: 'Verification email sent. Please check your inbox.' };
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const getToken = async () => {
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken(true);
        localStorage.setItem('firebaseToken', token);
        return token;
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  const signInWithGitHub = async () => {
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, githubProvider);
      await handleBackendUserCreation(userCredential.user);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };
  
  const signInWithMicrosoft = async () => {
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, microsoftProvider);
      await handleBackendUserCreation(userCredential.user);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      localStorage.removeItem('firebaseToken');
      localStorage.clear(); // Clear all local storage
      sessionStorage.clear(); // Clear all session storage
  
      // If you are using any other caching mechanisms, clear them here
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(cache => caches.delete(cache)));
      }
  
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateProfile = async (displayName, photoURL) => {
    setError(null);
    try {
      await updateFirebaseProfile(auth.currentUser, { displayName, photoURL });
      setUser({ ...auth.currentUser });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateEmail = async (newEmail) => {
    setError(null);
    try {
      await updateFirebaseEmail(auth.currentUser, newEmail);
      setUser({ ...auth.currentUser });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updatePassword = async (newPassword) => {
    setError(null);
    try {
      await updateFirebasePassword(auth.currentUser, newPassword);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    setError(null);
    try {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await sendEmailVerification(auth.currentUser);
      } else {
        throw new Error('No user found or email already verified');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithEmail,
    signInWithGoogle,
    signInWithGitHub,
    signInWithMicrosoft,
    signUp,
    logout,
    resetPassword,
    updateProfile,
    updateEmail,
    updatePassword,
    getToken,
    resendVerificationEmail
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;