import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Document } from "../entity/Document";

export class DocumentController {
  private documentRepository = AppDataSource.getRepository(Document);

  async all(request: Request, response: Response) {
    const documents = await this.documentRepository.find();
    return response.json(documents);
  }

  async one(request: Request, response: Response) {
    const id = parseInt(request.params.id);

    const document = await this.documentRepository.findOne({
      where: { id },
    });

    if (!document) {
      return response.status(404).json({ message: "Document not found" });
    }

    return response.json(document);
  }

  async save(request: Request, response: Response) {
    const {
      bookingId,
      uploadedById,
      venueId,
      documentName,
      documentType,
      documentUrl,
      description,
    } = request.body;

    const document = Object.assign(new Document(), {
      bookingId,
      uploadedById,
      venueId,
      documentName,
      documentType,
      documentUrl,
      description,
    });

    try {
      const savedDocument = await this.documentRepository.save(document);
      return response.status(201).json(savedDocument);
    } catch (error) {
      return response.status(400).json({
        message: "Error creating document",
        error,
      });
    }
  }

  async update(request: Request, response: Response) {
    const id = parseInt(request.params.id);

    const {
      bookingId,
      uploadedById,
      venueId,
      documentName,
      documentType,
      documentUrl,
      description,
    } = request.body;

    let documentToUpdate = await this.documentRepository.findOne({
      where: { id },
    });

    if (!documentToUpdate) {
      return response.status(404).json({ message: "Document not found" });
    }

    documentToUpdate = Object.assign(documentToUpdate, {
      bookingId,
      uploadedById,
      venueId,
      documentName,
      documentType,
      documentUrl,
      description,
    });

    try {
      const updatedDocument = await this.documentRepository.save(documentToUpdate);
      return response.json(updatedDocument);
    } catch (error) {
      return response.status(400).json({
        message: "Error updating document",
        error,
      });
    }
  }

  async remove(request: Request, response: Response) {
    const id = parseInt(request.params.id);

    const documentToRemove = await this.documentRepository.findOne({
      where: { id },
    });

    if (!documentToRemove) {
      return response.status(404).json({ message: "Document not found" });
    }

    await this.documentRepository.remove(documentToRemove);

    return response.json({ message: "Document removed successfully" });
  }
}