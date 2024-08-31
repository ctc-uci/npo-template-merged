import type { NextFunction, Request, Response } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";

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
    const { cookies } = req;

    if (!cookies.accessToken) {
      return res.status(400).send("@verifyToken invalid access token");
    }

    const decodedToken = await admin.auth().verifyIdToken(cookies.accessToken);

    // this should not happen!
    if (!decodedToken) {
      return res.status(400).send("@verifyToken no decodedToken returned");
    }

    res.locals.decodedToken = decodedToken;

    next();
  } catch (_err) {
    return res.status(400).send("@verifyToken error validating token");
  }
};

export const verifyRole = (requiredRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cookies } = req;

      const claims: DecodedIdToken =
        res.locals.decodedToken ??
        (await admin.auth().verifyIdToken(cookies.accessToken));

      if (claims[requiredRole] === true) {
        next();
      } else {
        res
          .status(403)
          .send(`@verifyRole invalid role (required: ${requiredRole})`);
      }
    } catch (_err) {
      console.log(_err);
      res.status(401).send("@verifyRole could not verify role");
    }
  };
};
