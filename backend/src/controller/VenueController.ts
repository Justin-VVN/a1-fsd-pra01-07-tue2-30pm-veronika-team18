import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Venue } from "../entity/Venue";

export class VenueController {
  private venueRepository = AppDataSource.getRepository(Venue);

  async all(request: Request, response: Response) {
    const venues = await this.venueRepository.find({ relations: ["owner"] });

    const result = venues.map((v) => {
      const { owner, bookings, blockedDates, ...rest } = v as any;
      return {
        ...rest,
        ownerId: owner?.id ?? null,
        ownerFullname: owner?.fullName ?? null,
      };
    });

    return response.json(result);
  }

  async one(request: Request, response: Response) {
    const id = parseInt(request.params.id);

    const venue = await this.venueRepository.findOne({
      where: { id },
      relations: ["owner"],
    });

    if (!venue) {
      return response.status(404).json({ message: "Venue not found" });
    }

    const { owner, bookings, blockedDates, ...rest } = venue as any;
    return response.json({
      ...rest,
      ownerId: owner?.id ?? null,
      ownerFullname: owner?.fullName ?? null,
    });
  }

  async save(request: Request, response: Response) {
    const { name, ownerId, imgSrc, location, capacity, price } = request.body;

    const venue = Object.assign(new Venue(), {
      name,
      ownerId,
      imgSrc,
      location,
      capacity,
      price,
    });

    try {
      const savedVenue = await this.venueRepository.save(venue);
      return response.status(201).json(savedVenue);
    } catch (error) {
      return response.status(400).json({
        message: "Error creating venue",
        error,
      });
    }
  }

  async update(request: Request, response: Response) {
    const id = parseInt(request.params.id);
    const { name, ownerId, imgSrc, location, capacity, price } = request.body;

    let venueToUpdate = await this.venueRepository.findOne({
      where: { id },
    });

    if (!venueToUpdate) {
      return response.status(404).json({ message: "Venue not found" });
    }

    venueToUpdate = Object.assign(venueToUpdate, {
      name,
      ownerId,
      imgSrc,
      location,
      capacity,
      price,
    });

    try {
      const updatedVenue = await this.venueRepository.save(venueToUpdate);
      return response.json(updatedVenue);
    } catch (error) {
      return response.status(400).json({
        message: "Error updating venue",
        error,
      });
    }
  }

  async remove(request: Request, response: Response) {
    const id = parseInt(request.params.id);

    const venueToRemove = await this.venueRepository.findOne({
      where: { id },
    });

    if (!venueToRemove) {
      return response.status(404).json({ message: "Venue not found" });
    }

    await this.venueRepository.remove(venueToRemove);

    return response.json({ message: "Venue removed successfully" });
  }
}