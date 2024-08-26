import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { admin } from "../config/firebase";

export const authRouter = Router();

/**
 * Verifies the access token attached to the request's cookies.
 */
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      cookies: { accessToken },
    } = req;

    if (!accessToken) {
      return res.status(400).send("@verifyToken invalid access token");
    }

    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    if (!decodedToken) {
      return res.status(400).send("@verifyToken no decodedToken returned");
    }

    // @ts-expect-error locals is not declared on type Request, but is a recommended pattern for passing data through middleware
    req.locals.decodedToken = decodedToken;

    return next();
  } catch (_err) {
    return res.status(400).send("@verifyToken invalid access token");
  }
};

authRouter.use(verifyToken);

authRouter.get("/verifyToken", async (req, res) => {
  try {
    // @ts-expect-error locals is not declared on type Request, but is a recommended pattern for passing data through middleware
    const decodedToken = req.locals.decodedToken;

    return res.status(200).send(decodedToken.uid);
  } catch (_err) {
    return res.status(400).send("@verifyToken invalid access token");
  }
});
