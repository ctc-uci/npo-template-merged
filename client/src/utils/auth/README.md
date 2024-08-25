# `signInWithRedirect` without 3rd Party Cookies

> Last updated: 8/25/24

On June 24, 2024, cross origin redirect sign-in, the "default" way of signing in
with Firebase using `signInWithRedirect` officially stopped working as part of a
broader initiative blocking third-party cookies across Chrome browsers (which
was also preceeded by Firefox and Safari doing the same).

As a result, applications using `signInWithRedirect` were advised to find a
solution described in [Firebase's best practices](https://firebase.google.com/docs/auth/web/redirect-best-practices).

In short, the most viable option for a self-hosted application was [Option 3: Proxy auth requests to firebaseapp.com](https://firebase.google.com/docs/auth/web/redirect-best-practices#proxy-requests).

## How To

1. Update the `authDomain` in your Firebase config

```
+ VITE_FIREBASE_AUTHDOMAIN=localhost:3000
- VITE_FIREBASE_AUTHDOMAIN=your-project.firebaseapp.com
```

2. Update your Vite config
    a. Install the Vite SSL plugin: `yarn add -D @vitejs/plugin-basic-ssl`
    b. Edit your config as shown below:

```
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react(), basicSsl()],
    server: {
      proxy: {
        "/__/auth": {
          target: "https://npo-template-merged.firebaseapp.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/__\/auth/, "/__/auth"),
        },
      },
    },
  };
});
```

> [!IMPORTANT]  
> Adding `basicSsl()` will result in the application running on https: `https://localhost`. This is an unfortunate result of `firebase/auth` having a bug (feature?) where all redirects are routed to `https`. 
> This issue is being tracked [here](https://github.com/firebase/firebase-js-sdk/issues/7342) with a semi-working PR [here](https://github.com/firebase/firebase-js-sdk/pull/7783), but currently the only solution appears to be to develop locally using `https`.

3. Update Google Cloud Console
Go to the [Google Cloud Console](https://console.cloud.google.com/) and find the project associated with your Firebase instance. 

Navigate to the [credentials page](https://console.cloud.google.com/apis/credentials) and under OAuth 2.0, update the Web Client's Authorized Javascript origins and Authorized redirect URIs.

[[ INSERT IMAGE HERE ]]

4. Update Firebase Console
When ready to deploy, you'll also need to add your eventual domain to the list of authorized domains in Firebase

[[ INSERT IMAGE HERE ]]