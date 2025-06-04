// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import fs from "node:fs/promises"; 
import path from "node:path"; 
import { connect } from "./services/mongo"; 
import historyItemRoutes from "./routes/historyItems";
import authRouter, { authenticateUser } from "./routes/auth"; 
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;
const staticDir = process.env.STATIC || "public";

app.use(express.static(staticDir)); 

app.use(express.json()); 
app.use(cors());       

connect("csc437cluster"); 

app.use("/auth", authRouter); 
app.use("/api/history", authenticateUser, historyItemRoutes); 

app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});


app.use("/app", (req: Request, res: Response, next: NextFunction) => {
  if (staticDir.includes("app/dist")) { 
    const spaIndexHtmlPath = path.resolve(staticDir, "index.html");
    fs.readFile(spaIndexHtmlPath, { encoding: "utf8" })
      .then((htmlContent) => {
        res.setHeader("Content-Type", "text/html");
        res.send(htmlContent);
      })
      .catch((err) => {
        console.error("Error serving SPA index.html:", err);
        res.status(500).send("Error loading application.");
      });
  } else {
    next(); 
  }
});

app.get("/", (req: Request, res: Response) => {
    res.redirect("/app");
});

app.get(/.*/, (req, res) => {    
  res.status(404).send('Page not found');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Serving static files from: ${path.resolve(staticDir)}`);
});