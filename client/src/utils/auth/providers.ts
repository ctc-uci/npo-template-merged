import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
} from "firebase/auth";

import { auth } from "./firebase";
import { FirebaseUtilRedirectParams } from "./types";

const facebookProvider = new FacebookAuthProvider();
const googleProvider = new GoogleAuthProvider();

/**
 * `signInWithRedirect` is patched!
 *
 * @see {@link client/docs/signInWithRedirect.md} for more detailed documentation.
 */
const patchedSignInWithRedirect = signInWithRedirect;

export async function createFacebookUserInFirebase({
  redirect,
  navigate,
}: FirebaseUtilRedirectParams) {
  await patchedSignInWithRedirect(auth, facebookProvider);
  navigate(redirect);
}

export async function createGoogleUserInFirebase({
  redirect,
  navigate,
}: FirebaseUtilRedirectParams) {
  await patchedSignInWithRedirect(auth, googleProvider);
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
