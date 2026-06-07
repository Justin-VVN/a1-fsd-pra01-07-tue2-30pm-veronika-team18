import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  RelationId,
  AfterLoad,
} from 'typeorm';

//importing entities for the relationships
import { Booking } from "./Booking";
import { BlockedDate } from "./BlockedDate";
import { User } from './User';

@Entity()
export class Venue {
  @PrimaryGeneratedColumn()
  id: number;

  //name of the place
  @Column()
  name: string;

  // @Column()
  // ownerId: number;

  //image source for the venue card
  @Column()
  imgSrc: string;

  @Column()
  location: string;

  @Column()
  capacity: number;

  @Column()
  price: number;

  @Column({ type: 'simple-array', nullable: true })
  suitability: string[];

  // Admin-controlled: whether this venue appears in the "Featured Venues" section
  @Column({ default: false })
  featured: boolean;

  // Admin-controlled: whether this venue is currently on sale (45% discount via GraphQL subscription)
  @Column({ default: false })
  onSale: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //making sure one venue can have many booking requests
  @OneToMany(() => Booking, (booking) => booking.venue)
  bookings: Booking[];

  // One venue can have many blocked dates/timeslots
  @OneToMany(() => BlockedDate, (blockedDate) => blockedDate.venue)
  blockedDates: BlockedDate[];

  @ManyToOne(() => User, (owner) => owner.venues, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  // store owner id from relation
  @RelationId((venue: Venue) => venue.owner)
  ownerId: number;

  // transient field populated after load for convenience in responses
  ownerFullname: string | null;

  @AfterLoad()
  private _setOwnerFullname() {
    this.ownerFullname = this.owner?.fullName ?? null;

    // this.venueOwner = {
    //   name,
    //   id,
    //   age...
    // }
  }
}