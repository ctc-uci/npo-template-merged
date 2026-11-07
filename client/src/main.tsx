import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ChakraProvider } from "@chakra-ui/react";

import App from "./App.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import { system } from "./theme.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <App />
      <Toaster />
    </ChakraProvider>
  </StrictMode>
);
