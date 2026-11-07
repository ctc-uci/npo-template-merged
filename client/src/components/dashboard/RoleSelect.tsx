import { ChangeEvent, useCallback, useState } from "react";

import { NativeSelect, Spinner } from "@chakra-ui/react";

import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { User } from "@/types/user";
import { toaster } from "@/utils/toaster";

interface RoleSelectProps {
  user: User;
  disabled?: boolean;
}

export const RoleSelect = ({ user, disabled = true }: RoleSelectProps) => {
  const { backend } = useBackendContext();

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

        toaster.create({
          title: "Role Updated",
          description: `Updated role from ${previousRole} to ${updatedRole}`,
          type: "success",
        });
      } catch (error) {
        console.error("Error updating user role:", error);

        toaster.create({
          title: "An Error Occurred",
          description: `Role was not updated`,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [backend, role, user.firebaseUid]
  );

  return (
    <NativeSelect.Root disabled={loading || disabled}>
      <NativeSelect.Field
        placeholder="Select role"
        value={role}
        onChange={handleChangeRole}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </NativeSelect.Field>
      <NativeSelect.Indicator>
        {loading ? <Spinner size={"xs"} /> : undefined}
      </NativeSelect.Indicator>
    </NativeSelect.Root>
  );
};
