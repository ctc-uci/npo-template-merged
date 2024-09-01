import { Navigate } from "react-router-dom";

import { useAuthContext } from "../contexts/hooks/useAuthContext";
import { useRoleContext } from "../contexts/hooks/useRoleContext";

interface ProtectedRouteProps {
  element: JSX.Element;
  allowedRoles?: string | string[];
}

export const ProtectedRoute = ({
  element,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { currentUser } = useAuthContext();
  const { role } = useRoleContext();

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return currentUser && (roles.includes(role) || role === "admin") ? (
    element
  ) : (
    <Navigate to={"/login"} />
  );
};
