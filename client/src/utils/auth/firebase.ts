import axios from "axios";
import { initializeApp } from "firebase/app";
import { getAuth, User } from "firebase/auth";

// import { backend } from "../backend";
import { cookieConfig, cookieKeys, setCookie } from "./cookie";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  /**
   * `authDomain` should be set to your deployment domain or your local domain (e.g. `localhost:3000`). It should **NOT** be the default value provided by Firebase (e.g. `your-project.firebaseapp.com`)
   *
   * @see {@link https://firebase.google.com/docs/auth/web/redirect-best-practices#proxy-requests} for the officially documented reasons why.
   * @see {@link client/docs/signInWithRedirect.md} for more detailed documentation.
   */
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
  const currentUser = await getCurrentUser();

  if (currentUser) {
    const refreshToken = currentUser.refreshToken;
    const {
      data: { access_token: id_token },
    } = await axios.post(REFRESH_URL, {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    // Sets the appropriate cookies after refreshing access token
    setCookie({
      key: cookieKeys.ACCESS_TOKEN,
      value: id_token,
      config: cookieConfig,
    });

    // const user = await backend.get(`/users/${auth.currentUser?.uid}`);
    // setCookie({
    //   key: cookieKeys.ROLE,
    //   value: user.data[0].type,
    //   config: cookieConfig,
    // });

    return { accessToken: id_token };
  }
  return null;
};
