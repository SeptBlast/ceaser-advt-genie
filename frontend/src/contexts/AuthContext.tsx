import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  // AI Model Configurations
  aiModels: {
    openai?: {
      apiKey: string;
      models: string[];
      defaultModel: string;
    };
    gemini?: {
      apiKey: string;
      models: string[];
      defaultModel: string;
    };
    azureOpenAI?: {
      apiKey: string;
      endpoint: string;
      models: string[];
      defaultModel: string;
    };
    grok?: {
      apiKey: string;
      models: string[];
      defaultModel: string;
    };
    claude?: {
      apiKey: string;
      models: string[];
      defaultModel: string;
    };
  };
  // Image/Video Generation Models
  mediaModels: {
    veo?: {
      apiKey: string;
      projectId: string;
    };
    imagen?: {
      apiKey: string;
      projectId: string;
    };
    dalle?: {
      apiKey: string;
    };
    midjourney?: {
      apiKey: string;
    };
    runway?: {
      apiKey: string;
    };
    stability?: {
      apiKey: string;
    };
  };
  // Security Settings
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange?: Date;
    sessionTimeout: number;
    trustedDevices: string[];
  };
  // Preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUserEmail: (newEmail: string, password: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, loading, authError] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Load user profile when user changes
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        setProfileLoading(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            setUserProfile(profileData);
          } else {
            // Create initial profile
            const initialProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || undefined,
              emailVerified: user.emailVerified,
              createdAt: new Date(),
              lastLoginAt: new Date(),
              aiModels: {},
              mediaModels: {},
              security: {
                twoFactorEnabled: false,
                sessionTimeout: 8, // hours
                trustedDevices: [],
              },
              preferences: {
                theme: 'system',
                language: 'en',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                notifications: {
                  email: true,
                  push: true,
                  marketing: false,
                },
              },
            };
            
            await setDoc(userDocRef, {
              ...initialProfile,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            });
            
            setUserProfile(initialProfile);
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
          setError('Failed to load user profile');
        } finally {
          setProfileLoading(false);
        }
      } else {
        setUserProfile(null);
      }
    };

    loadUserProfile();
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login
      if (result.user) {
        const userDocRef = doc(db, 'users', result.user.uid);
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, { displayName });
      
      // Send verification email
      await sendEmailVerification(result.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUserProfile(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error('No user logged in');
    
    try {
      setError(null);
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      // Update profile
      if (userProfile) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          'security.lastPasswordChange': serverTimestamp(),
        });
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateUserEmail = async (newEmail: string, password: string) => {
    if (!user || !user.email) throw new Error('No user logged in');
    
    try {
      setError(null);
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Update email
      await updateEmail(user, newEmail);
      
      // Send verification email
      await sendEmailVerification(user);
      
      // Update profile
      if (userProfile) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          email: newEmail,
          emailVerified: false,
        });
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setError(null);
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, data);
      
      // Refresh profile
      await refreshUserProfile();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const resendVerificationEmail = async () => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setError(null);
      await sendEmailVerification(user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (err) {
      console.error('Error refreshing user profile:', err);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user: user || null,
    userProfile,
    loading: loading || profileLoading,
    error: error || authError?.message || null,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserPassword,
    updateUserProfile,
    updateUserEmail,
    resendVerificationEmail,
    refreshUserProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
