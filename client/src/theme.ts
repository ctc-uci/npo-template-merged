import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// Customize your design tokens here, e.g.
// theme: { tokens: { colors: { brand: { 500: { value: "#0ea5e9" } } } } }
// https://www.chakra-ui.com/docs/theming/customization/overview
const config = defineConfig({
  theme: {
    tokens: {},
  },
});

export const system = createSystem(defaultConfig, config);
