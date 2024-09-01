import { createContext, ReactNode, useEffect, useState } from "react";

import { Spinner } from "@chakra-ui/react";

import type { User as DbUser, User } from "../types/user";
import { auth } from "../utils/auth/firebase";
import { backend } from "../utils/backend";

type DbUserRole = DbUser["role"];

interface RoleContextProps {
  role: DbUserRole | undefined;
  loading: boolean;
}

export const RoleContext = createContext<RoleContextProps | null>(null);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<DbUserRole | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const response = await backend.get(`/users/${user.uid}`);

          setRole((response.data as User[]).at(0)?.role);
        } else {
          setRole(undefined);
        }
      } catch (e) {
        console.error(`Error setting role: ${e.message}`);
        setRole(undefined);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <RoleContext.Provider value={{ role, loading }}>
      {loading ? <Spinner /> : children}
    </RoleContext.Provider>
  );
};
