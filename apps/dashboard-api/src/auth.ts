import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export type AuthConfig = {
  adminPassword: string;
  jwtSecret: string;
};

export type JwtClaims = {
  sub: "admin";
};

export function signAdminToken(cfg: AuthConfig): string {
  const claims: JwtClaims = { sub: "admin" };
  return jwt.sign(claims, cfg.jwtSecret, { expiresIn: "7d" });
}

export function requireAuth(cfg: AuthConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = req.header("authorization") || "";
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) return res.status(401).json({ error: "missing_bearer_token" });

    try {
      jwt.verify(m[1], cfg.jwtSecret);
      return next();
    } catch {
      return res.status(401).json({ error: "invalid_token" });
    }
  };
}
