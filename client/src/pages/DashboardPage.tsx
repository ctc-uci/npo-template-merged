import { useEffect, useState } from "react";

import {
  Button,
  Heading,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";

import { useAuthContext } from "../contexts/hooks/useAuthContext";
import { useBackendContext } from "../contexts/hooks/useBackendContext";
import { User } from "../types/users";

export const DashboardPage = () => {
  const { logout } = useAuthContext();
  const { backend } = useBackendContext();

  const [users, setUsers] = useState<User[] | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await backend.get("/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchData();
  }, [backend]);

  return (
    <VStack
      spacing={8}
      sx={{ maxWidth: "100%", marginX: "auto" }}
    >
      <Heading>Dashboard</Heading>

      <Button onClick={logout}>Sign out</Button>

      <TableContainer
        sx={{
          overflowX: "auto",
        }}
      >
        <Table variant="simple">
          <TableCaption>Users</TableCaption>
          <Thead>
            <Tr>
              <Th>Id</Th>
              <Th>Email</Th>
              <Th>FirebaseUid</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users
              ? users.map((user, i) => (
                  <Tr key={i}>
                    <Td>{user.id}</Td>
                    <Td>{user.email}</Td>
                    <Td>{user.firebaseUid}</Td>
                  </Tr>
                ))
              : null}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
};
