import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
};

export function generateToken(payload: TokenPayload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"]
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}
