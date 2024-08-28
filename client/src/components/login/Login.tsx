import { useEffect } from "react";

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

import { auth, logInWithEmailAndPassWord } from "../../utils/auth/firebase";
import { createGoogleUserInFirebase } from "../../utils/auth/providers";

const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    delayError: 750,
  });

  const handleLogin = async (data: SigninFormValues) => {
    try {
      await logInWithEmailAndPassWord({
        email: data.email,
        password: data.password,
        redirect: "/",
        navigate,
      });
    } catch (err) {
      const errorCode = err.code;
      const firebaseErrorMsg = err.message;

      const showSigninError = (msg: string) => {
        toast({
          title: "An error occurred while signing in",
          description: msg,
          status: "error",
          variant: "subtle",
        });
      };

      switch (errorCode) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
        case "auth/invalid-email":
        case "auth/user-not-found":
          showSigninError(
            "Email address or password does not match our records!"
          );
          break;
        case "auth/unverified-email":
          showSigninError("Please verify your email address.");
          break;
        case "auth/user-disabled":
          showSigninError("This account has been disabled.");
          break;
        case "auth/too-many-requests":
          showSigninError("Too many attempts. Please try again later.");
          break;
        case "auth/user-signed-out":
          showSigninError("You have been signed out. Please sign in again.");
          break;
        default:
          showSigninError(firebaseErrorMsg);
      }
    }
  };

  const handleGoogleLogin = async () => {
    await createGoogleUserInFirebase({ redirect: "/login", navigate });
  };

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (result) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Redirect result error:", error);
      }
    };
    handleRedirectResult();
  }, [navigate]);

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
                isRequired
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
                isRequired
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
