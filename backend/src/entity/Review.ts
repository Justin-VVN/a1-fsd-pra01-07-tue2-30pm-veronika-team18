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
  
  //foreign key for the user/hirer being reviewed
  @Column()
  revieweeId: number;
  
  //foreign key for the venue being reviewed
  @Column()
  venueId: number;
  
  //star rating from 1 to 5.
  @Column()
  rating: number;

  @Column()
  reviewType: "hirer" | "venue";
  
  //comment from the review
  @Column({ nullable: true })
  comment: string;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}