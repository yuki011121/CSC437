// packages/server/src/index.ts
import express, { Request, Response, NextFunction } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { connect } from "./services/mongo";
import historyItemRoutes from "./routes/historyItems";
import authRouter, { authenticateUser } from "./routes/auth";
import recipeRoutes from "./routes/recipeRoutes";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

const rawStaticDir = process.env.STATIC || "public";
const absoluteStaticDir = path.resolve(rawStaticDir); 

app.use(cors());
app.use(express.json());

app.use(express.static(absoluteStaticDir));

connect();

app.use("/auth", authRouter);
app.use("/api/history", authenticateUser, historyItemRoutes);
app.use("/api/recipes", authenticateUser, recipeRoutes);

app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

app.get(/^\/app(\/.*)?$/, async (req, res, next) => {
  try {
    const spaIndexHtmlPath = path.join(absoluteStaticDir, "index.html");
    const htmlContent = await fs.readFile(spaIndexHtmlPath, "utf8");
    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);
  } catch (err) {
    console.error("Failed to serve SPA fallback:", err);
    res.status(404).send("Application main page not found.");
  }
});

app.get("/", (req: Request, res: Response) => {
    res.redirect("/app");
});

app.use((req: Request, res: Response) => {
    res.status(404).send(`Resource not found: ${req.method} ${req.originalUrl}`);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled application error:", err);
    res.status(500).send('Internal Server Error!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Serving static files from (STATIC env var): ${rawStaticDir}`);
    console.log(`Absolute static path being used by express.static: ${absoluteStaticDir}`);
});