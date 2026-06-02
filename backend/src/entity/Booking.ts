import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

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
}