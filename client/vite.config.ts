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
