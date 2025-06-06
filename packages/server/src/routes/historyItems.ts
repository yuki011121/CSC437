// src/routes/historyItems.ts
import express from "express";
import { HistoryItem } from "../models/historyItem";
import HistoryService from "../services/historyItem-svc";

const router = express.Router();

router.get("/", (req: express.Request, res: express.Response): void => {
  const user = (req as any).user;
  if (!user?.username) {
    res.status(401).json({ message: "Unauthorized: User not found" });
    return;
  }

  HistoryService.index(user.username)
    .then((list) => res.json(list))
    .catch((err) => res.status(500).send(err));
});

router.get("/:id", (req, res): void => {
  HistoryService.get(req.params.id)
    .then((item) =>
      item
        ? res.json(item)
        : res.status(404).json({ message: "History item not found" })
    )
    .catch((err) => res.status(500).send(err));
});

router.post("/", (req, res): void => {
  HistoryService.create(req.body as HistoryItem)
    .then((created) => res.status(201).json(created))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).json({ message: err.message, errors: err.errors });
      } else {
        res.status(500).send(err);
      }
    });
});

router.put("/:id", (req, res): void => {
  HistoryService.update(req.params.id, req.body)
    .then((updated) =>
      updated
        ? res.json(updated)
        : res.status(404).json({ message: "History item not found" })
    )
    .catch((err) => res.status(500).send(err));
});

router.delete("/:id", (req, res): void => {
  HistoryService.remove(req.params.id)
    .then((deleted) =>
      deleted
        ? res.status(204).end()
        : res.status(404).json({ message: "History item not found" })
    )
    .catch((err) => res.status(500).send(err));
});

export default router;
