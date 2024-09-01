import { useCallback, useEffect } from "react";

import {
  Button,
  Center,
  Link as ChakraLink,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Heading,
  Input,
  Stack,
  useToast,
  VStack,
} from "@chakra-ui/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { getRedirectResult } from "firebase/auth";
import { useForm } from "react-hook-form";
import { FaGoogle } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAuthContext } from "../../contexts/hooks/useAuthContext";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { auth } from "../../utils/auth/firebase";
import { authenticateGoogleUser } from "../../utils/auth/providers";

const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const { login } = useAuthContext();
  const { backend } = useBackendContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    mode: "onBlur",
  });

  const toastLoginError = useCallback(
    (msg: string) => {
      toast({
        title: "An error occurred while signing in",
        description: msg,
        status: "error",
        variant: "subtle",
      });
    },
    [toast]
  );

  const handleLogin = async (data: SigninFormValues) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      });
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
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (result) {
          const response = await backend.get(`/users/${result.user.uid}`);
          if (response.data.length === 0) {
            try {
              await backend.post("/users/create", {
                email: result.user.email,
                firebaseUid: result.user.uid,
              });
            } catch (e) {
              await backend.delete(`/users/${result.user.uid}`);

              return toast({
                title: "An error occurred",
                description: `Account was not created: ${e.message}`,
                status: "error",
              });
            }
          }

          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Redirect result error:", error);
      }
    };
    handleRedirectResult();
  }, [backend, navigate, toast]);

  return (
    <VStack
      spacing={8}
      sx={{ width: 300, marginX: "auto" }}
    >
      <Heading>Login</Heading>

      <form
        onSubmit={handleSubmit(handleLogin)}
        style={{ width: "100%" }}
      >
        <Stack spacing={2}>
          <FormControl
            isInvalid={!!errors.email}
            w={"100%"}
          >
            <Center>
              <Input
                placeholder="Email"
                type="email"
                size={"lg"}
                {...register("email")}
                name="email"
                isRequired
                autoComplete="email"
              />
            </Center>
            <FormErrorMessage>
              {errors.email?.message?.toString()}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
            <Center>
              <Input
                placeholder="Password"
                type="password"
                size={"lg"}
                {...register("password")}
                name="password"
                isRequired
                autoComplete="current-password"
              />
            </Center>
            <FormErrorMessage>
              {errors.password?.message?.toString()}
            </FormErrorMessage>
            <ChakraLink
              as={Link}
              to="/signup"
            >
              <FormHelperText>Click here to sign up</FormHelperText>
            </ChakraLink>
          </FormControl>

          <Button
            type="submit"
            size={"lg"}
            sx={{ width: "100%" }}
            isDisabled={Object.keys(errors).length > 0}
          >
            Login
          </Button>
        </Stack>
      </form>

      <Button
        leftIcon={<FaGoogle />}
        variant={"solid"}
        size={"lg"}
        onClick={handleGoogleLogin}
        sx={{ width: "100%" }}
      >
        Login with Google
      </Button>
    </VStack>
  );
};
