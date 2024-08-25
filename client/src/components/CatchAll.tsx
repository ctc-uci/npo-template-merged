import { useNavigate } from "react-router-dom";

export const CatchAll = () => {
  const navigate = useNavigate();

  navigate("/dashboard");

  return <p>Route not found... redirecting...</p>;
};
