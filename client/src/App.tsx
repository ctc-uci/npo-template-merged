import { Box, Text } from "@chakra-ui/react";

import { AuthProvider } from "./contexts/AuthContext";
import { BackendProvider } from "./contexts/BackendContext";

const App = () => {
  return (
    <BackendProvider>
      <AuthProvider>
        <Box>
          <Text>Hello World</Text>
        </Box>
      </AuthProvider>
    </BackendProvider>
  );
};

export default App;
