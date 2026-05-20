import type { Request, Response, NextFunction } from 'express';

export type BasicAuthConfig = {
  username: string;
  password: string;
};

export function parseBasicAuth(value: string | undefined): BasicAuthConfig | null {
  if (!value) return null;

  const match = value.match(/^Basic\s+(.+)$/i);
  if (!match) return null;

  let decoded = '';
  try {
    decoded = Buffer.from(match[1], 'base64').toString('utf-8');
  } catch {
    return null;
  }

  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex <= 0) return null;

  return {
    username: decoded.slice(0, separatorIndex),
    password: decoded.slice(separatorIndex + 1),
  };
}

export function requireBasicAuth(cfg: BasicAuthConfig | null) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!cfg) {
      next();
      return;
    }

    const parsed = parseBasicAuth(req.header('authorization'));
    if (parsed?.username === cfg.username && parsed.password === cfg.password) {
      next();
      return;
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="Knock"');
    res.status(401).type('text/plain').send('authentication required');
  };
}
