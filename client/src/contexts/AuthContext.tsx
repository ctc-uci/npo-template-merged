import { createContext, ReactNode, useEffect, useState } from "react";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";

import { auth } from "../utils/auth/firebase";

interface AuthContextProps {
  currentUser: User | null;
  signup: ({ email, password }: EmailPassword) => Promise<UserCredential>;
  login: ({ email, password }: EmailPassword) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: ({ email }: Pick<EmailPassword, "email">) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

interface EmailPassword {
  email: string;
  password: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = ({ email, password }: EmailPassword) => {
    if (currentUser) {
      signOut(auth);
    }

    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = ({ email, password }: EmailPassword) => {
    if (currentUser) {
      signOut(auth);
    }

    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = ({ email }: Pick<EmailPassword, "email">) => {
    return sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, signup, login, logout, resetPassword }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
