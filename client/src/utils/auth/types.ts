import { NavigateFunction } from "react-router-dom";

export interface FirebaseUtilParams {
  email: string;
  password: string;
  redirect: string;
  navigate: NavigateFunction;
}

export interface FirebaseUtilRedirectParams {
  redirect: string;
  navigate: NavigateFunction;
}
