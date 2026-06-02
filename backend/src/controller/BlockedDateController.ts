import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { BlockedDate } from "../entity/BlockedDate";

export class BlockedDateController {
  private blockedDateRepository = AppDataSource.getRepository(BlockedDate);

  async all(request: Request, response: Response) {
    const blockedDates = await this.blockedDateRepository.find();
    return response.json(blockedDates);
  }

  async one(request: Request, response: Response) {
    const id = parseInt(request.params.id);

    const blockedDate = await this.blockedDateRepository.findOne({
      where: { id },
    });

    if (!blockedDate) {
      return response.status(404).json({ message: "Blocked date not found" });
    }

    return response.json(blockedDate);
  }

  async save(request: Request, response: Response) {
    const { venueId, startDate, endDate, reason } = request.body;

    const blockedDate = Object.assign(new BlockedDate(), {
      venueId,
      startDate,
      endDate,
      reason,
    });

    try {
      const savedBlockedDate = await this.blockedDateRepository.save(blockedDate);
      return response.status(201).json(savedBlockedDate);
    } catch (error) {
      return response.status(400).json({
        message: "Error creating blocked date",
        error,
      });
    }
  }

  async update(request: Request, response: Response) {
    const id = parseInt(request.params.id);
    const { venueId, startDate, endDate, reason } = request.body;

    let blockedDateToUpdate = await this.blockedDateRepository.findOne({
      where: { id },
    });

    if (!blockedDateToUpdate) {
      return response.status(404).json({ message: "Blocked date not found" });
    }

    blockedDateToUpdate = Object.assign(blockedDateToUpdate, {
      venueId,
      startDate,
      endDate,
      reason,
    });

    try {
      const updatedBlockedDate =
        await this.blockedDateRepository.save(blockedDateToUpdate);

      return response.json(updatedBlockedDate);
    } catch (error) {
      return response.status(400).json({
        message: "Error updating blocked date",
        error,
      });
    }
  }

  async remove(request: Request, response: Response) {
    const id = parseInt(request.params.id);

    const blockedDateToRemove = await this.blockedDateRepository.findOne({
      where: { id },
    });

    if (!blockedDateToRemove) {
      return response.status(404).json({ message: "Blocked date not found" });
    }

    await this.blockedDateRepository.remove(blockedDateToRemove);

    return response.json({ message: "Blocked date removed successfully" });
  }
}