import { Button, Heading, VStack } from "@chakra-ui/react";

import { useAuthContext } from "../contexts/hooks/useAuthContext";

export const DashboardPage = () => {
  const { logout } = useAuthContext();

  return (
    <VStack
      spacing={8}
      sx={{ width: 300, marginX: "auto" }}
    >
      <Heading>Dashboard</Heading>

      <Button onClick={logout}>Sign out</Button>
    </VStack>
  );
};
