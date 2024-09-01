import { Flex } from "@chakra-ui/react";

import { CookiesProvider } from "react-cookie";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { CatchAll } from "./components/CatchAll";
import { Dashboard } from "./components/dashboard/Dashboard";
import { Login } from "./components/login/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Signup } from "./components/signup/Signup";
import { AuthProvider } from "./contexts/AuthContext";
import { BackendProvider } from "./contexts/BackendContext";
import { RoleProvider } from "./contexts/RoleContext";

const App = () => {
  return (
    <CookiesProvider>
      <BackendProvider>
        <AuthProvider>
          <RoleProvider>
            <Flex
              sx={{
                flexDirection: "column",
                backgroundColor: "#F9F8F7",
                padding: 4,
                minHeight: "100vh",
                flexGrow: 1,
              }}
            >
              <Router>
                <Routes>
                  <Route
                    path="/login"
                    element={<Login />}
                  />
                  <Route
                    path="/signup"
                    element={<Signup />}
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute
                        element={<Dashboard />}
                        allowedRoles={"admin"}
                      />
                    }
                  />

                  {/* Catch-all route */}
                  <Route
                    path="*"
                    element={<ProtectedRoute element={<CatchAll />} />}
                  />
                </Routes>
              </Router>
            </Flex>
          </RoleProvider>
        </AuthProvider>
      </BackendProvider>
    </CookiesProvider>
  );
};

export default App;
