import { Booking } from "./Booking";
export declare class Document {
    id: number;
    bookingId: number;
    uploadedById: number;
    venueId: number;
    documentName: string;
    documentType: "contract" | "invoice" | "policy" | "receipt" | "other";
    documentUrl: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    booking: Booking;
}
//# sourceMappingURL=Document.d.ts.map