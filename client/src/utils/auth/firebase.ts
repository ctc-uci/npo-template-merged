import axios from "axios";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";

import { cookieConfig, cookieKeys, setCookie } from "./cookie";
import { FirebaseUtilParams, FirebaseUtilRedirectParams } from "./types";

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
export const auth = getAuth(app);

/**
 * Synchronously retrieves the current user.
 */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
};

const REFRESH_URL = `https://securetoken.googleapis.com/v1/token?key=${
  import.meta.env.VITE_FIREBASE_APIKEY
}`;

export const refreshToken = async () => {
  const backend = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_HOST,
    withCredentials: true,
  });

  const currentUser = await getCurrentUser();

  if (currentUser) {
    const refreshToken = currentUser.refreshToken;
    const {
      data: { access_token: idToken },
    } = await axios.post(REFRESH_URL, {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    // Sets the appropriate cookies after refreshing access token
    setCookie({
      key: cookieKeys.ACCESS_TOKEN,
      value: idToken,
      config: cookieConfig,
    });

    const user = await backend.get(`/users/${auth.currentUser?.uid}`);
    setCookie({
      key: cookieKeys.ROLE,
      value: user.data[0].type,
      config: cookieConfig,
    });

    return { accessToken: idToken, currentUser: user.data[0] };
  }
  return null;
};

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
