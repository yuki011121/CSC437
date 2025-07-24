// src/routes/auth.ts
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express"; 
import jwt from "jsonwebtoken";
import CredentialService from "../services/credential-svc"; 

const router = express.Router();
dotenv.config(); 

const TOKEN_SECRET: string = process.env.TOKEN_SECRET || "DEFAULT_FALLBACK_SECRET_IF_NOT_IN_ENV";
if (TOKEN_SECRET === "DEFAULT_FALLBACK_SECRET_IF_NOT_IN_ENV") {
    console.warn("Warning: TOKEN_SECRET is not set in .env, using default fallback.");
}

function generateAccessToken(username: string): Promise<string> { 
  return new Promise((resolve, reject) => {
    jwt.sign(
      { username: username }, 
      TOKEN_SECRET,          
      { expiresIn: "1d" },    
      (error, token) => {
        if (error) {
          reject(error);
        } else {
          resolve(token as string); 
        }
      }
    );
  });
}

router.post("/register", (req: Request, res: Response) => {
  const { username, password } = req.body; 

  if (!username || !password || typeof username !== "string" || typeof password !== "string") {
    res.status(400).send({ message: "Bad request: Invalid input data. Username and password are required strings." });
    return;
  }

  CredentialService.create(username, password)
    .then((creds) => generateAccessToken(creds.username))
    .then((token) => {
      res.status(201).send({ token: token });
    })
    .catch((err) => {
      if (err.message && err.message.includes("already exists")) {
        res.status(409).send({ message: err.message }); 
      } else {
        console.error("Registration error:", err);
        res.status(500).send({ message: "Internal server error during registration." });
      }
    });
});

router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password || typeof username !== "string" || typeof password !== "string") {
    res.status(400).send({ message: "Bad request: Invalid input data. Username and password are required." });
    return;
  }

  CredentialService.verify(username, password)
    .then((verifiedUsername: string) => generateAccessToken(verifiedUsername)) 
    .then((token) => {
      res.status(200).send({ token: token }); 
    })
    .catch((err) => { 
      res.status(401).send({ message: "Unauthorized: Invalid username or password." }); 
    });
});

export function authenticateUser( 
  req: Request,
  res: Response,
  next: NextFunction 
): void {
  const authHeader = req.headers["authorization"]; 
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).send({ message: "Unauthorized: No token provided." });
    return;
  }

  jwt.verify(token, TOKEN_SECRET, (error, decoded) => {
    if (error) {
      res.status(403).send({ message: "Forbidden: Invalid or expired token." });
      return;
    }
    (req as any).user = decoded;  
    next();
  });
}

export function tryAuthenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // No token? No problem for guests. Just move on.
    return next();
  }

  jwt.verify(token, TOKEN_SECRET, (error, decoded) => {
    if (error) {
      // Token is present but invalid. This is an error.
      return res.status(403).send({ message: "Forbidden: Invalid or expired token." });
    }
    // Token is valid, attach user info to the request and move on.
    (req as any).user = decoded;
    next();
  });
}

export default router; // Export the router for now

