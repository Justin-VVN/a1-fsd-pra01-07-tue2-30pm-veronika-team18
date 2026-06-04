import { Router } from "express";
import path from "path";
import multer from "multer";
import { DocumentController } from "../controller/DocumentController";

const router = Router();
const documentController = new DocumentController();

// Multer storage: save to backend/uploads/ with original extension preserved
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB cap
});

router.get("/documents", async (req, res) => {
  await documentController.all(req, res);
});

router.get("/documents/:id", async (req, res) => {
  await documentController.one(req, res);
});

// File upload endpoint — multipart/form-data with a "file" field
router.post("/documents/upload", upload.single("file"), async (req, res) => {
  await documentController.upload(req, res);
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
