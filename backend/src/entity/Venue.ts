import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Booking } from "./Booking";

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
}