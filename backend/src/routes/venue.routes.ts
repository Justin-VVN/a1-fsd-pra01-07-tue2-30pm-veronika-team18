import { Router } from "express";
import { VenueController } from "../controller/VenueController";

const router = Router();
const venueController = new VenueController();

router.get("/venues", async (req, res) => {
  await venueController.all(req, res);
});

router.get("/venues/:id", async (req, res) => {
  await venueController.one(req, res);
});

router.post("/venues", async (req, res) => {
  await venueController.save(req, res);
});

router.put("/venues/:id", async (req, res) => {
  await venueController.update(req, res);
});

router.delete("/venues/:id", async (req, res) => {
  await venueController.remove(req, res);
});

export default router;