import { Router } from "express";
import { BlockedDateController } from "../controller/BlockedDateController";

const router = Router();
const blockedDateController = new BlockedDateController();

router.get("/blocked-dates", async (req, res) => {
  await blockedDateController.all(req, res);
});

router.get("/blocked-dates/:id", async (req, res) => {
  await blockedDateController.one(req, res);
});

router.post("/blocked-dates", async (req, res) => {
  await blockedDateController.save(req, res);
});

router.put("/blocked-dates/:id", async (req, res) => {
  await blockedDateController.update(req, res);
});

router.delete("/blocked-dates/:id", async (req, res) => {
  await blockedDateController.remove(req, res);
});

export default router;