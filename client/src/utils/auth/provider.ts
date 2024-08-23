import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
} from "firebase/auth";

import { FirebaseUtilRedirectParams } from "./auth";
import { auth } from "./firebase";

const facebookProvider = new FacebookAuthProvider();
const googleProvider = new GoogleAuthProvider();

export async function createFacebookUserInFirebase({
  redirect,
  navigate,
}: FirebaseUtilRedirectParams) {
  await signInWithRedirect(auth, facebookProvider);
  navigate(redirect);
}

export async function createGoogleUserInFirebase({
  redirect,
  navigate,
}: FirebaseUtilRedirectParams) {
  await signInWithRedirect(auth, googleProvider);
  navigate(redirect);
}

/**
 * Handles log out for users authenticated through OAuth (Facebook, Google)
 */
export function logProviderUserOut({
  redirect,
  navigate,
}: FirebaseUtilRedirectParams) {
  signOut(auth)
    .then(() => {
      navigate(redirect);
    })
    .catch((error) => {
      console.log(
        "An error occurred while signing out",
        error.code,
        error.message
      );
    });
}
