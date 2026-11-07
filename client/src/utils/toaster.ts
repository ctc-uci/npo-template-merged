import { createToaster } from "@chakra-ui/react";

/**
 * Chakra v3 replaces `useToast` with a global toaster.
 * Call `toaster.create({ title, description, type: "error" | "success" | ... })`
 * from anywhere. `<Toaster />` (components/ui/toaster.tsx) renders it and is
 * mounted once in main.tsx.
 */
export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
});
