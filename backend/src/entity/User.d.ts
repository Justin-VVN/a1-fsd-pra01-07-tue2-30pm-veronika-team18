import { Venue } from './Venue';
export declare class User {
    id: number;
    fullName: string;
    email: string;
    password: string;
    plaintextPassword: string;
    type: 'hirer' | 'vendor' | 'admin';
    createdAt: Date;
    updatedAt: Date;
    venues: Venue[];
}
//# sourceMappingURL=User.d.ts.map