// src/index.ts
import express, { Request, Response } from "express";
import { connect } from "./services/mongo"; 
//import HistoryService from "./services/historyItem-svc"; 
import historyItemRoutes from "./routes/historyItems";
import authRouter, { authenticateUser } from "./routes/auth"; 
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;
const staticDir = process.env.STATIC || "public";

app.use(express.static(staticDir));
app.use(express.json());
app.use(cors());  
// Call connect before app.listen, after app has been initialized
connect("csc437cluster");

app.use(express.static(staticDir));

// app.use("/api/history", historyItemRoutes); 

// app.use("/auth", authRoutes);
app.use("/auth", authRouter); 
app.use("/api/history", authenticateUser, historyItemRoutes); 

app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});