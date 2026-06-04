import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Booking } from "../entity/Booking";

export class BookingController {
  private bookingRepository = AppDataSource.getRepository(Booking);

  async all(request: Request, response: Response) {
    const bookings = await this.bookingRepository.find();
    return response.json(bookings);
  }

  async byHirer(request: Request, response: Response) {
    const hirerId = parseInt(request.params.hirerId);

    if (isNaN(hirerId)) {
      return response.status(400).json({ message: "Invalid hirerId" });
    }

    const bookings = await this.bookingRepository.find({
      where: { hirerId },
      relations: ["venue"],
    });

    return response.json(bookings);
  }

  async one(request: Request, response: Response) {
    const id = parseInt(request.params.id);

    const booking = await this.bookingRepository.findOne({
      where: { id },
    });

    if (!booking) {
      return response.status(404).json({ message: "Booking not found" });
    }

    return response.json(booking);
  }

  async save(request: Request, response: Response) {
  const {
    hirerId,
    venueId,
    checkIn,
    checkOut,
    nights,
    guests,
    eventName,
    eventTime,
    eventDuration,
    preferenceRank,
    total,
    status,
    rating,
  } = request.body;

  const booking = Object.assign(new Booking(), {
    hirerId,
    venueId,
    checkIn,
    checkOut,
    nights,
    guests,
    eventName,
    eventTime,
    eventDuration,
    preferenceRank,
    total,
    status: status || "pending",
    rating,
  });

  try {
    const savedBooking = await this.bookingRepository.save(booking);
    return response.status(201).json(savedBooking);
  } catch (error) {
    return response.status(400).json({
      message: "Error creating booking",
      error,
    });
  }
}

  async update(request: Request, response: Response) {
  const id = parseInt(request.params.id);

  const {
    hirerId,
    venueId,
    checkIn,
    checkOut,
    nights,
    guests,
    eventName,
    eventTime,
    eventDuration,
    preferenceRank,
    total,
    status,
    rating,
  } = request.body;

  let bookingToUpdate = await this.bookingRepository.findOne({
    where: { id },
  });

  if (!bookingToUpdate) {
    return response.status(404).json({ message: "Booking not found" });
  }

  bookingToUpdate = Object.assign(bookingToUpdate, {
    hirerId,
    venueId,
    checkIn,
    checkOut,
    nights,
    guests,
    eventName,
    eventTime,
    eventDuration,
    preferenceRank,
    total,
    status,
    rating,
  });

  try {
    const updatedBooking = await this.bookingRepository.save(bookingToUpdate);
    return response.json(updatedBooking);
  } catch (error) {
    return response.status(400).json({
      message: "Error updating booking",
      error,
    });
  }
}

  async remove(request: Request, response: Response) {
    const id = parseInt(request.params.id);

    const bookingToRemove = await this.bookingRepository.findOne({
      where: { id },
    });

    if (!bookingToRemove) {
      return response.status(404).json({ message: "Booking not found" });
    }

    await this.bookingRepository.remove(bookingToRemove);

    return response.json({ message: "Booking removed successfully" });
  }
}