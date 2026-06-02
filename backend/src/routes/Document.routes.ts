import { Router } from "express";
import { DocumentController } from "../controller/DocumentController";

const router = Router();
const documentController = new DocumentController();

router.get("/documents", async (req, res) => {
  await documentController.all(req, res);
});

router.get("/documents/:id", async (req, res) => {
  await documentController.one(req, res);
});

router.post("/documents", async (req, res) => {
  await documentController.save(req, res);
});

router.put("/documents/:id", async (req, res) => {
  await documentController.update(req, res);
});

router.delete("/documents/:id", async (req, res) => {
  await documentController.remove(req, res);
});

export default router;