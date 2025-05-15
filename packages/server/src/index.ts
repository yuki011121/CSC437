// src/index.ts
import express, { Request, Response } from "express";
import { connect } from "./services/mongo"; 
import HistoryService from "./services/historyItem-svc"; 

const app = express();
const port = process.env.PORT || 3000;
const staticDir = process.env.STATIC || "public";

app.use(express.static(staticDir));

// Call connect before app.listen, after app has been initialized
connect("csc437cluster");

app.use(express.static(staticDir));

app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});
// 新增：获取所有历史记录项的路由
app.get("/api/history", (req: Request, res: Response) => {
  HistoryService.index() // 调用我们 service 中的 index() 函数
    .then((items) => {
      res.status(200).json(items); // 成功，返回 JSON 数据和 200 OK 状态
    })
    .catch((error) => {
      console.error("Failed to retrieve history items:", error);
      res.status(500).send({ message: "Error retrieving history items" }); // 服务器内部错误
    });
});

// 新增：获取单个历史记录项的路由 (通过 ID)
app.get("/api/history/:id", (req: Request, res: Response) => {
  const { id } = req.params; // 从 URL 中获取 id 参数

  HistoryService.get(id) // 调用我们 service 中的 get() 函数
    .then((item) => {
      if (item) {
        res.status(200).json(item); // 找到了，返回数据
      } else {
        res.status(404).send({ message: "History item not found" }); // 未找到
      }
    })
    .catch((error) => {
      console.error(`Failed to retrieve history item with id ${id}:`, error);
      res.status(500).send({ message: "Error retrieving history item" }); // 服务器内部错误
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});