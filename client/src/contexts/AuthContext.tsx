import { createContext, ReactNode, useEffect, useState } from "react";

import { Spinner } from "@chakra-ui/react";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";

import { auth } from "../utils/auth/firebase";
import { useBackendContext } from "./hooks/useBackendContext";

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
  const { backend } = useBackendContext();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async ({ email, password }: EmailPassword) => {
    if (currentUser) {
      signOut(auth);
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await backend.post("/users/create", {
      email: email,
      firebaseUid: userCredential.user.uid,
    });

    return userCredential;
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
      {loading ? <Spinner /> : children}
    </AuthContext.Provider>
  );
};
