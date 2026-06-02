import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";

import { Venue } from "./Venue";
import { Document } from "./Document";

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hirerId: number;

  @Column()
  venueId: number;

  @Column()
  checkIn: string;

  @Column()
  checkOut: string;

  @Column()
  nights: number;

  @Column()
  guests: number;

  @Column({ nullable: true })
  eventName: string;

  @Column({ nullable: true })
  eventTime: string;

  @Column({ nullable: true })
  eventDuration: string;

  @Column({ nullable: true })
  preferenceRank: number;
  
  //tota price for the booking
  @Column()
  total: number;
  
  //status of the booking before the vendor decides
  @Column({ default: "pending" })
  status: string;
  
  // rating for the booking
  @Column({ nullable: true })
  rating: number;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //making sure many bookings can belong to one venue
  @ManyToOne(() => Venue, (venue) => venue.bookings, { onDelete: "CASCADE" })
  @JoinColumn({ name: "venueId" })
  venue: Venue;

  //one booking can have many documents
  @OneToMany(() => Document, (document) => document.booking)
   documents: Document[];
}