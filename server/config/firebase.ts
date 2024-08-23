import { credential, initializeApp, type ServiceAccount } from "firebase-admin";

import serviceAccount from "./firebase-adminsdk.json";

export const admin = initializeApp({
  credential: credential.cert(serviceAccount as ServiceAccount),
});
