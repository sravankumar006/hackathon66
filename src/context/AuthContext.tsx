import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isMockMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (fullName: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Key names for localStorage Mock Mode
const MOCK_USERS_KEY = 'apexops_mock_users';
const MOCK_SESSION_KEY = 'apexops_mock_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isMockMode = !isSupabaseConfigured;

  // Fetch or sync public profile for real Supabase user
  const fetchSupabaseProfile = async (userId: string, email: string) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Error fetching Supabase profile, attempting to create one:', error.message);
        // Fallback or retry creating in case trigger didn't finish
        const newProfile = { id: userId, email, full_name: '' };
        const { data: upsertData } = await supabase
          .from('profiles')
          .upsert(newProfile)
          .select()
          .single();
        
        if (upsertData) {
          return {
            id: upsertData.id,
            email: upsertData.email || email,
            fullName: upsertData.full_name || '',
            updatedAt: upsertData.updated_at
          };
        }
      }

      if (data) {
        return {
          id: data.id,
          email: data.email || email,
          fullName: data.full_name || '',
          updatedAt: data.updated_at
        };
      }
    } catch (e) {
      console.error('Failed to sync profile:', e);
    }
    return null;
  };

  useEffect(() => {
    if (!isMockMode && supabase) {
      // Real Supabase Initial Session Check
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          const prof = await fetchSupabaseProfile(session.user.id, session.user.email || '');
          setProfile(prof);
        }
        setLoading(false);
      });

      // Listen to Auth State Changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const prof = await fetchSupabaseProfile(session.user.id, session.user.email || '');
          setProfile(prof);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Mock Authentication Flow using localStorage
      const mockSession = localStorage.getItem(MOCK_SESSION_KEY);
      if (mockSession) {
        try {
          const parsedUser = JSON.parse(mockSession);
          setUser(parsedUser as User);
          
          // Load Profile
          const mockUsers = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
          const currentMockUser = mockUsers.find((u: any) => u.id === parsedUser.id);
          if (currentMockUser) {
            setProfile({
              id: currentMockUser.id,
              email: currentMockUser.email,
              fullName: currentMockUser.fullName || '',
              updatedAt: currentMockUser.updatedAt || new Date().toISOString()
            });
          }
        } catch (e) {
          console.error('Failed to parse mock session:', e);
          localStorage.removeItem(MOCK_SESSION_KEY);
        }
      }
      setLoading(false);
    }
  }, [isMockMode]);

  // Sign In Action
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isMockMode && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } else {
      // Mock Sign In
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network latency
      const mockUsers = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const foundUser = mockUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        return { error: 'Invalid email or password' };
      }
      if (foundUser.password !== password) {
        return { error: 'Invalid email or password' };
      }

      // Logged in user mock model
      const mockUserObj = {
        id: foundUser.id,
        email: foundUser.email,
        aud: 'authenticated',
        role: 'authenticated',
        created_at: foundUser.createdAt,
        user_metadata: { full_name: foundUser.fullName },
        app_metadata: {}
      } as unknown as User;

      setUser(mockUserObj);
      setProfile({
        id: foundUser.id,
        email: foundUser.email,
        fullName: foundUser.fullName,
        updatedAt: foundUser.updatedAt
      });
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockUserObj));
      return { error: null };
    }
  };

  // Sign Up Action
  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: string | null }> => {
    if (!isMockMode && supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      if (error) return { error: error.message };
      return { error: null };
    } else {
      // Mock Sign Up
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockUsers = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const userExists = mockUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (userExists) {
        return { error: 'User already exists' };
      }

      const newId = crypto.randomUUID();
      const rightNow = new Date().toISOString();
      const newMockUser = {
        id: newId,
        email,
        password, // stored plain for mock simulation purposes
        fullName,
        createdAt: rightNow,
        updatedAt: rightNow
      };

      mockUsers.push(newMockUser);
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(mockUsers));

      // Auto login in mock mode upon signup
      const mockUserObj = {
        id: newId,
        email,
        aud: 'authenticated',
        role: 'authenticated',
        created_at: rightNow,
        user_metadata: { full_name: fullName },
        app_metadata: {}
      } as unknown as User;

      setUser(mockUserObj);
      setProfile({
        id: newId,
        email,
        fullName,
        updatedAt: rightNow
      });
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockUserObj));
      return { error: null };
    }
  };

  // Sign Out Action
  const signOut = async () => {
    if (!isMockMode && supabase) {
      await supabase.auth.signOut();
    } else {
      // Mock Sign Out
      localStorage.removeItem(MOCK_SESSION_KEY);
      setUser(null);
      setProfile(null);
    }
  };

  // Update Profile Action
  const updateProfile = async (fullName: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' };

    if (!isMockMode && supabase) {
      // 1. Update user metadata
      const { error: metaError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (metaError) return { error: metaError.message };

      // 2. Update profiles table
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (dbError) {
        console.warn('Profiles DB update error (possibly schema setup incomplete):', dbError.message);
        // Don't fail completely if DB table doesn't exist yet but metadata updated successfully
      }

      // Sync local profile state
      setProfile(prev => prev ? { ...prev, fullName, updatedAt: new Date().toISOString() } : null);
      return { error: null };
    } else {
      // Mock Profile Update
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockUsers = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const userIdx = mockUsers.findIndex((u: any) => u.id === user.id);

      if (userIdx !== -1) {
        const rightNow = new Date().toISOString();
        mockUsers[userIdx].fullName = fullName;
        mockUsers[userIdx].updatedAt = rightNow;
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(mockUsers));

        // Update session
        const updatedSession = {
          ...user,
          user_metadata: { ...user.user_metadata, full_name: fullName }
        };
        setUser(updatedSession);
        setProfile({
          id: user.id,
          email: user.email || '',
          fullName,
          updatedAt: rightNow
        });
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedSession));
        return { error: null };
      }
      return { error: 'Mock user not found' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isMockMode, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
