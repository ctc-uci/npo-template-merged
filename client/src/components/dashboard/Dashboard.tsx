import { useEffect, useState } from "react";

import {
  Button,
  Heading,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";

import { useAuthContext } from "../../contexts/hooks/useAuthContext";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { User } from "../../types/user";
import { RoleSelect } from "./RoleSelect";

export const Dashboard = () => {
  const { logout, currentUser } = useAuthContext();
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

      <VStack>
        <Text> Signed in as {currentUser?.email}</Text>
        <Button onClick={logout}>Sign out</Button>
      </VStack>

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
              <Th>Role</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users
              ? users.map((user, i) => (
                  <Tr key={i}>
                    <Td>{user.id}</Td>
                    <Td>{user.email}</Td>
                    <Td>{user.firebaseUid}</Td>
                    <Td>
                      <RoleSelect user={user} />
                    </Td>
                  </Tr>
                ))
              : null}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
};
