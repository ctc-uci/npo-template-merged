import { Flex } from "@chakra-ui/react";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { CatchAll } from "./components/CatchAll";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { BackendProvider } from "./contexts/BackendContext";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";

const App = () => {
  return (
    <BackendProvider>
      <AuthProvider>
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
                element={<LoginPage />}
              />
              <Route
                path="/dashboard"
                element={<ProtectedRoute element={<DashboardPage />} />}
              />

              {/* Catch-all route */}
              <Route
                path="*"
                element={<ProtectedRoute element={<CatchAll />} />}
              />
            </Routes>
          </Router>
        </Flex>
      </AuthProvider>
    </BackendProvider>
  );
};

export default App;
