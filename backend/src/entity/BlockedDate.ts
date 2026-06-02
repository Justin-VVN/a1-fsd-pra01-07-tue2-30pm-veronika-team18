import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

//import for venue relationship (many to one)
import { Venue } from "./Venue";

@Entity()
export class BlockedDate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  venueId: number;

  @Column()
  startDate: string;
  
  @Column()
  endDate: string;

   //optional reason for blocking the date.
  @Column({ nullable: true })
  reason: string;
 
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //making sure many blocked dates can belong to one venue
  @ManyToOne(() => Venue, (venue) => venue.blockedDates, { onDelete: "CASCADE" })
  @JoinColumn({ name: "venueId" })
  venue: Venue;
}