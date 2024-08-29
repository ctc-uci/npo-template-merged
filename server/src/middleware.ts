import type { NextFunction, Request, Response } from "express";

import { admin } from "../config/firebase";

/**
 * Verifies the access token attached to the request's cookies.
 */
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      cookies: { accessToken },
    } = req;

    if (!accessToken) {
      return res.status(400).send("@verifyToken invalid access token");
    }

    const decodedToken = await admin.auth().verifyIdToken(accessToken);

    // this should not happen!
    if (!decodedToken) {
      return res.status(400).send("@verifyToken no decodedToken returned");
    }

    return next();
  } catch (_err) {
    return res.status(400).send("@verifyToken invalid access token");
  }
};
