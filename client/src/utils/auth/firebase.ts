import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { FirebaseUtilParams, FirebaseUtilRedirectParams } from "./auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const createUserInFirebase = async ({
  email,
  password,
  redirect,
  navigate,
}: FirebaseUtilParams) => {
  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);
    navigate(redirect);

    return user.user;
  } catch (error) {
    console.log(`${error.code}: ${error.message}`);
    throw error;
  }
};

export const logInWithEmailAndPassWord = async ({
  email,
  password,
  redirect,
  navigate,
}: FirebaseUtilParams) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    navigate(redirect);
  } catch (error) {
    console.log(`${error.code}: ${error.message}`);
    throw error;
  }
};

/**
 * Returns details about the currently logged in user, or null if the user is not logged in.
 * @see https://firebase.google.com/docs/auth/web/manage-users for more info
 * @see https://firebase.google.com/docs/reference/js/auth.user for returned user type properties
 */
export const getLoginDetails = async () => {
  // Get current user - https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#currentuser
  const user = auth.currentUser;

  if (user !== null) {
    // User will be of type https://firebase.google.com/docs/reference/js/auth.user
    return user;
  }

  // No user is logged in
  return null;
};

/**
 * Logs out the current user, optionally taking a redirect path to redirect to upon successful logout
 * @see https://firebase.google.com/docs/auth/web/password-auth
 */
export const logout = async ({
  redirect,
  navigate,
}: FirebaseUtilRedirectParams) => {
  signOut(auth)
    .then(() => {
      navigate(redirect);
    })
    .catch((error) => {
      console.log(`${error.code}: ${error.message}`);
    });
};

export const sendResetPasswordPrompt = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

export { auth };
