// src/routes/historyItems.ts
import express, { Request, Response } from "express";
import { HistoryItem } from "../models/historyItem"; 
import HistoryService from "../services/historyItem-svc";

const router = express.Router(); 

router.get("/", (req: Request, res: Response) => {
  HistoryService.index() 
    .then((items) => {
      res.status(200).json(items); 
    })
    .catch((error) => {
      console.error("Failed to retrieve history items:", error);
      res.status(500).send({ message: "Error retrieving history items" }); 
    });
});


router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params; 

  HistoryService.get(id) 
    .then((item) => {
      if (item) {
        res.status(200).json(item);
      } else {
        res.status(404).send({ message: "History item not found" }); 
      }
    })
    .catch((error) => {
      console.error(`Failed to retrieve history item with id ${id}:`, error);
      res.status(500).send({ message: "Error retrieving history item" });
    });
});

router.post("/", (req: Request, res: Response) => {

  const newHistoryItemData = req.body as HistoryItem; 

  HistoryService.create(newHistoryItemData) 
    .then((createdItem) => {
      res.status(201).json(createdItem); 
    })
    .catch((error) => {
      console.error("Failed to create history item:", error);
      if (error.name === 'ValidationError') {
        res.status(400).send({ message: "Validation Error creating history item", errors: error.errors });
      } else {
        res.status(500).send({ message: "Error creating history item" });
      }
    });
});

router.put("/:id", (req: Request, res: Response) => {
  const { id } = req.params; 
  const updatedItemData = req.body as Partial<HistoryItem>; 

  HistoryService.update(id, updatedItemData) 
    .then((updatedItem) => {
      if (updatedItem) {
        res.status(200).json(updatedItem); 
      } else {
        res.status(404).send({ message: "History item not found for update" }); 
      }
    })
    .catch((error) => {
      console.error(`Failed to update history item with id ${id}:`, error);
      if (error.name === 'ValidationError') {
        res.status(400).send({ message: "Validation Error updating history item", errors: error.errors });
      } else if (error.name === 'CastError' && error.path === '_id') {
        res.status(400).send({ message: "Invalid ID format for history item" });
      }
      else {
        res.status(500).send({ message: "Error updating history item" });
      }
    });
});

router.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params; 

  HistoryService.remove(id) 
    .then((deletedItem) => {
      if (deletedItem) {
        res.status(204).end(); 
      } else {
        res.status(404).send({ message: "History item not found for deletion" }); 
      }
    })
    .catch((error) => {
      console.error(`Failed to delete history item with id ${id}:`, error);
      if (error.name === 'CastError' && error.path === '_id') {
        res.status(400).send({ message: "Invalid ID format for history item" });
      } else {
        res.status(500).send({ message: "Error deleting history item" });
      }
    });
});


export default router; 