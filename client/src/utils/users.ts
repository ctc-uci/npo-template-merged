import { backend } from "./backend";

// TODO: define user as a type
export const createUser = async ({
  email = "",
  userId,
}: {
  email: string | null;
  userId: string;
}) => {
  const response = await backend.post("/users", { email, userId });
  return response.data;
};

export const getUserByFirebaseUid = async (uid: string) => {
  const response = await backend.get(`/users/${uid}`);
  return response.data;
};
