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

import { useAuthContext } from "../contexts/hooks/useAuthContext";
import { auth } from "../utils/auth/firebase";
import { createGoogleUserInFirebase } from "../utils/auth/providers";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { signup } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    delayError: 750,
  });

  const handleSignup = async (data: SignupFormValues) => {
    try {
      const user = await signup({
        email: data.email,
        password: data.password,
      });

      if (user) {
        navigate("/dashboard");
      }
    } catch (err) {
      if (err instanceof Error) {
        toast({
          title: "An error occurred",
          description: err.message,
          status: "error",
          variant: "subtle",
        });
      }
    }
  };

  const handleGoogleSignup = async () => {
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
      <Heading>Signup</Heading>

      <form
        onSubmit={handleSubmit(handleSignup)}
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
              to="/login"
            >
              <FormHelperText>Click here to login</FormHelperText>
            </ChakraLink>
          </FormControl>

          <Button
            type="submit"
            size={"lg"}
            sx={{ width: "100%" }}
          >
            Signup
          </Button>
        </Stack>
      </form>

      <Button
        leftIcon={<FaGoogle />}
        variant={"solid"}
        size={"lg"}
        onClick={handleGoogleSignup}
        sx={{ width: "100%" }}
      >
        Signup with Google
      </Button>
    </VStack>
  );
};
