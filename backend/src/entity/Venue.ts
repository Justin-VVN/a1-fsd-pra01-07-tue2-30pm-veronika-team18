import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

//importing entities for the relationships
import { Booking } from "./Booking";
import { BlockedDate } from "./BlockedDate";

@Entity()
export class Venue {
  @PrimaryGeneratedColumn()
  id: number;
  
  //name of the place
  @Column()
  name: string;
 
  @Column()
  ownerId: number;
 
  //image source for the venue card
  @Column()
  imgSrc: string;

  @Column()
  location: string;

  @Column()
  capacity: number;

  @Column()
  price: number;

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
}