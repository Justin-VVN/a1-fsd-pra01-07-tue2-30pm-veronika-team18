import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Review } from "../entity/Review";

export class ReviewController {
  private reviewRepository = AppDataSource.getRepository(Review);

  async all(request: Request, response: Response) {
    const reviews = await this.reviewRepository.find();
    return response.json(reviews);
  }

  async one(request: Request, response: Response) {
    const id = parseInt(request.params.id);

    const review = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      return response.status(404).json({ message: "Review not found" });
    }

    return response.json(review);
  }

  async save(request: Request, response: Response) {
    const {
      bookingId,
      reviewerId,
      revieweeId,
      venueId,
      rating,
      reviewType,
      comment,
    } = request.body;

    const review = Object.assign(new Review(), {
      bookingId,
      reviewerId,
      revieweeId,
      venueId,
      rating,
      reviewType,
      comment,
    });

    try {
      const savedReview = await this.reviewRepository.save(review);
      return response.status(201).json(savedReview);
    } catch (error) {
      return response.status(400).json({
        message: "Error creating review",
        error,
      });
    }
  }

  async update(request: Request, response: Response) {
    const id = parseInt(request.params.id);

    const {
      bookingId,
      reviewerId,
      revieweeId,
      venueId,
      rating,
      reviewType,
      comment,
    } = request.body;

    let reviewToUpdate = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!reviewToUpdate) {
      return response.status(404).json({ message: "Review not found" });
    }

    reviewToUpdate = Object.assign(reviewToUpdate, {
      bookingId,
      reviewerId,
      revieweeId,
      venueId,
      rating,
      reviewType,
      comment,
    });

    try {
      const updatedReview = await this.reviewRepository.save(reviewToUpdate);
      return response.json(updatedReview);
    } catch (error) {
      return response.status(400).json({
        message: "Error updating review",
        error,
      });
    }
  }

  async remove(request: Request, response: Response) {
    const id = parseInt(request.params.id);

    const reviewToRemove = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!reviewToRemove) {
      return response.status(404).json({ message: "Review not found" });
    }

    await this.reviewRepository.remove(reviewToRemove);

    return response.json({ message: "Review removed successfully" });
  }
}