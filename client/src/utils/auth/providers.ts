import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithRedirect,
} from "firebase/auth";

import { auth } from "./firebase";

const facebookProvider = new FacebookAuthProvider();
const googleProvider = new GoogleAuthProvider();

/**
 * `signInWithRedirect` is patched!
 *
 * @see {@link client/docs/signInWithRedirect.md} for more detailed documentation.
 */
const patchedSignInWithRedirect = signInWithRedirect;

export async function createFacebookUserInFirebase() {
  await patchedSignInWithRedirect(auth, facebookProvider);
}

export async function createGoogleUserInFirebase() {
  await patchedSignInWithRedirect(auth, googleProvider);
}
