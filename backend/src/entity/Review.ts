import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bookingId: number;

  @Column()
  reviewerId: number;

  @Column()
  revieweeId: number;

  @Column()
  venueId: number;

  @Column()
  rating: number;

  @Column()
  reviewType: "hirer" | "venue";

  @Column({ nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}