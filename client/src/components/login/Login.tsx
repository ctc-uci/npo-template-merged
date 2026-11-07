import { useCallback, useEffect } from "react";

import {
  Button,
  Center,
  Link as ChakraLink,
  Field,
  Heading,
  Input,
  Stack,
  VStack,
} from "@chakra-ui/react";

import { useAuthContext } from "@/contexts/hooks/useAuthContext";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { authenticateGoogleUser } from "@/utils/auth/providers";
import { toaster } from "@/utils/toaster";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaGoogle } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export const Login = () => {
  const navigate = useNavigate();

  const { login, handleRedirectResult } = useAuthContext();
  const { backend } = useBackendContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    mode: "onBlur",
  });

  const toastLoginError = useCallback((msg: string) => {
    toaster.create({
      title: "An error occurred while signing in",
      description: msg,
      type: "error",
    });
  }, []);

  const handleLogin = async (data: SigninFormValues) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      });

      navigate("/dashboard");
    } catch (err) {
      const errorCode = err.code;
      const firebaseErrorMsg = err.message;

      switch (errorCode) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
        case "auth/invalid-email":
        case "auth/user-not-found":
          toastLoginError(
            "Email address or password does not match our records!"
          );
          break;
        case "auth/unverified-email":
          toastLoginError("Please verify your email address.");
          break;
        case "auth/user-disabled":
          toastLoginError("This account has been disabled.");
          break;
        case "auth/too-many-requests":
          toastLoginError("Too many attempts. Please try again later.");
          break;
        case "auth/user-signed-out":
          toastLoginError("You have been signed out. Please sign in again.");
          break;
        default:
          toastLoginError(firebaseErrorMsg);
      }
    }
  };

  const handleGoogleLogin = async () => {
    await authenticateGoogleUser();
  };

  useEffect(() => {
    handleRedirectResult(backend, navigate);
  }, [backend, handleRedirectResult, navigate]);

  return (
    <VStack
      gap={8}
      w="300px"
      mx="auto"
    >
      <Heading>Login</Heading>

      <form
        onSubmit={handleSubmit(handleLogin)}
        style={{ width: "100%" }}
      >
        <Stack gap={2}>
          <Field.Root
            invalid={!!errors.email}
            w={"100%"}
          >
            <Center w="100%">
              <Input
                placeholder="Email"
                type="email"
                size={"lg"}
                w="100%"
                {...register("email")}
                name="email"
                required
                autoComplete="email"
              />
            </Center>
            <Field.ErrorText>
              {errors.email?.message?.toString()}
            </Field.ErrorText>
          </Field.Root>
          <Field.Root
            invalid={!!errors.password}
            w={"100%"}
          >
            <Center w="100%">
              <Input
                placeholder="Password"
                type="password"
                size={"lg"}
                w="100%"
                {...register("password")}
                name="password"
                required
                autoComplete="current-password"
              />
            </Center>
            <Field.ErrorText>
              {errors.password?.message?.toString()}
            </Field.ErrorText>
            <ChakraLink asChild>
              <Link to="/signup">
                <Field.HelperText>Click here to sign up</Field.HelperText>
              </Link>
            </ChakraLink>
          </Field.Root>

          <Button
            type="submit"
            size={"lg"}
            w="100%"
            disabled={Object.keys(errors).length > 0}
          >
            Login
          </Button>
        </Stack>
      </form>

      <Button
        variant={"solid"}
        size={"lg"}
        onClick={handleGoogleLogin}
        w="100%"
      >
        <FaGoogle />
        Login with Google
      </Button>
    </VStack>
  );
};
