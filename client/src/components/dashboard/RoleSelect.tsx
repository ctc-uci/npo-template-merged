import { ChangeEvent, useCallback, useState } from "react";

import { Select, Spinner, useToast } from "@chakra-ui/react";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { User } from "../../types/users";

export const RoleSelect = ({ user }: { user: User }) => {
  const { backend } = useBackendContext();
  const toast = useToast();

  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const handleChangeRole = useCallback(
    async (e: ChangeEvent<HTMLSelectElement>) => {
      const previousRole = role;
      const updatedRole = e.currentTarget.value;
      setLoading(true);

      try {
        await backend.put("/users/update/set-role", {
          role: updatedRole,
          firebaseUid: user.firebaseUid,
        });

        if (updatedRole !== "user" && updatedRole !== "admin") {
          throw Error("Role is not valid");
        }

        setRole(updatedRole);

        toast({
          title: "Role Updated",
          description: `Updated role from ${previousRole} to ${updatedRole}`,
          status: "success",
        });
      } catch (error) {
        console.error("Error updating user role:", error);

        toast({
          title: "An Error Occurred",
          description: `Role was not updated`,
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [backend, role, toast, user.firebaseUid]
  );

  return (
    <Select
      placeholder="Select role"
      value={role}
      onChange={handleChangeRole}
      disabled={loading}
      icon={loading ? <Spinner size={"xs"} /> : undefined}
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </Select>
  );
};
