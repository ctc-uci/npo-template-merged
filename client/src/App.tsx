import { Box, Text } from "@chakra-ui/react";

import { BackendProvider } from "./contexts/BackendContext";

const App = () => {
  return (
    <BackendProvider>
      <Box>
        <Text>Hello World</Text>
      </Box>
    </BackendProvider>
  );
};

export default App;
