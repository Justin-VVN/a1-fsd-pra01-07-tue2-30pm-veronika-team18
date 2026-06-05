export default interface Venue {
    id: number;
    name: string;
    ownerId: number;
    ownerFullname: string;
    imgSrc: string;
    location: string;
    capacity: number;
    price: number;
    createdAt: string;
    updatedAt: string;
};