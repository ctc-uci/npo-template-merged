// import { useEffect, useState } from "react";

import { Navigate } from "react-router-dom";

import { useAuthContext } from "../contexts/hooks/useAuthContext";

interface ProtectedRouteProps {
  element: JSX.Element;
}

export const ProtectedRoute = ({ element }: ProtectedRouteProps) => {
  const { currentUser } = useAuthContext();
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   setIsLoading(false);
  // }, []);

  // if (isLoading) {
  //   return <h1>Loading...</h1>;
  // }

  return currentUser ? element : <Navigate to={"/login"} />;
};
