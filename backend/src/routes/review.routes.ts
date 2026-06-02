import { Router } from "express";
import { ReviewController } from "../controller/ReviewController";

const router = Router();
const reviewController = new ReviewController();

router.get("/reviews", async (req, res) => {
  await reviewController.all(req, res);
});

router.get("/reviews/:id", async (req, res) => {
  await reviewController.one(req, res);
});

router.post("/reviews", async (req, res) => {
  await reviewController.save(req, res);
});

router.put("/reviews/:id", async (req, res) => {
  await reviewController.update(req, res);
});

router.delete("/reviews/:id", async (req, res) => {
  await reviewController.remove(req, res);
});

export default router;