import { Router } from "express";
import { BookingController } from "../controller/BookingController";

const router = Router();
const bookingController = new BookingController();

router.get("/bookings", async (req, res) => {
  await bookingController.all(req, res);
});

router.get("/bookings/:id", async (req, res) => {
  await bookingController.one(req, res);
});

router.post("/bookings", async (req, res) => {
  await bookingController.save(req, res);
});

router.put("/bookings/:id", async (req, res) => {
  await bookingController.update(req, res);
});

router.delete("/bookings/:id", async (req, res) => {
  await bookingController.remove(req, res);
});

export default router;