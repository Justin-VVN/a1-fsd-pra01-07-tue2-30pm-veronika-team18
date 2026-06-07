import { Booking } from "./Booking";
import { BlockedDate } from "./BlockedDate";
import { User } from './User';
export declare class Venue {
    id: number;
    name: string;
    imgSrc: string;
    location: string;
    capacity: number;
    price: number;
    suitability: string[];
    featured: boolean;
    onSale: boolean;
    createdAt: Date;
    updatedAt: Date;
    bookings: Booking[];
    blockedDates: BlockedDate[];
    owner: User;
    ownerId: number;
    ownerFullname: string | null;
    private _setOwnerFullname;
}
//# sourceMappingURL=Venue.d.ts.map