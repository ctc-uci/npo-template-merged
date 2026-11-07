import { useEffect, useState } from "react";

import {
  Button,
  Link as ChakraLink,
  Heading,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";

import { useAuthContext } from "@/contexts/hooks/useAuthContext";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useRoleContext } from "@/contexts/hooks/useRoleContext";
import { User } from "@/types/user";
import { Link } from "react-router-dom";

import { RoleSelect } from "./RoleSelect";

export const Dashboard = () => {
  const { logout, currentUser } = useAuthContext();
  const { backend } = useBackendContext();
  const { role } = useRoleContext();

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
      gap={8}
      maxW="100%"
      mx="auto"
    >
      <Heading>Dashboard</Heading>

      <VStack>
        <Text>
          Signed in as {currentUser?.email} (
          {role === "admin" ? "Admin" : "User"})
        </Text>

        {role === "admin" ? (
          <ChakraLink asChild>
            <Link to={"/admin"}>Go to Admin Page</Link>
          </ChakraLink>
        ) : null}
        <Button onClick={logout}>Sign out</Button>
      </VStack>

      <Table.ScrollArea>
        <Table.Root variant="line">
          <Table.Caption>Users</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Id</Table.ColumnHeader>
              <Table.ColumnHeader>Email</Table.ColumnHeader>
              <Table.ColumnHeader>FirebaseUid</Table.ColumnHeader>
              <Table.ColumnHeader>Role</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users
              ? users.map((user, i) => (
                  <Table.Row key={i}>
                    <Table.Cell>{user.id}</Table.Cell>
                    <Table.Cell>{user.email}</Table.Cell>
                    <Table.Cell>{user.firebaseUid}</Table.Cell>
                    <Table.Cell>
                      <RoleSelect
                        user={user}
                        disabled={role !== "admin"}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))
              : null}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </VStack>
  );
};
