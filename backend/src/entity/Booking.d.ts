import { Venue } from "./Venue";
import { Document } from "./Document";
export declare class Booking {
    id: number;
    hirerId: number;
    venueId: number;
    checkIn: string;
    checkOut: string;
    nights: number;
    guests: number;
    eventName: string;
    eventTime: string;
    eventDuration: string;
    preferenceRank: number;
    total: number;
    status: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
    venue: Venue;
    documents: Document[];
}
//# sourceMappingURL=Booking.d.ts.map