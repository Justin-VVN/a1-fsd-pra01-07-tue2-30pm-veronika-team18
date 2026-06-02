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

  @Column()
  total: number;

  @Column({ default: "pending" })
  status: string;

  @Column({ nullable: true })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}