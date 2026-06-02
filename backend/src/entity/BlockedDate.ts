import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

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

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}